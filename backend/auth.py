from flask import Blueprint, request, jsonify
from flask_bcrypt import Bcrypt
import jwt
from datetime import datetime, timedelta
import os
from google.oauth2 import id_token
from google.auth.transport import requests
from functools import wraps

from db import get_user_by_email, create_user_record
import logging

logger = logging.getLogger(__name__)

auth_bp = Blueprint('auth', __name__)
bcrypt = Bcrypt()

def get_jwt_secret():
    return os.environ.get('JWT_SECRET_KEY', 'default-secret-key')

def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        token = None
        if 'Authorization' in request.headers:
            parts = request.headers['Authorization'].split()
            if len(parts) == 2 and parts[0] == 'Bearer':
                token = parts[1]
        if not token:
            return jsonify({'error': 'Unauthorized - Please log in'}), 401
        try:
            data = jwt.decode(token, get_jwt_secret(), algorithms=['HS256'])
            current_user = get_user_by_email(data['email'])
            if not current_user:
                return jsonify({'error': 'Unauthorized - User not found'}), 401
        except Exception as e:
            return jsonify({'error': 'Unauthorized - Invalid token'}), 401
        return f(current_user, *args, **kwargs)
    return decorated

def generate_token(email, name):
    payload = {
        'email': email,
        'name': name,
        'exp': datetime.utcnow() + timedelta(minutes=10)
    }
    return jwt.encode(payload, get_jwt_secret(), algorithm='HS256')

@auth_bp.route('/register', methods=['POST'])
def register():
    data = request.json
    name = data.get('name')
    email = data.get('email')
    password = data.get('password')

    if not all([name, email, password]):
        return jsonify({"error": "Name, email, and password are required"}), 400

    existing_user = get_user_by_email(email)
    if existing_user:
        return jsonify({"error": "User already exists"}), 400

    hashed_pw = bcrypt.generate_password_hash(password).decode('utf-8')
    record_id = create_user_record(name, email, hashed_pw, 'local')
    
    if not record_id:
        return jsonify({"error": "Failed to create user in database (DB not ready)"}), 500

    token = generate_token(email, name)
    return jsonify({"token": token, "user": {"name": name, "email": email}}), 201

@auth_bp.route('/login', methods=['POST'])
def login():
    data = request.json
    email = data.get('email')
    password = data.get('password')

    user = get_user_by_email(email)
    if not user or user.get('auth_provider') != 'local':
        return jsonify({"error": "Invalid email or password"}), 401

    if bcrypt.check_password_hash(user['password_hash'], password):
        token = generate_token(user['email'], user['name'])
        return jsonify({"token": token, "user": {"name": user['name'], "email": user['email']}}), 200
    
    return jsonify({"error": "Invalid email or password"}), 401

@auth_bp.route('/google', methods=['POST'])
def google_auth():
    data = request.json
    token = data.get('token')
    client_id = os.environ.get('GOOGLE_CLIENT_ID')

    if not token or not client_id:
        return jsonify({"error": "Missing token or Google Client ID server-side"}), 400

    try:
        idinfo = id_token.verify_oauth2_token(token, requests.Request(), client_id)
        email = idinfo['email']
        name = idinfo.get('name', 'Google User')

        user = get_user_by_email(email)
        if not user:
            # Create user if it doesn't exist
            record_id = create_user_record(name, email, None, 'google')
            if not record_id:
                return jsonify({"error": "Failed to create user in database (DB not ready)"}), 500

        app_token = generate_token(email, name)
        return jsonify({"token": app_token, "user": {"name": name, "email": email}}), 200
    except ValueError as e:
        logger.error(f"Google Token Verification Error: {e}")
        return jsonify({"error": f"Invalid Google token: {str(e)}"}), 401
