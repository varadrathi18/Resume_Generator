"""
domain_classifier.py — Dual-model domain classification with confidence scoring.

Architecture:
  • Primary:  Fine-tuned DistilBERT transformer (~86% F1 on real resume data)
  • Fallback: TF-IDF + Logistic Regression (lightweight, fast)
  • Ensemble: Weighted average of both models' probability distributions

This module is the core ML component of the system and the primary
contribution described in the accompanying research paper.
"""

import json
import logging
import os
import time
from dataclasses import dataclass, field

import joblib
import numpy as np

from config import Config

logger = logging.getLogger(__name__)

# ── Domain metadata ─────────────────────────────────────────────────────

DOMAIN_LABELS = [
    "BUSINESS", "CREATIVE", "EDUCATION", "HEALTH", "LEGAL_ADMIN", "OTHER", "TECH"
]

DOMAIN_DISPLAY_NAMES = {
    "TECH": "Technology & Engineering",
    "BUSINESS": "Business & Finance",
    "CREATIVE": "Creative & Design",
    "HEALTH": "Healthcare & Medical",
    "LEGAL_ADMIN": "Legal & Administration",
    "EDUCATION": "Education & Research",
    "OTHER": "Multi-Disciplinary",
}


@dataclass
class ClassificationResult:
    """Structured result from domain classification."""
    domain: str
    confidence: float
    all_probabilities: dict = field(default_factory=dict)
    model_used: str = "unknown"
    inference_time_ms: float = 0.0
    secondary_domain: str = ""
    secondary_confidence: float = 0.0

    def to_dict(self) -> dict:
        return {
            "domain": self.domain,
            "domain_display": DOMAIN_DISPLAY_NAMES.get(self.domain, self.domain),
            "confidence": round(self.confidence, 4),
            "model_used": self.model_used,
            "inference_time_ms": round(self.inference_time_ms, 2),
            "secondary_domain": self.secondary_domain,
            "secondary_confidence": round(self.secondary_confidence, 4),
            "all_probabilities": {
                k: round(v, 4) for k, v in self.all_probabilities.items()
            },
        }


