from flask import Flask, jsonify
import mysql.connector
import os

app = Flask(__name__)

# =========================
# ENV VARIABLES (CLEAN & CONSISTENT)
# =========================
DB_HOST = os.environ.get("DB_HOST")
DB_DATABASE = os.environ.get("DB_DATABASE")
DB_USER = os.environ.get("DB_USER")
DB_PASSWORD = os.environ.get("DB_PASSWORD")

APP_VERSION = os.environ.get("APP_VERSION", "v1")
ENVIRONMENT = os.environ.get("ENVIRONMENT", "dev")

# =========================
# DB CONNECTION
# =========================
def get_connection():
    return mysql.connector.connect(
        host=DB_HOST,
        user=DB_USER,
        password=DB_PASSWORD,
        database=DB_DATABASE
    )

# =========================
# HEALTH API
# =========================
@app.route("/api/health")
def health():
    return jsonify({
        "status": "ok",
        "service": "backend"
    })

# =========================
# EMPLOYEES API
# =========================
@app.route("/api/employees")
def employees():
    conn = get_connection()
    cursor = conn.cursor(dictionary=True)

    cursor.execute("SELECT * FROM employees")
    data = cursor.fetchall()

    cursor.close()
    conn.close()

    return jsonify(data)

# =========================
# VERSION API
# =========================
@app.route("/api/version")
def version():
    return jsonify({
        "version": APP_VERSION,
        "environment": ENVIRONMENT
    })

# =========================
# MAIN
# =========================
if __name__ == "__main__":
    app.run(host="0.0.0.0", port=8080)