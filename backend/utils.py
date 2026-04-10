"""
utils.py — Advanced text preprocessing and feature extraction utilities.

Provides robust text cleaning, field combination, data standardization,
and resume quality scoring for the ML pipeline and prompt engine.
"""

import re
from typing import Optional


# ── Core Text Cleaning ──────────────────────────────────────────────────

def clean_text(text: str) -> str:
    """
    Comprehensive text cleaning for ML model input.
    Removes URLs, emails, special chars, normalizes whitespace.
    """
    if not text:
        return ""
    text = str(text)

    # Remove URLs
    text = re.sub(r"https?://\S+|www\.\S+", " ", text)
    # Remove email addresses
    text = re.sub(r"\S+@\S+\.\S+", " ", text)
    # Remove phone numbers
    text = re.sub(r"[\+]?[(]?[0-9]{1,4}[)]?[-\s\./0-9]{7,15}", " ", text)
    # Lowercase
    text = text.lower()
    # Remove special characters but keep basic punctuation
    text = re.sub(r"[^a-z0-9\s.,;:'\-/+#]", " ", text)
    # Normalize whitespace
    text = re.sub(r"\s+", " ", text).strip()

    return text


def clean_text_light(text: str) -> str:
    """
    Light cleaning that preserves casing and structure.
    Used for display and prompt construction (not ML input).
    """
    if not text:
        return ""
    text = str(text).strip()
    # Normalize whitespace but preserve newlines
    text = re.sub(r"[^\S\n]+", " ", text)
    # Remove excessive blank lines
    text = re.sub(r"\n{3,}", "\n\n", text)
    return text


# ── Field Combination ───────────────────────────────────────────────────

def combine_fields(data: dict) -> str:
    """Merge all resume form fields into a single string for the classifier."""
    field_order = [
        "education", "skills", "projects", "experience",
        "role", "type", "certifications", "achievements"
    ]
    parts = [str(data.get(f, "")) for f in field_order if str(data.get(f, "")).strip()]
    return " ".join(parts)


# ── Data Standardization ───────────────────────────────────────────────

def standardize_data(data: dict) -> dict:
    """
    Clean and standardize input data.
    Strips whitespace, removes empty fields, normalizes keys.
    """
    safe_data = {}
    for k, v in data.items():
        key = k.strip().lower().replace(" ", "_")
        if isinstance(v, str):
            cleaned = v.strip()
            if cleaned:
                safe_data[key] = cleaned
        elif isinstance(v, list):
            # Handle list responses (e.g., multi-select in Google Forms)
            filtered = [str(item).strip() for item in v if str(item).strip()]
            if filtered:
                safe_data[key] = ", ".join(filtered)
        elif v is not None:
            safe_data[key] = v

    return safe_data


# ── Skills Extraction ───────────────────────────────────────────────────

TECH_SKILLS_DB = {
    "python", "java", "javascript", "typescript", "c++", "c#", "ruby", "go",
    "rust", "swift", "kotlin", "php", "scala", "r", "matlab",
    "react", "angular", "vue", "node.js", "django", "flask", "spring",
    "express", "next.js", "fastapi", "laravel",
    "aws", "azure", "gcp", "docker", "kubernetes", "terraform",
    "git", "jenkins", "ci/cd", "linux", "nginx",
    "sql", "mysql", "postgresql", "mongodb", "redis", "elasticsearch",
    "tensorflow", "pytorch", "scikit-learn", "pandas", "numpy",
    "machine learning", "deep learning", "nlp", "computer vision",
    "html", "css", "rest", "graphql", "api", "microservices",
    "agile", "scrum", "jira", "figma", "photoshop",
    "tableau", "power bi", "excel", "spark", "hadoop",
}

SOFT_SKILLS_DB = {
    "leadership", "communication", "teamwork", "problem-solving",
    "time management", "critical thinking", "adaptability",
    "project management", "collaboration", "creativity",
    "attention to detail", "analytical", "strategic planning",
    "decision making", "conflict resolution", "mentoring",
    "presentation", "negotiation", "organization",
}


def extract_skills(text: str) -> dict:
    """
    Extract recognized skills from text.
    Returns dict with 'technical' and 'soft' skill lists.
    """
    text_lower = text.lower()

    technical = [s for s in TECH_SKILLS_DB if s in text_lower]
    soft = [s for s in SOFT_SKILLS_DB if s in text_lower]

    return {
        "technical": sorted(technical),
        "soft": sorted(soft),
        "total_count": len(technical) + len(soft),
    }


