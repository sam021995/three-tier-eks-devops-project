from flask import Flask, jsonify, request
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
# EMPLOYEES API (CRUD)
# =========================
@app.route("/api/employees", methods=["GET"])
def list_employees():
    conn = get_connection()
    cursor = conn.cursor(dictionary=True)

    cursor.execute("SELECT * FROM employees ORDER BY id")
    data = cursor.fetchall()

    cursor.close()
    conn.close()

    return jsonify(data)


@app.route("/api/employees/<int:employee_id>", methods=["GET"])
def get_employee(employee_id):
    conn = get_connection()
    cursor = conn.cursor(dictionary=True)

    cursor.execute("SELECT * FROM employees WHERE id = %s", (employee_id,))
    employee = cursor.fetchone()

    cursor.close()
    conn.close()

    if not employee:
        return jsonify({"error": "Employee not found"}), 404

    return jsonify(employee)


@app.route("/api/employees", methods=["POST"])
def create_employee():
    body = request.get_json(silent=True) or {}
    name = (body.get("name") or "").strip()
    email = (body.get("email") or "").strip()
    department = (body.get("department") or "").strip()

    if not name:
        return jsonify({"error": "name is required"}), 400

    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute(
        "INSERT INTO employees (name, email, department) VALUES (%s, %s, %s)",
        (name, email, department)
    )
    conn.commit()
    new_id = cursor.lastrowid

    cursor.close()
    conn.close()

    return jsonify({"id": new_id, "name": name, "email": email, "department": department}), 201


@app.route("/api/employees/<int:employee_id>", methods=["PUT"])
def update_employee(employee_id):
    body = request.get_json(silent=True) or {}
    name = (body.get("name") or "").strip()
    email = (body.get("email") or "").strip()
    department = (body.get("department") or "").strip()

    if not name:
        return jsonify({"error": "name is required"}), 400

    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute(
        "UPDATE employees SET name = %s, email = %s, department = %s WHERE id = %s",
        (name, email, department, employee_id)
    )
    conn.commit()
    updated = cursor.rowcount

    cursor.close()
    conn.close()

    if not updated:
        return jsonify({"error": "Employee not found"}), 404

    return jsonify({"id": employee_id, "name": name, "email": email, "department": department})


@app.route("/api/employees/<int:employee_id>", methods=["DELETE"])
def delete_employee(employee_id):
    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute("DELETE FROM employees WHERE id = %s", (employee_id,))
    conn.commit()
    deleted = cursor.rowcount

    cursor.close()
    conn.close()

    if not deleted:
        return jsonify({"error": "Employee not found"}), 404

    return "", 204

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
