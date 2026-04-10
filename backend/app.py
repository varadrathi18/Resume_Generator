"""
app.py — Main Flask server for the AI-Powered Domain-Aware Resume Generator.

Production-grade entry point with:
  • Dual ML model loading (DistilBERT + TF-IDF)
  • Frontend-driven resume generation
  • Email delivery support
  • Resume quality scoring
  • Request logging and health monitoring
  • Static file serving for production builds
"""

import logging
import os
import sys
import time
import traceback

from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS

from config import Config
from utils import clean_text, combine_fields, standardize_data, score_resume_quality
from prompt_engine import build_prompt, build_scoring_prompt
from ai_model import init_gemini, generate_resume, score_resume, get_stats
from formatter import to_html, to_pdf, to_docx, GENERATED_DIR
from domain_classifier import DomainClassifier
from email_service import send_resume_email
from db import save_resume_record
from auth import auth_bp, token_required

# ── Logging setup ──────────────────────────────────────────────────────

logging.basicConfig(
    level=getattr(logging, Config.LOG_LEVEL, logging.INFO),
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
    datefmt="%Y-%m-%d %H:%M:%S",
    stream=sys.stdout,
)
logger = logging.getLogger(__name__)


# ── App factory ────────────────────────────────────────────────────────

app = Flask(
    __name__,
    static_folder=os.path.join(os.path.dirname(__file__), "static"),
    static_url_path="",
)
CORS(app, origins=Config.ALLOWED_ORIGINS.split(","))

app.register_blueprint(auth_bp, url_prefix='/api/auth')


# ── Load ML models on startup ─────────────────────────────────────────

classifier = DomainClassifier()
model_status = classifier.load_models()
logger.info(f"ML model status: {model_status}")


# ── Initialize Gemini ──────────────────────────────────────────────────

gemini_ready = False
try:
    init_gemini()
    gemini_ready = True
except EnvironmentError as e:
    logger.warning(f"⚠️  {e}")


# ── Validate config at startup ─────────────────────────────────────────

for warning in Config.validate():
    logger.warning(f"⚠️  {warning}")

logger.info(f"📊 Config: {Config.status_dict()}")


# ── Request logging middleware ─────────────────────────────────────────

@app.before_request
def log_request():
    if Config.LOG_REQUESTS and request.path not in ("/", "/health", "/api/health"):
        request._start_time = time.perf_counter()
        logger.info(f"→ {request.method} {request.path}")


@app.after_request
def log_response(response):
    if Config.LOG_REQUESTS and hasattr(request, "_start_time"):
        elapsed = (time.perf_counter() - request._start_time) * 1000
        logger.info(f"← {response.status_code} ({elapsed:.0f}ms)")
    return response


# ── API Routes ──────────────────────────────────────────────────────────

@app.route("/api/health", methods=["GET"])
def health_check():
    """Detailed health check endpoint."""
    return jsonify({
        "status": "ok",
        "message": "AI Resume Generator API is running",
        "models": classifier.status,
        "gemini_ready": gemini_ready,
        "email_enabled": Config.EMAIL_ENABLED,
        "ai_stats": get_stats(),
    })


