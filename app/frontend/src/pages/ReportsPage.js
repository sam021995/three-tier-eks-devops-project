import React, { useEffect, useMemo, useState } from "react";
import { listEmployees } from "../api";

function ReportsPage() {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    listEmployees()
      .then(setEmployees)
      .finally(() => setLoading(false));
  }, []);

  const byDepartment = useMemo(() => {
    const counts = {};
    employees.forEach((e) => {
      const dept = e.department || "Unassigned";
      counts[dept] = (counts[dept] || 0) + 1;
    });
    return Object.entries(counts).sort((a, b) => b[1] - a[1]);
  }, [employees]);

  const maxCount = byDepartment.length ? byDepartment[0][1] : 0;

  return (
    <div>
      <h1 className="text-xl font-bold mb-4">Reports</h1>

      <div className="bg-slate-800 rounded-xl p-4 shadow mb-6">
        <h2 className="text-sm text-slate-400 mb-2">Total Employees</h2>
        <p className="text-3xl font-bold text-sky-400">{loading ? "…" : employees.length}</p>
      </div>

      <div className="bg-slate-800 rounded-xl p-4 shadow">
        <h2 className="text-sm text-slate-400 mb-4">Headcount by Department</h2>

        {loading && <p className="text-slate-500 text-sm">Loading...</p>}
        {!loading && byDepartment.length === 0 && (
          <p className="text-slate-500 text-sm">No data yet.</p>
        )}

        <div className="space-y-3">
          {byDepartment.map(([dept, count]) => (
            <div key={dept}>
              <div className="flex justify-between text-sm mb-1">
                <span>{dept}</span>
                <span className="text-slate-400">{count}</span>
              </div>
              <div className="w-full bg-slate-700 rounded-full h-2">
                <div
                  className="bg-sky-400 h-2 rounded-full"
                  style={{ width: `${(count / maxCount) * 100}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default ReportsPage;
