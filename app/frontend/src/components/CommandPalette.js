import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { listEmployees } from "../api";

function CommandPalette() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [employees, setEmployees] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen((prev) => !prev);
      }
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  useEffect(() => {
    if (open) {
      setQuery("");
      listEmployees().then(setEmployees).catch(() => setEmployees([]));
    }
  }, [open]);

  const actions = useMemo(() => {
    const staticActions = [
      { label: "Go to Employees", run: () => navigate("/") },
      { label: "Go to Reports", run: () => navigate("/reports") },
      { label: "Go to Settings", run: () => navigate("/settings") },
      { label: "Add Employee", run: () => navigate("/?add=1") }
    ];
    const employeeActions = employees.map((emp) => ({
      label: `Go to employee: ${emp.name}`,
      run: () => navigate(`/employees/${emp.id}`)
    }));
    return [...staticActions, ...employeeActions];
  }, [employees, navigate]);

  const filtered = query
    ? actions.filter((a) => a.label.toLowerCase().includes(query.toLowerCase()))
    : actions;

  const runAction = (action) => {
    action.run();
    setOpen(false);
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/60 flex items-start justify-center pt-24 z-50 p-4"
          onClick={() => setOpen(false)}
        >
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.98 }}
            transition={{ duration: 0.15 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-slate-800 rounded-xl w-full max-w-md shadow-xl overflow-hidden"
          >
            <input
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && filtered[0]) runAction(filtered[0]);
              }}
              placeholder="Type a command or search employees..."
              className="w-full bg-slate-900 text-white px-4 py-3 outline-none border-b border-slate-700"
            />
            <div className="max-h-64 overflow-y-auto">
              {filtered.length === 0 && (
                <p className="px-4 py-3 text-slate-500 text-sm">No matches</p>
              )}
              {filtered.map((a, i) => (
                <button
                  key={i}
                  onClick={() => runAction(a)}
                  className="w-full text-left px-4 py-2 text-sm hover:bg-slate-700 text-slate-200"
                >
                  {a.label}
                </button>
              ))}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default CommandPalette;