@app.route("/api/generate", methods=["POST"])
@token_required
def generate(current_user):
    """
    Main resume generation endpoint.

    Accepts user data, classifies domain, generates resume via Gemini,
    formats it to PDF/DOCX/HTML, and optionally emails it.
    """
    data = request.get_json(force=True)

    # Validate required fields
    required = ["name", "education", "skills"]
    missing = [f for f in required if not data.get(f) or not str(data.get(f)).strip()]
    if missing:
        return jsonify({"error": f"Missing fields: {', '.join(missing)}"}), 400

    try:
        # 1. Standardize & clean
        data = standardize_data(data)
        combined = combine_fields(data)
        cleaned = clean_text(combined)

        # 2. Classify domain with confidence scoring
        classification = classifier.predict(cleaned, mode="auto")
        domain = classification.domain
        confidence = classification.confidence

        # 3. Score input quality
        quality_scores = score_resume_quality(data)

        # 4. Build prompt & generate
        prompt = build_prompt(data, domain, confidence)
        resume_text = generate_resume(prompt)

        # 5. Format outputs — use person's name for file naming
        person_name = data.get("name", "")
        resume_html = to_html(resume_text)
        pdf_path = to_pdf(resume_text, name=person_name)
        docx_path = to_docx(resume_text, name=person_name)

        pdf_filename = os.path.basename(pdf_path)
        docx_filename = os.path.basename(docx_path)

        # 6. Optional: score the generated resume
        resume_score = None
        try:
            scoring_prompt = build_scoring_prompt(resume_text, domain)
            resume_score = score_resume(scoring_prompt)
        except Exception:
            pass  # Non-critical, don't fail the request

        # 7. Optional: email the resume
        email_status = None
        user_email = data.get("email", "").strip()
        if user_email and Config.EMAIL_ENABLED:
            email_status = send_resume_email(
                to_email=user_email,
                name=data.get("name", "Candidate"),
                domain=domain,
                pdf_path=pdf_path,
                docx_path=docx_path,
                quality_grade=quality_scores.get("grade", "B"),
            )

        # 8. Store history in MongoDB
        record_id = save_resume_record(
            name=person_name,
            email=user_email,
            target_role=data.get("role", ""),
            domain=domain,
            confidence=confidence,
            ats_score=resume_score.get("ats_score", "N/A") if resume_score else "N/A",
            quality_grade=quality_scores.get("grade", "B"),
            pdf_filename=pdf_filename,
            docx_filename=docx_filename
        )

        response_data = {
            "domain": domain,
            "classification": classification.to_dict(),
            "quality_scores": quality_scores,
            "resume_text": resume_text,
            "resume_html": resume_html,
            "pdf_url": f"/api/download/{pdf_filename}",
            "docx_url": f"/api/download/{docx_filename}",
            "pdf_filename": pdf_filename,
            "docx_filename": docx_filename,
        }

        if record_id:
            response_data["record_id"] = record_id

        if resume_score:
            response_data["resume_score"] = resume_score

        if email_status:
            response_data["email_status"] = email_status

        return jsonify(response_data)

    except Exception as exc:
        traceback.print_exc()
        logger.error(f"Generation failed: {exc}")
        return jsonify({"error": str(exc)}), 500


@app.route("/api/classify", methods=["POST"])
def classify_only():
    """
    Classify domain without generating a resume.
    Useful for real-time form feedback and research evaluation.
    """
    data = request.get_json(force=True)
    text = data.get("text", "")
    if not text.strip():
        fields = standardize_data(data)
        text = combine_fields(fields)

    cleaned = clean_text(text)
    if not cleaned:
        return jsonify({"error": "No text provided for classification"}), 400

    mode = data.get("mode", "auto")
    result = classifier.predict(cleaned, mode=mode)

    return jsonify(result.to_dict())


@app.route("/api/download/<filename>", methods=["GET"])
def download_file(filename):
    """Download a generated resume file."""
    return send_from_directory(GENERATED_DIR, filename, as_attachment=True)


# ── Static file serving (production) ────────────────────────────────────

@app.route("/", defaults={"path": ""})
@app.route("/<path:path>")
def serve_frontend(path):
    """Serve the React frontend in production."""
    static_dir = app.static_folder
    if static_dir and os.path.exists(os.path.join(static_dir, path)):
        return send_from_directory(static_dir, path)
    # Fallback to index.html for client-side routing
    if static_dir and os.path.exists(os.path.join(static_dir, "index.html")):
        return send_from_directory(static_dir, "index.html")
    return jsonify({
        "status": "ok",
        "message": "AI Resume Generator API. Frontend not built yet — run `npm run build` in /frontend.",
    })


# ── Main ───────────────────────────────────────────────────────────────

if __name__ == "__main__":
    logger.info(f"🚀 Starting server on port {Config.SERVER_PORT}")
    app.run(
        debug=Config.DEBUG,
        port=Config.SERVER_PORT,
        host="0.0.0.0",
    )
