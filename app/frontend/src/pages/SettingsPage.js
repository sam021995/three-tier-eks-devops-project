import React, { useEffect, useState } from "react";
import { getHealth, getVersion } from "../api";

function SettingsPage() {
  const [health, setHealth] = useState(null);
  const [version, setVersion] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    Promise.all([getHealth(), getVersion()])
      .then(([h, v]) => {
        setHealth(h);
        setVersion(v);
      })
      .catch(() => setError("Failed to load system info"));
  }, []);

  return (
    <div>
      <h1 className="text-xl font-bold mb-4">Settings</h1>

      {error && (
        <p className="bg-red-500/10 border border-red-500 text-red-400 rounded-md px-4 py-2 mb-4">
          {error}
        </p>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-slate-800 rounded-xl p-4 shadow">
          <h3 className="text-sm text-slate-400 mb-1">Backend Health</h3>
          <p className={health?.status === "ok" ? "text-green-400 font-semibold" : "text-slate-500"}>
            {health?.status || "…"}
          </p>
        </div>
        <div className="bg-slate-800 rounded-xl p-4 shadow">
          <h3 className="text-sm text-slate-400 mb-1">Version</h3>
          <p className="font-semibold">{version?.version || "…"}</p>
        </div>
        <div className="bg-slate-800 rounded-xl p-4 shadow">
          <h3 className="text-sm text-slate-400 mb-1">Environment</h3>
          <p className="font-semibold">{version?.environment || "…"}</p>
        </div>
      </div>
    </div>
  );
}

export default SettingsPage;
