import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import Papa from "papaparse";
import { Plus, Search, Download, Upload, Trash2, Pencil, X } from "lucide-react";
import { listEmployees, createEmployee, updateEmployee, deleteEmployee } from "../api";
import { employeesToCsv, downloadCsv } from "../utils/csv";
import EmployeeForm from "../components/EmployeeForm";

const DEPARTMENT_COLORS = {
  Engineering: "bg-sky-500/20 text-sky-300 border-sky-500/40",
  Product: "bg-purple-500/20 text-purple-300 border-purple-500/40",
  Sales: "bg-green-500/20 text-green-300 border-green-500/40",
  Marketing: "bg-pink-500/20 text-pink-300 border-pink-500/40",
  HR: "bg-amber-500/20 text-amber-300 border-amber-500/40"
};
const DEFAULT_BADGE = "bg-slate-500/20 text-slate-300 border-slate-500/40";
const AVATAR_COLORS = ["bg-sky-500", "bg-purple-500", "bg-green-500", "bg-pink-500", "bg-amber-500", "bg-red-500"];

function initials(name) {
  return name
    .split(" ")
    .map((p) => p[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function EmployeesPage() {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [searchTerm, setSearchTerm] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState("");
  const [selectedIds, setSelectedIds] = useState(new Set());

  const [formOpen, setFormOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState(null);
  const [pendingDelete, setPendingDelete] = useState(null);

  const [searchParams, setSearchParams] = useSearchParams();
  const fileInputRef = useRef(null);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      setEmployees(await listEmployees());
    } catch (err) {
      setError("Failed to load employees");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const departments = useMemo(
    () => Array.from(new Set(employees.map((e) => e.department).filter(Boolean))).sort(),
    [employees]
  );

  const filteredEmployees = useMemo(() => {
    return employees.filter((e) => {
      const term = searchTerm.toLowerCase();
      const matchesSearch =
        !term ||
        e.name.toLowerCase().includes(term) ||
        (e.email || "").toLowerCase().includes(term);
      const matchesDept = !departmentFilter || e.department === departmentFilter;
      return matchesSearch && matchesDept;
    });
  }, [employees, searchTerm, departmentFilter]);

  const openAddForm = useCallback(() => {
    setEditingEmployee(null);
    setFormOpen(true);
  }, []);

  useEffect(() => {
    if (searchParams.get("add") === "1") {
      setSearchParams({});
      openAddForm();
    }
  }, [searchParams, setSearchParams, openAddForm]);

  const openEditForm = (employee) => {
    setEditingEmployee(employee);
    setFormOpen(true);
  };

  const closeForm = () => {
    setFormOpen(false);
    setEditingEmployee(null);
  };

  const handleSave = async (values) => {
    try {
      if (editingEmployee) {
        await updateEmployee(editingEmployee.id, values);
      } else {
        await createEmployee(values);
      }
      closeForm();
      await loadData();
    } catch (err) {
      setError("Failed to save employee");
    }
  };

  // Optimistic delete: remove immediately, give a few seconds to undo
  // before actually calling the API.
  const handleDeleteClick = (employee) => {
    setEmployees((prev) => prev.filter((e) => e.id !== employee.id));

    const timeoutId = setTimeout(() => {
      deleteEmployee(employee.id).catch(() => setError("Failed to delete employee"));
      setPendingDelete(null);
    }, 5000);

    setPendingDelete({ employee, timeoutId });
  };

  const handleUndo = () => {
    if (!pendingDelete) return;
    clearTimeout(pendingDelete.timeoutId);
    setEmployees((prev) => [...prev, pendingDelete.employee].sort((a, b) => a.id - b.id));
    setPendingDelete(null);
  };

  const toggleSelect = (id) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const allVisibleSelected =
    filteredEmployees.length > 0 && filteredEmployees.every((e) => selectedIds.has(e.id));

  const toggleSelectAll = () => {
    if (allVisibleSelected) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredEmployees.map((e) => e.id)));
    }
  };

  const handleBulkDelete = async () => {
    if (!window.confirm(`Delete ${selectedIds.size} selected employee(s)?`)) return;
    try {
      await Promise.all([...selectedIds].map((id) => deleteEmployee(id)));
      setSelectedIds(new Set());
      await loadData();
    } catch (err) {
      setError("Failed to delete selected employees");
    }
  };

  const handleExport = () => {
    downloadCsv("employees.csv", employeesToCsv(filteredEmployees));
  };

  const handleImportClick = () => fileInputRef.current?.click();

  const handleImportFile = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: async (results) => {
        const rows = results.data.filter((r) => r.name && r.name.trim());
        try {
          for (const row of rows) {
            await createEmployee({
              name: row.name.trim(),
              email: (row.email || "").trim(),
              department: (row.department || "").trim()
            });
          }
          await loadData();
        } catch (err) {
          setError("Failed to import some employees");
        }
      }
    });

    e.target.value = "";
  };

  return (
    <div>
      <div className="flex items-center justify-between flex-wrap gap-3 mb-6">
        <h1 className="text-xl font-bold">Employees</h1>
        <button
          onClick={openAddForm}
          className="flex items-center gap-1.5 px-4 py-2 rounded-md bg-sky-400 hover:bg-sky-300 text-black text-sm font-medium"
        >
          <Plus size={16} /> Add Employee
        </button>
      </div>

      {error && (
        <p className="bg-red-500/10 border border-red-500 text-red-400 rounded-md px-4 py-2 mb-4">
          {error}
        </p>
      )}

      <div className="flex flex-wrap items-center gap-3 mb-4">
        <div className="relative flex-1 min-w-[180px]">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by name or email..."
            className="w-full bg-slate-800 border border-slate-700 rounded-md pl-9 pr-3 py-2 text-sm focus:outline-none focus:border-sky-400"
          />
        </div>

        <select
          value={departmentFilter}
          onChange={(e) => setDepartmentFilter(e.target.value)}
          className="bg-slate-800 border border-slate-700 rounded-md px-3 py-2 text-sm focus:outline-none focus:border-sky-400"
        >
          <option value="">All Departments</option>
          {departments.map((d) => (
            <option key={d} value={d}>
              {d}
            </option>
          ))}
        </select>

        <button
          onClick={handleExport}
          className="flex items-center gap-1.5 px-3 py-2 rounded-md bg-slate-700 hover:bg-slate-600 text-sm"
        >
          <Download size={16} /> Export
        </button>

        <button
          onClick={handleImportClick}
          className="flex items-center gap-1.5 px-3 py-2 rounded-md bg-slate-700 hover:bg-slate-600 text-sm"
        >
          <Upload size={16} /> Import
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept=".csv"
          onChange={handleImportFile}
          className="hidden"
        />

        {selectedIds.size > 0 && (
          <button
            onClick={handleBulkDelete}
            className="flex items-center gap-1.5 px-3 py-2 rounded-md bg-red-500/20 text-red-400 hover:bg-red-500/30 text-sm"
          >
            <Trash2 size={16} /> Delete Selected ({selectedIds.size})
          </button>
        )}
      </div>

      {loading && <p className="text-slate-400 mb-4">Loading data...</p>}

      <div className="bg-slate-800 rounded-xl overflow-hidden shadow">
        <table className="w-full text-left">
          <thead>
            <tr className="text-slate-400 text-sm border-b border-slate-700">
              <th className="px-4 py-2 w-8">
                <input
                  type="checkbox"
                  checked={allVisibleSelected}
                  onChange={toggleSelectAll}
                  className="accent-sky-400"
                />
              </th>
              <th className="px-4 py-2">Name</th>
              <th className="px-4 py-2">Email</th>
              <th className="px-4 py-2">Department</th>
              <th className="px-4 py-2 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            <AnimatePresence>
              {filteredEmployees.length === 0 && !loading && (
                <tr>
                  <td colSpan="5" className="px-4 py-6 text-center text-slate-500">
                    No employees match — try clearing filters or add one to get started.
                  </td>
                </tr>
              )}
              {filteredEmployees.map((emp) => (
                <motion.tr
                  key={emp.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="border-b border-slate-700 hover:bg-slate-700/40"
                >
                  <td className="px-4 py-2">
                    <input
                      type="checkbox"
                      checked={selectedIds.has(emp.id)}
                      onChange={() => toggleSelect(emp.id)}
                      className="accent-sky-400"
                    />
                  </td>
                  <td className="px-4 py-2">
                    <Link to={`/employees/${emp.id}`} className="flex items-center gap-3 hover:text-sky-400">
                      <span
                        className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold text-white ${AVATAR_COLORS[emp.id % AVATAR_COLORS.length]}`}
                      >
                        {initials(emp.name)}
                      </span>
                      {emp.name}
                    </Link>
                  </td>
                  <td className="px-4 py-2 text-slate-400">{emp.email || "—"}</td>
                  <td className="px-4 py-2">
                    {emp.department ? (
                      <span
                        className={`text-xs px-2 py-1 rounded-full border ${DEPARTMENT_COLORS[emp.department] || DEFAULT_BADGE}`}
                      >
                        {emp.department}
                      </span>
                    ) : (
                      <span className="text-slate-500">—</span>
                    )}
                  </td>
                  <td className="px-4 py-2 text-right space-x-3">
                    <button
                      onClick={() => openEditForm(emp)}
                      className="inline-flex items-center gap-1 text-sky-400 hover:text-sky-300 text-sm"
                    >
                      <Pencil size={14} /> Edit
                    </button>
                    <button
                      onClick={() => handleDeleteClick(emp)}
                      className="inline-flex items-center gap-1 text-red-400 hover:text-red-300 text-sm"
                    >
                      <Trash2 size={14} /> Delete
                    </button>
                  </td>
                </motion.tr>
              ))}
            </AnimatePresence>
          </tbody>
        </table>
      </div>

      <AnimatePresence>
        {pendingDelete && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-slate-700 rounded-lg shadow-xl px-4 py-3 flex items-center gap-4"
          >
            <span className="text-sm">Deleted {pendingDelete.employee.name}.</span>
            <button
              onClick={handleUndo}
              className="text-sky-400 hover:text-sky-300 text-sm font-medium"
            >
              Undo
            </button>
            <button onClick={() => setPendingDelete(null)} className="text-slate-400 hover:text-white">
              <X size={16} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {formOpen && (
          <EmployeeForm employee={editingEmployee} onSave={handleSave} onCancel={closeForm} />
        )}
      </AnimatePresence>
    </div>
  );
}

export default EmployeesPage;
