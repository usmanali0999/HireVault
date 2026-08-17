const API_BASE = "http://127.0.0.1:8000";

async function request(endpoint, options = {}) {
  const config = {
    method: options.method || "GET",
    headers: {
      ...(options.body ? { "Content-Type": "application/json" } : {}),
      ...(options.headers || {})
    },
    body: options.body ? JSON.stringify(options.body) : undefined
  };

  const response = await fetch(`${API_BASE}${endpoint}`, config);

  const contentType = response.headers.get("content-type") || "";
  const data = contentType.includes("application/json")
    ? await response.json()
    : await response.text();

  if (!response.ok) {
    throw new Error(data.detail || data || "Request failed");
  }

  return data;
}

export const api = {
  getJobs: () => request("/jobs/"),
  createJob: (payload) => request("/jobs/", { method: "POST", body: payload }),
  deleteJob: (id) => request(`/jobs/${id}`, { method: "DELETE" }),

  getCandidates: () => request("/candidates/"),
  createCandidate: (payload) => request("/candidates/", { method: "POST", body: payload }),
  deleteCandidate: (id) => request(`/candidates/${id}`, { method: "DELETE" }),

  getApplications: () => request("/applications/"),
  createApplication: (payload) => request("/applications/", { method: "POST", body: payload }),
  updateApplication: (id, payload) => request(`/applications/${id}`, { method: "PUT", body: payload }),
  deleteApplication: (id) => request(`/applications/${id}`, { method: "DELETE" })
};