# ── Resume Quality Scoring ──────────────────────────────────────────────

ACTION_VERBS = {
    "achieved", "built", "created", "delivered", "designed", "developed",
    "drove", "enhanced", "established", "executed", "generated",
    "implemented", "improved", "increased", "launched", "led",
    "managed", "optimized", "orchestrated", "pioneered", "produced",
    "reduced", "resolved", "spearheaded", "streamlined", "transformed",
}


def score_resume_quality(data: dict) -> dict:
    """
    Score the completeness and quality of user-provided resume data.
    Returns a dict with individual scores and an overall quality score.
    """
    scores = {}

    # Field completeness (0-1)
    required_fields = {"name": 10, "education": 20, "skills": 25}
    optional_fields = {"experience": 20, "projects": 15, "role": 5, "email": 3, "phone": 2}

    total_weight = sum(required_fields.values()) + sum(optional_fields.values())
    earned = 0

    for field, weight in {**required_fields, **optional_fields}.items():
        val = str(data.get(field, "")).strip()
        if val:
            # Longer content = higher score (up to a point)
            length_bonus = min(1.0, len(val) / 50)
            earned += weight * length_bonus

    scores["completeness"] = round(earned / total_weight, 2)

    # Skills richness
    all_text = combine_fields(data)
    skills_info = extract_skills(all_text)
    scores["skills_richness"] = round(min(1.0, skills_info["total_count"] / 8), 2)

    # Action verb usage
    text_lower = all_text.lower()
    verb_count = sum(1 for verb in ACTION_VERBS if verb in text_lower)
    scores["action_verbs"] = round(min(1.0, verb_count / 5), 2)

    # Quantification (numbers in experience/projects)
    exp_text = str(data.get("experience", "")) + " " + str(data.get("projects", ""))
    numbers = re.findall(r"\d+[%+]?", exp_text)
    scores["quantification"] = round(min(1.0, len(numbers) / 3), 2)

    # Overall weighted score
    weights = {
        "completeness": 0.35,
        "skills_richness": 0.25,
        "action_verbs": 0.20,
        "quantification": 0.20,
    }
    scores["overall"] = round(
        sum(scores[k] * w for k, w in weights.items()), 2
    )

    # Grade
    overall = scores["overall"]
    if overall >= 0.85:
        scores["grade"] = "A"
        scores["feedback"] = "Excellent! Your resume data is comprehensive and well-structured."
    elif overall >= 0.70:
        scores["grade"] = "B"
        scores["feedback"] = "Good foundation. Consider adding more quantifiable achievements."
    elif overall >= 0.50:
        scores["grade"] = "C"
        scores["feedback"] = "Decent start. Add more details to projects and experience."
    else:
        scores["grade"] = "D"
        scores["feedback"] = "Needs improvement. Fill in more sections with detailed content."

    return scores


# ── Google Form Field Mapping ───────────────────────────────────────────

# Maps common Google Form question titles to our internal field names
FORM_FIELD_MAPPING = {
    "full name": "name",
    "name": "name",
    "your name": "name",
    "candidate name": "name",
    "email": "email",
    "email address": "email",
    "your email": "email",
    "phone": "phone",
    "phone number": "phone",
    "contact number": "phone",
    "mobile number": "phone",
    "education": "education",
    "educational background": "education",
    "educational qualification": "education",
    "qualification": "education",
    "degree": "education",
    "skills": "skills",
    "technical skills": "skills",
    "key skills": "skills",
    "your skills": "skills",
    "projects": "projects",
    "project details": "projects",
    "key projects": "projects",
    "experience": "experience",
    "work experience": "experience",
    "professional experience": "experience",
    "internship": "experience",
    "role": "role",
    "target role": "role",
    "desired position": "role",
    "job title": "role",
    "level": "type",
    "experience level": "type",
    "professional level": "type",
    "fresher or experienced": "type",
    "certifications": "certifications",
    "achievements": "achievements",
    "awards": "achievements",
}


def map_form_fields(raw_data: dict) -> dict:
    """
    Map Google Form field titles (or any external field names)
    to our internal schema.
    """
    mapped = {}
    for raw_key, value in raw_data.items():
        normalized_key = raw_key.strip().lower()
        internal_key = FORM_FIELD_MAPPING.get(normalized_key, normalized_key)
        mapped[internal_key] = value

    return mapped
