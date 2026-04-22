const API_BASE = process.env.REACT_APP_API_URL || "http://localhost:8000/api";

function getCookie(name: string): string | null {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) {
    return parts.pop()?.split(";").shift() ?? null;
  }
  return null;
}

async function request<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_BASE}${endpoint}`;
  const method = (options.method || "GET").toUpperCase();
  const csrfToken = getCookie("csrftoken");
  const needsCsrf = !["GET", "HEAD", "OPTIONS", "TRACE"].includes(method);

  const config: RequestInit = {
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...(needsCsrf && csrfToken ? { "X-CSRFToken": csrfToken } : {}),
      ...options.headers,
    },
    ...options,
  };

  const response = await fetch(url, config);
  const contentType = response.headers.get("content-type") || "";
  const isJson = contentType.includes("application/json");
  const data = isJson ? await response.json() : await response.text();

  if (!response.ok) {
    if (isJson && typeof data === "object" && data !== null && "error" in data) {
      throw new Error(String((data as { error: string }).error));
    }
    throw new Error(typeof data === "string" ? data : "Error en la petición");
  }
  return data;
}

export const api = {
  get: <T>(endpoint: string) => request<T>(endpoint, { method: "GET" }),
  post: <T>(endpoint: string, body?: unknown) =>
    request<T>(endpoint, { method: "POST", body: JSON.stringify(body) }),
  put: <T>(endpoint: string, body?: unknown) =>
    request<T>(endpoint, { method: "PUT", body: JSON.stringify(body) }),
  delete: <T>(endpoint: string) => request<T>(endpoint, { method: "DELETE" }),
};