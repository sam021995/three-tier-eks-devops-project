from flask import Flask, jsonify
import mysql.connector
import os

app = Flask(__name__)

DB_Host = os.environ.get("DB_Host")
DB_Database = os.environ.get("DB_Database")
DB_User = os.environ.get("DB_User")
DB_Password = os.environ.get("DB_Password")

def get_connection():
    return mysql.connector.connect(
        host=DB_Host,
        user=DB_User,
        password=DB_Password,
        database=DB_Database
    )

@app.route("/api/health")
def health():
    return jsonify({"status": "ok"})

@app.route("/api/employees")
def employees():
    conn = get_connection()
    cursor = conn.cursor(dictionary=True)
    cursor.execute("SELECT * FROM employees")
    data = cursor.fetchall()
    cursor.close()
    conn.close()
    return jsonify(data)

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=8080)