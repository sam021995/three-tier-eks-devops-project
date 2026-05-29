import React, { useEffect, useState } from "react";
import "./App.css";

function App() {
  const [health, setHealth] = useState(null);
  const [employees, setEmployees] = useState([]);
  const [version, setVersion] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const API_BASE = "";

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [healthRes, empRes, versionRes] = await Promise.all([
        fetch(`${API_BASE}/api/health`),
        fetch(`${API_BASE}/api/employees`),
        fetch(`${API_BASE}/api/version`)
      ]);

      if (!healthRes.ok || !empRes.ok || !versionRes.ok) {
        throw new Error("API error");
      }

      const healthData = await healthRes.json();
      const empData = await empRes.json();
      const versionData = await versionRes.json();

      setHealth(healthData);
      setEmployees(empData);
      setVersion(versionData);
    } catch (err) {
      setError("Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <div className="container">

      <h1>🚀 DevOps Dashboard</h1>

      <button onClick={fetchData} className="btn">
        Refresh
      </button>

      {loading && <p>Loading data...</p>}
      {error && <p className="error">{error}</p>}

      {/* STATUS CARDS */}
      {health && version && (
        <div className="cards">

          <div className="card">
            <h3>Backend Health</h3>
            <p className={health.status === "ok" ? "ok" : "bad"}>
              {health.status}
            </p>
          </div>

          <div className="card">
            <h3>Version</h3>
            <p>{version.version}</p>
          </div>

          <div className="card">
            <h3>Environment</h3>
            <p>{version.environment}</p>
          </div>

        </div>
      )}

      {/* EMPLOYEE TABLE */}
      <h2>Employees</h2>

      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>Name</th>
          </tr>
        </thead>

        <tbody>
          {employees.map((emp) => (
            <tr key={emp.id}>
              <td>{emp.id}</td>
              <td>{emp.name}</td>
            </tr>
          ))}
        </tbody>
      </table>

    </div>
  );
}

export default App;