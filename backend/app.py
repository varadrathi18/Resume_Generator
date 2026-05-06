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
import concurrent.futures
import re

from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS

from config import Config
from utils import clean_text, combine_fields, standardize_data, score_resume_quality
from prompt_engine import build_prompt, build_scoring_prompt
from ai_model import init_gemini, generate_resume, score_resume, get_stats
from formatter import to_html, to_pdf, to_docx, GENERATED_DIR
from domain_classifier import DomainClassifier
from email_service import send_resume_email
from db import save_resume_record, get_user_resumes, update_user_profile
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


# ── Background thread pool (module-level so threads outlive requests) ──

_background_executor = concurrent.futures.ThreadPoolExecutor(max_workers=2)


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
logger.info(f"📧 Email enabled: {Config.EMAIL_ENABLED} (BREVO={'SET' if Config.BREVO_API_KEY else 'EMPTY'}, SMTP_USER={'SET' if Config.SMTP_USER else 'EMPTY'})")


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


# ── Input Validation Helpers ─────────────────────────────────────────────

# Patterns that indicate the user didn't provide real content
_PLACEHOLDER_PATTERNS = re.compile(
    r'^\s*('
    r'none|n/?a|na|nil|null|no|nothing|not applicable|not provided|'
    r'no experience|no projects|no skills|no education|'
    r'\-|\.|x+|0+|test|asdf|qwer|placeholder'
    r')\s*$',
    re.IGNORECASE,
)


def _is_placeholder(value: str) -> bool:
    """Return True if the value is empty or a common placeholder like 'none', 'n/a', etc."""
    if not value or not value.strip():
        return True
    return bool(_PLACEHOLDER_PATTERNS.match(value.strip()))


def _validate_field_content(field_name: str, value: str, min_length: int = 5) -> str | None:
    """
    Validate a single form field. Returns an error message if invalid, else None.
    """
    if _is_placeholder(value):
        return f"{field_name} cannot be empty or a placeholder (e.g. 'none', 'n/a')"
    if len(value.strip()) < min_length:
        return f"{field_name} is too short — please provide at least {min_length} characters of real content"
    return None


@app.route("/api/generate", methods=["POST"])
@token_required
def generate(current_user):
    """
    Main resume generation endpoint.

    Accepts user data, classifies domain, generates resume via Gemini,
    formats it to PDF/DOCX/HTML, and optionally emails it.

    Optimized: Returns the response immediately after generation.
    Scoring, email, and DB save happen in background threads.
    """
    data = request.get_json(force=True)

    # ── Strict field validation ────────────────────────────────────
    # Required fields must exist and contain real content (not "none", "n/a", etc.)
    validation_errors = []
    for field, label, min_len in [
        ("name", "Full Name", 2),
        ("education", "Education", 10),
        ("skills", "Skills", 5),
    ]:
        raw_value = str(data.get(field, "")).strip()
        err = _validate_field_content(label, raw_value, min_len)
        if err:
            validation_errors.append(err)

    if validation_errors:
        return jsonify({"error": "; ".join(validation_errors)}), 400

    # Strip out optional fields that are placeholders so Gemini never sees them
    for opt_field in ["experience", "projects", "certifications", "achievements", "role"]:
        val = str(data.get(opt_field, "")).strip()
        if _is_placeholder(val):
            data.pop(opt_field, None)

    try:
        # 1. Standardize & clean
        data = standardize_data(data)
        combined = combine_fields(data)
        cleaned = clean_text(combined)

        # 2. Classify domain with confidence scoring
        classification = classifier.predict(cleaned, mode="auto")
        domain = classification.domain
        confidence = classification.confidence

        # 3. Score input quality (instant, no API call)
        quality_scores = score_resume_quality(data)

        # 4. Build prompt & generate (this is the only slow step now)
        prompt = build_prompt(data, domain, confidence)
        resume_text = generate_resume(prompt)

        # 5. Format outputs
        person_name = data.get("name", "")
        resume_html = to_html(resume_text)
        pdf_path = to_pdf(resume_text, name=person_name)
        docx_path = to_docx(resume_text, name=person_name)

        pdf_filename = os.path.basename(pdf_path)
        docx_filename = os.path.basename(docx_path)

        # 6. Score the resume (synchronous — needed for frontend display)
        resume_score = None
        try:
            scoring_prompt = build_scoring_prompt(resume_text, domain)
            resume_score = score_resume(scoring_prompt)
            logger.info(f"Resume scored: {resume_score}")
        except Exception as e:
            logger.warning(f"Resume scoring failed: {e}")

        # Build the response with scoring data included
        response_data = {
            "domain": domain,
            "classification": classification.to_dict(),
            "quality_scores": quality_scores,
            "resume_score": resume_score,
            "resume_text": resume_text,
            "resume_html": resume_html,
            "pdf_url": f"/api/download/{pdf_filename}",
            "docx_url": f"/api/download/{docx_filename}",
            "pdf_filename": pdf_filename,
            "docx_filename": docx_filename,
        }

        # 7. Fire-and-forget: email and DB save in background
        user_email = current_user.get("email", "").strip() if current_user else data.get("email", "").strip()
        logger.info(f"📧 Email decision: user_email='{user_email}', EMAIL_ENABLED={Config.EMAIL_ENABLED}, SMTP_USER={'SET' if Config.SMTP_USER else 'EMPTY'}")

        def _background_tasks():
            """Run non-critical tasks after the response is sent."""
            try:
                # Email the resume
                if user_email and Config.EMAIL_ENABLED:
                    logger.info(f"📧 Attempting to send resume email to {user_email}...")
                    try:
                        email_result = send_resume_email(
                            to_email=user_email,
                            name=data.get("name", "Candidate"),
                            domain=domain,
                            pdf_path=pdf_path,
                            docx_path=docx_path,
                            quality_grade=quality_scores.get("grade", "B"),
                        )
                        logger.info(f"📧 Email result: {email_result}")
                    except Exception as e:
                        logger.error(f"📧 Background email EXCEPTION: {e}", exc_info=True)
                else:
                    logger.warning(f"📧 Email SKIPPED: user_email={'EMPTY' if not user_email else user_email}, EMAIL_ENABLED={Config.EMAIL_ENABLED}")

                # Save to MongoDB
                # Compute a fallback score if Gemini scoring failed
                final_ats = "N/A"
                if resume_score and resume_score.get("ats_score"):
                    final_ats = str(resume_score["ats_score"])
                elif resume_score and resume_score.get("overall_score"):
                    final_ats = str(resume_score["overall_score"])
                else:
                    # Simple heuristic fallback so we never store "N/A"
                    try:
                        text_lower = resume_text.lower()
                        section_count = sum(1 for h in ['summary', 'skills', 'experience', 'education', 'projects'] if h in text_lower)
                        bullet_count = len([l for l in resume_text.split('\n') if l.strip().startswith(('-', '•', '*'))])
                        word_count = len(resume_text.split())
                        fallback = min(95, max(45, int(section_count * 12 + bullet_count * 3 + min(word_count / 10, 20))))
                        final_ats = str(fallback)
                    except Exception:
                        final_ats = "65"

                save_resume_record(
                    name=person_name,
                    email=user_email,
                    target_role=data.get("role", ""),
                    domain=domain,
                    confidence=confidence,
                    ats_score=final_ats,
                    quality_grade=quality_scores.get("grade", "B"),
                    pdf_filename=pdf_filename,
                    docx_filename=docx_filename,
                )
            except Exception as e:
                logger.error(f"Background tasks failed: {e}")

        # Launch background tasks (non-blocking, uses module-level executor)
        _background_executor.submit(_background_tasks)

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


