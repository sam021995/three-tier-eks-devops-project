const API_BASE = "";

async function request(path, options = {}) {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...options
  });

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
