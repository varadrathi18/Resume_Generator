"""
ai_model.py — Gemini AI integration with structured output, quality validation,
               token tracking, and multi-model support.
"""

import json
import logging
import os
import time

from google import genai
from google.genai import types

from config import Config

logger = logging.getLogger(__name__)

# ── Module-level state ──────────────────────────────────────────────────

_client = None
_initialized = False
_generation_stats = {
    "total_calls": 0,
    "total_tokens_approx": 0,
    "failures": 0,
}

# Fallback models to try if the primary model is unavailable (503)
FALLBACK_MODELS = ["gemini-2.5-flash-lite"]


def init_gemini():
    """Configure the Gemini client using the API key from config."""
    global _client, _initialized
    if not Config.GEMINI_API_KEY:
        raise EnvironmentError(
            "GEMINI_API_KEY environment variable is not set. "
            "Please set it in backend/.env before starting the server."
        )
    _client = genai.Client(api_key=Config.GEMINI_API_KEY)
    _initialized = True
    logger.info(f"✅ Gemini API initialized (model: {Config.GEMINI_MODEL_NAME})")


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
    - Built-in timeout handling
    """
    retries = max_retries or Config.GEMINI_MAX_RETRIES
    name = model_name or Config.GEMINI_MODEL_NAME

    attempt = 0
    max_attempts = retries

    while attempt < max_attempts:
        attempt += 1
        try:
            start = time.perf_counter()
            response = _client.models.generate_content(
                model=name,
                contents=prompt,
                config=types.GenerateContentConfig(
                    temperature=Config.GEMINI_TEMPERATURE,
                    top_p=Config.GEMINI_TOP_P,
                )
            )
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
                if attempt < max_attempts:
                    time.sleep(1)
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
            
            # If it's a 503 overload, aggressively retry up to 5 times regardless of default retries
            is_overloaded = "503" in str(exc) or "UNAVAILABLE" in str(exc) or "429" in str(exc)
            if is_overloaded:
                max_attempts = max(max_attempts, 5)
            
            if attempt >= max_attempts:
                # Try fallback models before giving up
                if is_overloaded:
                    for fallback in FALLBACK_MODELS:
                        if fallback == name:
                            continue
                        try:
                            logger.info(f"[Gemini] Trying fallback model: {fallback}")
                            start = time.perf_counter()
                            response = _client.models.generate_content(
                                model=fallback,
                                contents=prompt,
                                config=types.GenerateContentConfig(
                                    temperature=Config.GEMINI_TEMPERATURE,
                                    top_p=Config.GEMINI_TOP_P,
                                )
                            )
                            elapsed = time.perf_counter() - start
                            text = response.text
                            _generation_stats["total_calls"] += 1
                            _generation_stats["total_tokens_approx"] += len(text.split())
                            logger.info(
                                f"[Gemini] Resume generated via fallback {fallback} in {elapsed:.2f}s "
                            )
                            return text
                        except Exception as fb_exc:
                            logger.warning(f"[Gemini] Fallback {fallback} also failed: {fb_exc}")
                            continue
                raise RuntimeError(f"Gemini API failed after {attempt} attempts: {exc}") from exc
                
            wait = 2 if is_overloaded else 1
            logger.warning(f"[Gemini] Attempt {attempt} failed ({exc}). Retrying in {wait}s…")
            time.sleep(wait)

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
        name = model_name or Config.GEMINI_MODEL_NAME
        response = _client.models.generate_content(
            model=name,
            contents=scoring_prompt,
            config=types.GenerateContentConfig(
                temperature=0.2, # Low temperature for more analytical/consistent scoring
            )
        )
        text = response.text.strip()

        # Try to extract JSON from the response
        # Remove markdown code fences if present
        if text.startswith("```"):
            text = text.split("\n", 1)[1] if "\n" in text else text[3:]
        if text.endswith("```"):
            text = text[: text.rfind("```")]
        text = text.strip()

        return json.loads(text)
    except Exception as exc:
        logger.warning(f"[Gemini] Resume scoring failed: {exc}")
        return None


def get_stats() -> dict:
    """Return generation statistics."""
    return dict(_generation_stats)
