"""
db.py — MongoDB integration for persisting resume generation history.
"""

import logging
from datetime import datetime
import certifi
from pymongo import MongoClient
from pymongo.errors import ConnectionFailure, ConfigurationError

from config import Config

logger = logging.getLogger(__name__)

db = None
resumes_collection = None
users_collection = None
db_ready = False

if Config.MONGODB_URI:
    try:
        client = MongoClient(Config.MONGODB_URI, serverSelectionTimeoutMS=5000, tlsCAFile=certifi.where())
        # Verify connection
        client.admin.command('ping')
        db = client[Config.MONGODB_DB_NAME]
        resumes_collection = db["resumes"]
        users_collection = db["users"]
        db_ready = True
        logger.info(f"✅ Successfully connected to MongoDB database: {Config.MONGODB_DB_NAME}")
    except Exception as e:
        logger.error(f"⚠️  Failed to initialize MongoDB connection: {e}")

def save_resume_record(
    name: str,
    email: str,
    target_role: str,
    domain: str,
    confidence: float,
    ats_score: str,
    quality_grade: str,
    pdf_filename: str,
    docx_filename: str
):
    """
    Save the metadata about a resume generation event into MongoDB.
    Returns the inserted ID or None if the operation failed.
    """
    if not db_ready or resumes_collection is None:
        return None
        
    try:
        record = {
            "name": name,
            "email": email,
            "target_role": target_role,
            "domain": domain,
            "confidence": confidence,
            "ats_score": ats_score,
            "quality_grade": quality_grade,
            "files": {
                "pdf": pdf_filename,
                "docx": docx_filename
            },
            "created_at": datetime.utcnow()
        }
        
        result = resumes_collection.insert_one(record)
        logger.info(f"💾 Saved resume record to MongoDB (ID: {result.inserted_id})")
        return str(result.inserted_id)
    except Exception as e:
        logger.error(f"⚠️  Failed to save resume record to MongoDB: {e}")
        return None

def get_user_by_email(email: str):
    """Fetch user record by email."""
    if not db_ready or users_collection is None:
        return None
    return users_collection.find_one({"email": email})

def create_user_record(name: str, email: str, password_hash: str, auth_provider: str = "local"):
    """Create a new user."""
    if not db_ready or users_collection is None:
        return None
    record = {
        "name": name,
        "email": email,
        "password_hash": password_hash,
        "auth_provider": auth_provider,
        "created_at": datetime.utcnow()
    }
    result = users_collection.insert_one(record)
    return str(result.inserted_id)

def get_user_resumes(email: str):
    """Fetch all resumes associated with a user's email."""
    if not db_ready or resumes_collection is None:
        return []
    try:
        # Sort by creation date descending
        cursor = resumes_collection.find({"email": email}).sort("created_at", -1)
        resumes = []
        for doc in cursor:
            doc["_id"] = str(doc["_id"])
            resumes.append(doc)
        return resumes
    except Exception as e:
        logger.error(f"⚠️  Failed to fetch user resumes: {e}")
        return []

def update_user_profile(email: str, profile_data: dict):
    """Update a user's profile details."""
    if not db_ready or users_collection is None:
        return False
    try:
        # Prevent overriding critical fields
        allowed_keys = {"name", "theme", "email_notifications"}
        updates = {k: v for k, v in profile_data.items() if k in allowed_keys}
        
        if updates:
            users_collection.update_one({"email": email}, {"$set": updates})
            return True
        return False
    except Exception as e:
        logger.error(f"⚠️  Failed to update user profile: {e}")
        return False
