import React, { useState } from "react";
import "./App.css";

export default function App() {
  const [view, setView] = useState("home");
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);

  const callApi = async (endpoint, type) => {
    setLoading(true);
    setView(type);

    try {
      const res = await fetch(endpoint);
      const json = await res.json();
      setData(json);
    } catch (err) {
      setData({ error: err.message });
    }

    setLoading(false);
  };

  return (
    <div style={{ display: "flex", height: "100vh", fontFamily: "Arial" }}>

      {/* SIDEBAR */}
      <div style={{
        width: "220px",
        background: "#1e293b",
        color: "white",
        padding: "20px"
      }}>
        <h2>DevOps Dashboard</h2>

        <button
          onClick={() => callApi("/api/health", "health")}
          style={btnStyle}
        >
          Health
        </button>

        <button
          onClick={() => callApi("/api/employees", "employees")}
          style={btnStyle}
        >
          Employees
        </button>
      </div>

      {/* MAIN PANEL */}
      <div style={{ flex: 1, padding: "20px", background: "#f1f5f9" }}>

        <h1>3-Tier App Dashboard</h1>

        {loading && <p>Loading...</p>}

        {/* HEALTH VIEW */}
        {view === "health" && data && (
          <div style={card}>
            <h2>Backend Health</h2>
            <p>Status: {data.status}</p>
          </div>
        )}

        {/* EMPLOYEES VIEW */}
        {view === "employees" && data && Array.isArray(data) && (
          <div style={card}>
            <h2>Employees</h2>

            <table border="1" cellPadding="10" style={{ width: "100%" }}>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Name</th>
                </tr>
              </thead>
              <tbody>
                {data.map((emp) => (
                  <tr key={emp.id}>
                    <td>{emp.id}</td>
                    <td>{emp.name}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* ERROR */}
        {data?.error && (
          <div style={{ color: "red" }}>
            Error: {data.error}
          </div>
        )}

      </div>
    </div>
  );
}

const btnStyle = {
  display: "block",
  width: "100%",
  margin: "10px 0",
  padding: "10px",
  background: "#334155",
  color: "white",
  border: "none",
  cursor: "pointer"
};

const card = {
  background: "white",
  padding: "20px",
  borderRadius: "10px",
  boxShadow: "0 2px 10px rgba(0,0,0,0.1)"
};