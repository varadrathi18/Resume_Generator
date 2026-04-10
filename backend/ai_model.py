"""
ai_model.py — Gemini AI integration with structured output, quality validation,
               token tracking, and multi-model support.
"""

import json
import logging
import os
import time

import google.generativeai as genai

from config import Config

logger = logging.getLogger(__name__)

# ── Module-level state ──────────────────────────────────────────────────

_initialized = False
_generation_stats = {
    "total_calls": 0,
    "total_tokens_approx": 0,
    "failures": 0,
}


def init_gemini():
    """Configure the Gemini client using the API key from config."""
    global _initialized
    if not Config.GEMINI_API_KEY:
        raise EnvironmentError(
            "GEMINI_API_KEY environment variable is not set. "
            "Please set it in backend/.env before starting the server."
        )
    genai.configure(api_key=Config.GEMINI_API_KEY)
    _initialized = True
    logger.info(f"✅ Gemini API initialized (model: {Config.GEMINI_MODEL_NAME})")


def _get_model(model_name: str | None = None) -> genai.GenerativeModel:
    """Create a GenerativeModel instance with configured parameters."""
    name = model_name or Config.GEMINI_MODEL_NAME
    return genai.GenerativeModel(
        name,
        generation_config=genai.types.GenerationConfig(
            temperature=Config.GEMINI_TEMPERATURE,
            top_p=Config.GEMINI_TOP_P,
        ),
    )


def generate_resume(
    prompt: str,
    model_name: str | None = None,
    max_retries: int | None = None,
) -> str:
    """
    Call Gemini to generate resume text.

    Includes:
    - Exponential-backoff retry logic
    - Response validation (must contain Markdown headings)
    - Token usage tracking
    - Detailed logging
    """
    retries = max_retries or Config.GEMINI_MAX_RETRIES
    model = _get_model(model_name)

    for attempt in range(1, retries + 1):
        try:
            start = time.perf_counter()
            response = model.generate_content(prompt)
            elapsed = time.perf_counter() - start

            text = response.text

            # Track stats
            _generation_stats["total_calls"] += 1
            _generation_stats["total_tokens_approx"] += len(text.split())

            # Basic validation: must look like a resume
            if not _validate_resume_output(text):
                logger.warning(
                    f"[Gemini] Attempt {attempt}: output failed validation, retrying..."
                )
                if attempt < retries:
                    time.sleep(2 ** attempt)
                    continue
                # On last attempt, return what we have
                logger.warning("[Gemini] Returning unvalidated output on final attempt")

            logger.info(
                f"[Gemini] Resume generated in {elapsed:.2f}s "
                f"(~{len(text.split())} words, attempt {attempt})"
            )
            return text

        except Exception as exc:
            _generation_stats["failures"] += 1
            if attempt == retries:
                raise RuntimeError(
                    f"Gemini API failed after {retries} attempts: {exc}"
                ) from exc
            wait = 2 ** attempt
            logger.warning(
                f"[Gemini] Attempt {attempt} failed ({exc}). Retrying in {wait}s…"
            )
            time.sleep(wait)

    # Should never reach here, but just in case
    raise RuntimeError("Gemini generation failed unexpectedly")


def _validate_resume_output(text: str) -> bool:
    """
    Validate that the generated text looks like a properly formatted resume.
    Returns True if the output passes basic structural checks.
    """
    if not text or len(text.strip()) < 100:
        return False

    # Must contain at least one H1 heading (the name)
    if "# " not in text:
        return False

    # Must contain at least one H2 section heading
    if "## " not in text:
        return False

    # Should contain bullet points
    has_bullets = "- " in text or "* " in text or "• " in text

    # Should not contain common LLM preambles
    bad_starts = [
        "here is", "here's", "sure", "certainly", "i'd be happy",
        "below is", "of course",
    ]
    first_line = text.strip().split("\n")[0].lower()
    has_preamble = any(first_line.startswith(bs) for bs in bad_starts)

    return has_bullets and not has_preamble


def score_resume(
    scoring_prompt: str,
    model_name: str | None = None,
) -> dict | None:
    """
    Call Gemini to score/evaluate a generated resume.
    Returns parsed JSON dict or None if parsing fails.
    """
    try:
        model = _get_model(model_name or "gemini-pro-latest")
        response = model.generate_content(scoring_prompt)
        text = response.text.strip()

        # Try to extract JSON from the response
        # Remove markdown code fences if present
        if text.startswith("\`\`\`"):
            text = text.split("\n", 1)[1] if "\n" in text else text[3:]
        if text.endswith("\`\`\`"):
            text = text[: text.rfind("\`\`\`")]
        text = text.strip()

        return json.loads(text)
    except Exception as exc:
        logger.warning(f"[Gemini] Resume scoring failed: {exc}")
        return None


def get_stats() -> dict:
    """Return generation statistics."""
    return dict(_generation_stats)
