from flask import Flask, jsonify, request
from werkzeug.security import generate_password_hash, check_password_hash
import sqlite3
import jwt
import os
import datetime

app = Flask(__name__)

DB_PATH = os.environ.get("DB_PATH", "/data/auth.db")
JWT_SECRET = os.environ.get("JWT_SECRET", "dev-only-insecure-secret")
TOKEN_EXPIRY_MINUTES = int(os.environ.get("TOKEN_EXPIRY_MINUTES", "60"))

# =========================
# DB SETUP
# =========================
def get_connection():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn


def init_db():
    conn = get_connection()
    conn.execute(
        """
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT UNIQUE NOT NULL,
            password_hash TEXT NOT NULL
        )
        """
    )
    conn.commit()
    conn.close()


init_db()

# =========================
# HEALTH
# =========================
@app.route("/api/auth/health")
def health():
    return jsonify({"status": "ok", "service": "auth"})

# =========================
# REGISTER
# =========================
@app.route("/api/auth/register", methods=["POST"])
def register():
    body = request.get_json(silent=True) or {}
    username = (body.get("username") or "").strip()
    password = body.get("password") or ""

    if not username or not password:
        return jsonify({"error": "username and password are required"}), 400

    conn = get_connection()
    try:
        conn.execute(
            "INSERT INTO users (username, password_hash) VALUES (?, ?)",
            (username, generate_password_hash(password))
        )
        conn.commit()
    except sqlite3.IntegrityError:
        return jsonify({"error": "username already exists"}), 409
    finally:
        conn.close()

    return jsonify({"username": username}), 201

# =========================
# LOGIN
# =========================
@app.route("/api/auth/login", methods=["POST"])
def login():
    body = request.get_json(silent=True) or {}
    username = (body.get("username") or "").strip()
    password = body.get("password") or ""

    conn = get_connection()
    user = conn.execute(
        "SELECT * FROM users WHERE username = ?", (username,)
    ).fetchone()
    conn.close()

    if not user or not check_password_hash(user["password_hash"], password):
        return jsonify({"error": "invalid username or password"}), 401

    now = datetime.datetime.utcnow()
    payload = {
        "sub": username,
        "iat": now,
        "exp": now + datetime.timedelta(minutes=TOKEN_EXPIRY_MINUTES)
    }
    token = jwt.encode(payload, JWT_SECRET, algorithm="HS256")

    return jsonify({"token": token})

# =========================
# VERIFY (manual testing / debugging helper)
# =========================
@app.route("/api/auth/verify", methods=["GET"])
def verify():
    auth_header = request.headers.get("Authorization", "")
    if not auth_header.startswith("Bearer "):
        return jsonify({"error": "missing Bearer token"}), 401

    token = auth_header.removeprefix("Bearer ").strip()
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=["HS256"])
    except jwt.ExpiredSignatureError:
        return jsonify({"error": "token expired"}), 401
    except jwt.InvalidTokenError:
        return jsonify({"error": "invalid token"}), 401

    return jsonify({"valid": True, "username": payload["sub"]})

# =========================
# MAIN
# =========================
if __name__ == "__main__":
    app.run(host="0.0.0.0", port=8080)