class DomainClassifier:
    """
    Dual-model domain classifier with ensemble support.

    Loads both a transformer (DistilBERT) and a traditional ML model
    (TF-IDF + LogisticRegression). Can run either independently or
    as a weighted ensemble for maximum accuracy.
    """

    def __init__(self):
        self.tfidf_vectorizer = None
        self.tfidf_classifier = None
        self.tfidf_ready = False

        self.transformer_model = None
        self.transformer_tokenizer = None
        self.transformer_label_encoder = None
        self.transformer_ready = False

        self.label_mapping: dict = {}

    def load_models(self) -> dict:
        """Load all available models. Returns status dict."""
        status = {"tfidf": False, "transformer": False}

        # ── Load TF-IDF + LR ────────────────────────────────────────────
        try:
            self.tfidf_vectorizer = joblib.load(Config.TFIDF_VECTORIZER_PATH)
            self.tfidf_classifier = joblib.load(Config.CLASSIFIER_PATH)
            if os.path.exists(Config.LABEL_MAPPING_PATH):
                with open(Config.LABEL_MAPPING_PATH, "r") as f:
                    self.label_mapping = json.load(f)
            self.tfidf_ready = True
            status["tfidf"] = True
            logger.info("✅ TF-IDF + LogisticRegression model loaded")
        except Exception as exc:
            logger.warning(f"⚠️  TF-IDF model load failed: {exc}")

        # ── Load Transformer (DistilBERT) ────────────────────────────────
        if Config.USE_TRANSFORMER_MODEL:
            try:
                from transformers import (
                    AutoModelForSequenceClassification,
                    AutoTokenizer,
                )

                model_path = Config.TRANSFORMER_MODEL_PATH
                if not os.path.exists(model_path):
                    logger.warning(f"⚠️  Transformer model not found at {model_path}")
                else:
                    self.transformer_tokenizer = AutoTokenizer.from_pretrained(model_path)
                    self.transformer_model = AutoModelForSequenceClassification.from_pretrained(
                        model_path
                    )
                    self.transformer_model.eval()

                    # Load label encoder
                    if os.path.exists(Config.LABEL_ENCODER_PATH):
                        self.transformer_label_encoder = joblib.load(
                            Config.LABEL_ENCODER_PATH
                        )

                    self.transformer_ready = True
                    status["transformer"] = True
                    logger.info("✅ DistilBERT transformer model loaded")
            except ImportError:
                logger.warning(
                    "⚠️  transformers/torch not installed — transformer model disabled"
                )
            except Exception as exc:
                logger.warning(f"⚠️  Transformer model load failed: {exc}")

        return status

    def predict_tfidf(self, text: str) -> ClassificationResult:
        """Classify using TF-IDF + Logistic Regression."""
        if not self.tfidf_ready:
            raise RuntimeError("TF-IDF model not loaded")

        start = time.perf_counter()
        vec = self.tfidf_vectorizer.transform([text])
        pred = self.tfidf_classifier.predict(vec)[0]
        proba = self.tfidf_classifier.predict_proba(vec)[0]
        elapsed = (time.perf_counter() - start) * 1000

        classes = list(self.tfidf_classifier.classes_)
        prob_dict = dict(zip(classes, proba.tolist()))

        # Sort to get top-2
        sorted_probs = sorted(prob_dict.items(), key=lambda x: x[1], reverse=True)

        return ClassificationResult(
            domain=str(pred),
            confidence=float(max(proba)),
            all_probabilities=prob_dict,
            model_used="tfidf_logistic_regression",
            inference_time_ms=elapsed,
            secondary_domain=sorted_probs[1][0] if len(sorted_probs) > 1 else "",
            secondary_confidence=sorted_probs[1][1] if len(sorted_probs) > 1 else 0.0,
        )

    def predict_transformer(self, text: str) -> ClassificationResult:
        """Classify using the fine-tuned DistilBERT transformer."""
        if not self.transformer_ready:
            raise RuntimeError("Transformer model not loaded")

        import torch

        start = time.perf_counter()

        inputs = self.transformer_tokenizer(
            text,
            padding="max_length",
            truncation=True,
            max_length=256,
            return_tensors="pt",
        )

        with torch.no_grad():
            outputs = self.transformer_model(**inputs)
            logits = outputs.logits
            probs = torch.nn.functional.softmax(logits, dim=-1).squeeze().numpy()

        elapsed = (time.perf_counter() - start) * 1000

        pred_idx = int(np.argmax(probs))

        # Map index to label
        if self.transformer_label_encoder is not None:
            classes = list(self.transformer_label_encoder.classes_)
        else:
            classes = DOMAIN_LABELS

        pred_label = classes[pred_idx] if pred_idx < len(classes) else "OTHER"
        prob_dict = {
            classes[i]: float(probs[i])
            for i in range(min(len(classes), len(probs)))
        }

        sorted_probs = sorted(prob_dict.items(), key=lambda x: x[1], reverse=True)

        return ClassificationResult(
            domain=pred_label,
            confidence=float(probs[pred_idx]),
            all_probabilities=prob_dict,
            model_used="distilbert_transformer",
            inference_time_ms=elapsed,
            secondary_domain=sorted_probs[1][0] if len(sorted_probs) > 1 else "",
            secondary_confidence=sorted_probs[1][1] if len(sorted_probs) > 1 else 0.0,
        )

    def predict_ensemble(
        self, text: str, transformer_weight: float = 0.7
    ) -> ClassificationResult:
        """
        Ensemble prediction combining both models.
        Weighted average of probability distributions.
        """
        tfidf_weight = 1.0 - transformer_weight

        results = {}
        models_used = []
        total_time = 0.0

        # Get TF-IDF predictions
        if self.tfidf_ready:
            tfidf_result = self.predict_tfidf(text)
            results["tfidf"] = tfidf_result
            models_used.append("tfidf")
            total_time += tfidf_result.inference_time_ms

        # Get transformer predictions
        if self.transformer_ready:
            trans_result = self.predict_transformer(text)
            results["transformer"] = trans_result
            models_used.append("transformer")
            total_time += trans_result.inference_time_ms

        # If only one model is available, return its result
        if len(results) == 1:
            single = list(results.values())[0]
            single.model_used = f"{single.model_used} (single)"
            return single

        if len(results) == 0:
            return ClassificationResult(
                domain="OTHER",
                confidence=0.0,
                model_used="none",
                inference_time_ms=0.0,
            )

        # Ensemble: weighted average of probabilities
        all_domains = set()
        for r in results.values():
            all_domains.update(r.all_probabilities.keys())

        ensemble_probs = {}
        for domain in all_domains:
            tfidf_p = results.get("tfidf", ClassificationResult(domain="", confidence=0.0)).all_probabilities.get(domain, 0.0)
            trans_p = results.get("transformer", ClassificationResult(domain="", confidence=0.0)).all_probabilities.get(domain, 0.0)
            ensemble_probs[domain] = tfidf_p * tfidf_weight + trans_p * transformer_weight

        # Normalize
        total = sum(ensemble_probs.values())
        if total > 0:
            ensemble_probs = {k: v / total for k, v in ensemble_probs.items()}

        sorted_probs = sorted(ensemble_probs.items(), key=lambda x: x[1], reverse=True)
        best_domain = sorted_probs[0][0]
        best_conf = sorted_probs[0][1]

        return ClassificationResult(
            domain=best_domain,
            confidence=best_conf,
            all_probabilities=ensemble_probs,
            model_used="ensemble",
            inference_time_ms=total_time,
            secondary_domain=sorted_probs[1][0] if len(sorted_probs) > 1 else "",
            secondary_confidence=sorted_probs[1][1] if len(sorted_probs) > 1 else 0.0,
        )

    def predict(self, text: str, mode: str = "auto") -> ClassificationResult:
        """
        Main prediction entry point.

        Args:
            text: Preprocessed resume text
            mode: "auto" | "ensemble" | "transformer" | "tfidf"
                  auto = use best available (transformer > tfidf)
        """
        if mode == "ensemble" and (self.tfidf_ready or self.transformer_ready):
            return self.predict_ensemble(text)
        elif mode == "transformer" and self.transformer_ready:
            return self.predict_transformer(text)
        elif mode == "tfidf" and self.tfidf_ready:
            return self.predict_tfidf(text)
        elif mode == "auto":
            # Use ensemble if both available, else best single
            if self.transformer_ready and self.tfidf_ready:
                return self.predict_ensemble(text)
            elif self.transformer_ready:
                return self.predict_transformer(text)
            elif self.tfidf_ready:
                return self.predict_tfidf(text)

        # Ultimate fallback
        return ClassificationResult(
            domain="OTHER",
            confidence=0.0,
            model_used="fallback_default",
            inference_time_ms=0.0,
        )

    @property
    def is_ready(self) -> bool:
        return self.tfidf_ready or self.transformer_ready

    @property
    def status(self) -> dict:
        return {
            "tfidf_ready": self.tfidf_ready,
            "transformer_ready": self.transformer_ready,
            "available_modes": [
                m for m, ok in [
                    ("tfidf", self.tfidf_ready),
                    ("transformer", self.transformer_ready),
                    ("ensemble", self.tfidf_ready and self.transformer_ready),
                ]
                if ok
            ],
        }
