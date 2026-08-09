import React, { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { getEmployee, deleteEmployee } from "../api";

function EmployeeDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [employee, setEmployee] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    getEmployee(id)
      .then(setEmployee)
      .catch(() => setError("Employee not found"))
      .finally(() => setLoading(false));
  }, [id]);

  const handleDelete = async () => {
    if (!employee || !window.confirm(`Delete ${employee.name}?`)) return;
    await deleteEmployee(id);
    navigate("/");
  };

  if (loading) return <p className="text-slate-400">Loading...</p>;

  if (error || !employee) {
    return (
      <div>
        <p className="text-red-400 mb-4">{error || "Employee not found"}</p>
        <Link to="/" className="text-sky-400 hover:underline">
          ← Back to Employees
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-md">
      <Link to="/" className="text-sky-400 hover:underline text-sm">
        ← Back to Employees
      </Link>

      <div className="bg-slate-800 rounded-xl p-6 mt-4 shadow">
        <div className="w-16 h-16 rounded-full bg-sky-500 flex items-center justify-center text-2xl font-bold mb-4">
          {employee.name.slice(0, 1).toUpperCase()}
        </div>
        <h1 className="text-xl font-bold mb-1">{employee.name}</h1>
        <p className="text-slate-400 mb-4">{employee.department || "No department"}</p>

        <dl className="space-y-2 text-sm">
          <div className="flex justify-between border-b border-slate-700 pb-2">
            <dt className="text-slate-400">ID</dt>
            <dd>{employee.id}</dd>
          </div>
          <div className="flex justify-between border-b border-slate-700 pb-2">
            <dt className="text-slate-400">Email</dt>
            <dd>{employee.email || "—"}</dd>
          </div>
        </dl>

        <button
          onClick={handleDelete}
          className="mt-6 px-4 py-2 rounded-md bg-red-500/20 text-red-400 hover:bg-red-500/30 text-sm"
        >
          Delete Employee
        </button>
      </div>
    </div>
  );
}

export default EmployeeDetailPage;
