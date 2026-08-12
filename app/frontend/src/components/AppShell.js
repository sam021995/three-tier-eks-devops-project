import React from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { Users, BarChart2, Settings as SettingsIcon, LogIn, LogOut } from "lucide-react";
import CommandPalette from "./CommandPalette";
import { useAuth } from "../AuthContext";

const navLinkClass = ({ isActive }) =>
  `flex items-center gap-1.5 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
    isActive ? "bg-sky-400 text-black" : "text-slate-300 hover:bg-slate-700"
  }`;

function AppShell() {
  const { isLoggedIn, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-slate-900 text-white">
      <header className="sticky top-0 z-20 backdrop-blur bg-slate-900/80 border-b border-slate-800">
        <div className="max-w-4xl mx-auto flex items-center justify-between px-6 py-3 flex-wrap gap-3">
          <span className="text-xl font-bold text-sky-400">🚀 DevOps Dashboard</span>

          <nav className="flex gap-1">
            <NavLink to="/" className={navLinkClass} end>
              <Users size={16} /> Employees
            </NavLink>
            <NavLink to="/reports" className={navLinkClass}>
              <BarChart2 size={16} /> Reports
            </NavLink>
            <NavLink to="/settings" className={navLinkClass}>
              <SettingsIcon size={16} /> Settings
            </NavLink>
          </nav>

          <div className="flex items-center gap-3">
            <span className="text-xs text-slate-500 hidden sm:block">
              Press Ctrl/Cmd+K
            </span>
            {isLoggedIn ? (
              <button
                onClick={handleLogout}
                className="flex items-center gap-1.5 px-3 py-2 rounded-md text-sm font-medium text-slate-300 hover:bg-slate-700"
              >
                <LogOut size={16} /> Log Out
              </button>
            ) : (
              <NavLink to="/login" className={navLinkClass}>
                <LogIn size={16} /> Log In
              </NavLink>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-6">
        <Outlet />
      </main>

      <CommandPalette />
    </div>
  );
}

export default AppShell;