@app.route("/api/resumes/update-score", methods=["POST"])
@token_required
def update_resume_score(current_user):
    """
    Update the ATS score for a resume record.
    Called by the frontend after it computes / receives the score so that
    Dashboard and Impact Scores pages always reflect the latest value.
    """
    data = request.get_json(force=True)
    pdf_filename = data.get("pdf_filename")
    ats_score = data.get("ats_score")

    if not pdf_filename or ats_score is None:
        return jsonify({"error": "pdf_filename and ats_score are required"}), 400

    try:
        from db import resumes_collection, db_ready
        if not db_ready or resumes_collection is None:
            return jsonify({"error": "Database not available"}), 503

        update_fields = {"ats_score": str(ats_score)}

        # Optionally persist the full score breakdown
        score_breakdown = data.get("score_breakdown")
        if score_breakdown and isinstance(score_breakdown, dict):
            update_fields["score_breakdown"] = score_breakdown

        result = resumes_collection.update_one(
            {"email": current_user["email"], "files.pdf": pdf_filename},
            {"$set": update_fields},
        )

        if result.modified_count > 0:
            logger.info(f"✅ Updated ATS score for {pdf_filename} → {ats_score}")
        else:
            logger.info(f"ℹ️  No matching resume found for {pdf_filename} (may not be saved yet)")

        return jsonify({"ok": True, "modified": result.modified_count}), 200
    except Exception as e:
        logger.error(f"Failed to update resume score: {e}")
        return jsonify({"error": "Failed to update score"}), 500


@app.route("/api/resumes", methods=["GET"])
@token_required
def get_resumes(current_user):
    """Fetch user's resume history."""
    try:
        resumes = get_user_resumes(current_user["email"])
        return jsonify({"resumes": resumes}), 200
    except Exception as e:
        logger.error(f"Error fetching resumes: {e}")
        return jsonify({"error": "Failed to fetch resumes"}), 500


@app.route("/api/user/profile", methods=["GET", "PUT"])
@token_required
def user_profile(current_user):
    """Get or update user profile."""
    if request.method == "GET":
        # Remove sensitive info
        profile = {
            "name": current_user.get("name"),
            "email": current_user.get("email"),
            "auth_provider": current_user.get("auth_provider", "local"),
            "theme": current_user.get("theme", "dark"),
            "email_notifications": current_user.get("email_notifications", True)
        }
        return jsonify({"profile": profile}), 200
        
    elif request.method == "PUT":
        data = request.get_json(force=True)
        success = update_user_profile(current_user["email"], data)
        if success:
            return jsonify({"message": "Profile updated successfully"}), 200
        return jsonify({"error": "Failed to update profile"}), 500


# ── Static file serving (production) ────────────────────────────────────

@app.route("/", defaults={"path": ""})
@app.route("/<path:path>")
def serve_frontend(path):
    """Serve the React frontend in production."""
    static_dir = app.static_folder
    if not static_dir:
        return jsonify({
            "status": "ok",
            "message": "AI Resume Generator API. Frontend not built yet.",
        })
    # If path is empty (root URL) or doesn't map to a real file, serve index.html
    if path and os.path.isfile(os.path.join(static_dir, path)):
        return send_from_directory(static_dir, path)
    # Fallback to index.html for client-side routing (SPA)
    index_path = os.path.join(static_dir, "index.html")
    if os.path.exists(index_path):
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
