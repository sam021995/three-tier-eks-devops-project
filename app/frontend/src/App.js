import React, { useEffect, useState } from "react";
import EmployeeForm from "./EmployeeForm";

const API_BASE = "";

function App() {
  const [health, setHealth] = useState(null);
  const [employees, setEmployees] = useState([]);
  const [version, setVersion] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [formOpen, setFormOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState(null);

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

      setHealth(await healthRes.json());
      setEmployees(await empRes.json());
      setVersion(await versionRes.json());
    } catch (err) {
      setError("Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const openAddForm = () => {
    setEditingEmployee(null);
    setFormOpen(true);
  };

  const openEditForm = (employee) => {
    setEditingEmployee(employee);
    setFormOpen(true);
  };

  const closeForm = () => {
    setFormOpen(false);
    setEditingEmployee(null);
  };

  const handleSave = async (values) => {
    const isEdit = Boolean(editingEmployee);
    const url = isEdit
      ? `${API_BASE}/api/employees/${editingEmployee.id}`
      : `${API_BASE}/api/employees`;

    const res = await fetch(url, {
      method: isEdit ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values)
    });

    if (!res.ok) {
      setError("Failed to save employee");
      return;
    }

    closeForm();
    await fetchData();
  };

  const handleDelete = async (employee) => {
    if (!window.confirm(`Delete ${employee.name}?`)) return;

    const res = await fetch(`${API_BASE}/api/employees/${employee.id}`, {
      method: "DELETE"
    });

    if (!res.ok) {
      setError("Failed to delete employee");
      return;
    }

    await fetchData();
  };

  return (
    <div className="min-h-screen bg-slate-900 text-white p-6 font-sans">
      <div className="max-w-4xl mx-auto">

        <div className="flex items-center justify-between flex-wrap gap-3 mb-6">
          <h1 className="text-2xl font-bold text-sky-400">🚀 DevOps Dashboard</h1>
          <div className="flex gap-2">
            <button
              onClick={fetchData}
              className="px-4 py-2 rounded-md bg-slate-700 hover:bg-slate-600 text-sm"
            >
              Refresh
            </button>
            <button
              onClick={openAddForm}
              className="px-4 py-2 rounded-md bg-sky-400 hover:bg-sky-300 text-black text-sm font-medium"
            >
              + Add Employee
            </button>
          </div>
        </div>

        {loading && <p className="text-slate-400 mb-4">Loading data...</p>}
        {error && (
          <p className="bg-red-500/10 border border-red-500 text-red-400 rounded-md px-4 py-2 mb-4">
            {error}
          </p>
        )}

        {health && version && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
            <div className="bg-slate-800 rounded-xl p-4 shadow">
              <h3 className="text-sm text-slate-400 mb-1">Backend Health</h3>
              <p className={health.status === "ok" ? "text-green-400 font-semibold" : "text-red-400 font-semibold"}>
                {health.status}
              </p>
            </div>
            <div className="bg-slate-800 rounded-xl p-4 shadow">
              <h3 className="text-sm text-slate-400 mb-1">Version</h3>
              <p className="font-semibold">{version.version}</p>
            </div>
            <div className="bg-slate-800 rounded-xl p-4 shadow">
              <h3 className="text-sm text-slate-400 mb-1">Environment</h3>
              <p className="font-semibold">{version.environment}</p>
            </div>
          </div>
        )}

        <div className="bg-slate-800 rounded-xl overflow-hidden shadow">
          <h2 className="text-lg font-semibold px-4 pt-4 pb-2">Employees</h2>

          <table className="w-full text-left">
            <thead>
              <tr className="text-slate-400 text-sm border-b border-slate-700">
                <th className="px-4 py-2">ID</th>
                <th className="px-4 py-2">Name</th>
                <th className="px-4 py-2">Email</th>
                <th className="px-4 py-2">Department</th>
                <th className="px-4 py-2 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {employees.length === 0 && !loading && (
                <tr>
                  <td colSpan="5" className="px-4 py-6 text-center text-slate-500">
                    No employees yet — add one to get started.
                  </td>
                </tr>
              )}
              {employees.map((emp) => (
                <tr key={emp.id} className="border-b border-slate-700 hover:bg-slate-700/40">
                  <td className="px-4 py-2">{emp.id}</td>
                  <td className="px-4 py-2">{emp.name}</td>
                  <td className="px-4 py-2 text-slate-400">{emp.email || "—"}</td>
                  <td className="px-4 py-2 text-slate-400">{emp.department || "—"}</td>
                  <td className="px-4 py-2 text-right space-x-3">
                    <button
                      onClick={() => openEditForm(emp)}
                      className="text-sky-400 hover:text-sky-300 text-sm"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(emp)}
                      className="text-red-400 hover:text-red-300 text-sm"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

      </div>

      {formOpen && (
        <EmployeeForm
          employee={editingEmployee}
          onSave={handleSave}
          onCancel={closeForm}
        />
      )}
    </div>
  );
}

export default App;
