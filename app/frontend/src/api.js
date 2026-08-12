const API_BASE = "";
const TOKEN_KEY = "authToken";

export function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

function setToken(token) {
  localStorage.setItem(TOKEN_KEY, token);
}

export function clearToken() {
  localStorage.removeItem(TOKEN_KEY);
}

async function request(path, options = {}) {
  const token = getToken();
  const headers = {
    "Content-Type": "application/json",
    ...(options.headers || {}),
    ...(token ? { Authorization: `Bearer ${token}` } : {})
  };

  const res = await fetch(`${API_BASE}${path}`, { ...options, headers });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || `Request failed: ${res.status}`);
  }

  if (res.status === 204) return null;
  return res.json();
}

export const getHealth = () => request("/api/health");
export const getVersion = () => request("/api/version");

export const listEmployees = () => request("/api/employees");
export const getEmployee = (id) => request(`/api/employees/${id}`);

export const createEmployee = (data) =>
  request("/api/employees", { method: "POST", body: JSON.stringify(data) });

export const updateEmployee = (id, data) =>
  request(`/api/employees/${id}`, { method: "PUT", body: JSON.stringify(data) });

export const deleteEmployee = (id) =>
  request(`/api/employees/${id}`, { method: "DELETE" });

export async function login(username, password) {
  const data = await request("/api/auth/login", {
    method: "POST",
    body: JSON.stringify({ username, password })
  });
  setToken(data.token);
  return data;
}
