"""
config.py — Centralized configuration management.
Loads environment variables, validates them, and provides feature flags.
"""

import os
from dotenv import load_dotenv

load_dotenv()


class Config:
    """Application configuration loaded from environment variables."""

    # ── Gemini AI ─────────────────────────────────────────────────────────
    GEMINI_API_KEY: str = os.getenv("GEMINI_API_KEY", "")
    GEMINI_MODEL_NAME: str = os.getenv("GEMINI_MODEL_NAME", "gemini-1.5-pro")
    GEMINI_TEMPERATURE: float = float(os.getenv("GEMINI_TEMPERATURE", "0.7"))
    GEMINI_TOP_P: float = float(os.getenv("GEMINI_TOP_P", "0.95"))
    GEMINI_MAX_RETRIES: int = int(os.getenv("GEMINI_MAX_RETRIES", "2"))

    # ── ML Models ─────────────────────────────────────────────────────────
    MODELS_DIR: str = os.path.join(os.path.dirname(__file__), "models")
    USE_TRANSFORMER_MODEL: bool = os.getenv("USE_TRANSFORMER_MODEL", "false").lower() == "true"
    TRANSFORMER_MODEL_PATH: str = os.path.join(
        os.path.dirname(__file__), "models", "resume_classifier_model"
    )
    TFIDF_VECTORIZER_PATH: str = os.path.join(
        os.path.dirname(__file__), "models", "tfidf_vectorizer.pkl"
    )
    CLASSIFIER_PATH: str = os.path.join(
        os.path.dirname(__file__), "models", "resume_classifier.pkl"
    )
    LABEL_MAPPING_PATH: str = os.path.join(
        os.path.dirname(__file__), "models", "label_mapping.json"
    )
    LABEL_ENCODER_PATH: str = os.path.join(
        os.path.dirname(__file__), "models", "label_encoder.pkl"
    )

    # ── Email (SMTP) ─────────────────────────────────────────────────────
    SMTP_HOST: str = os.getenv("SMTP_HOST", "smtp.gmail.com")
    SMTP_PORT: int = int(os.getenv("SMTP_PORT", "587"))
    SMTP_USER: str = os.getenv("SMTP_USER", "")
    SMTP_PASSWORD: str = os.getenv("SMTP_PASSWORD", "")
    EMAIL_FROM_NAME: str = os.getenv("EMAIL_FROM_NAME", "ResumeAI")
    EMAIL_ENABLED: bool = bool(SMTP_USER and SMTP_PASSWORD)

    # ── Server ───────────────────────────────────────────────────────────
    SERVER_PORT: int = int(os.getenv("PORT", "8080"))
    DEBUG: bool = os.getenv("FLASK_DEBUG", "false").lower() == "true"
    ALLOWED_ORIGINS: str = os.getenv("ALLOWED_ORIGINS", "*")

    # ── Output ───────────────────────────────────────────────────────────
    GENERATED_DIR: str = os.path.join(os.path.dirname(__file__), "generated")
    CLEANUP_MAX_AGE_HOURS: int = int(os.getenv("CLEANUP_MAX_AGE_HOURS", "24"))

    # ── Database ─────────────────────────────────────────────────────────
    MONGODB_URI: str = os.getenv("MONGODB_URI", "")
    MONGODB_DB_NAME: str = os.getenv("MONGODB_DB_NAME", "Resume_Generator")

    # ── Logging ──────────────────────────────────────────────────────────
    LOG_LEVEL: str = os.getenv("LOG_LEVEL", "INFO")
    LOG_REQUESTS: bool = os.getenv("LOG_REQUESTS", "true").lower() == "true"

    @classmethod
    def validate(cls) -> list[str]:
        """Validate configuration and return list of warnings."""
        warnings = []
        if not cls.GEMINI_API_KEY:
            warnings.append("GEMINI_API_KEY is not set — AI generation will fail.")
        if not cls.EMAIL_ENABLED:
            warnings.append("SMTP credentials not set — email delivery disabled.")
        return warnings

    @classmethod
    def status_dict(cls) -> dict:
        """Return a dict summarizing the config status (safe to expose)."""
        return {
            "gemini_configured": bool(cls.GEMINI_API_KEY),
            "gemini_model": cls.GEMINI_MODEL_NAME,
            "transformer_model_enabled": cls.USE_TRANSFORMER_MODEL,
            "email_enabled": cls.EMAIL_ENABLED,
            "debug_mode": cls.DEBUG,
        }
