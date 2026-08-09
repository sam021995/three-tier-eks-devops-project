import React, { useState } from "react";
import { motion } from "framer-motion";

function EmployeeForm({ employee, onSave, onCancel }) {
  const [name, setName] = useState(employee?.name || "");
  const [email, setEmail] = useState(employee?.email || "");
  const [department, setDepartment] = useState(employee?.department || "");
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;

    setSaving(true);
    await onSave({ name: name.trim(), email: email.trim(), department: department.trim() });
    setSaving(false);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4"
    >
      <motion.form
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ duration: 0.15 }}
        onSubmit={handleSubmit}
        className="bg-slate-800 rounded-xl p-6 w-full max-w-sm shadow-xl space-y-4"
      >
        <h2 className="text-lg font-semibold text-sky-400">
          {employee ? "Edit Employee" : "Add Employee"}
        </h2>

        <div>
          <label className="block text-sm text-slate-300 mb-1">Name</label>
          <input
            className="w-full rounded-md bg-slate-900 border border-slate-600 px-3 py-2 text-white focus:outline-none focus:border-sky-400"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>

        <div>
          <label className="block text-sm text-slate-300 mb-1">Email</label>
          <input
            type="email"
            className="w-full rounded-md bg-slate-900 border border-slate-600 px-3 py-2 text-white focus:outline-none focus:border-sky-400"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        <div>
          <label className="block text-sm text-slate-300 mb-1">Department</label>
          <input
            className="w-full rounded-md bg-slate-900 border border-slate-600 px-3 py-2 text-white focus:outline-none focus:border-sky-400"
            value={department}
            onChange={(e) => setDepartment(e.target.value)}
          />
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 rounded-md bg-slate-700 hover:bg-slate-600 text-sm"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={saving}
            className="px-4 py-2 rounded-md bg-sky-400 hover:bg-sky-300 text-black text-sm font-medium disabled:opacity-50"
          >
            {saving ? "Saving..." : "Save"}
          </button>
        </div>
      </motion.form>
    </motion.div>
  );
}

export default EmployeeForm;
