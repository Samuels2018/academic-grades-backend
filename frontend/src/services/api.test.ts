import { api } from "./api";

describe("api service", () => {
  beforeEach(() => {
    Object.defineProperty(global, "fetch", {
      value: jest.fn(),
      writable: true,
    });
    document.cookie = "";
    jest.clearAllMocks();
  });

  it("sends GET requests without CSRF header", async () => {
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      headers: { get: () => "application/json" },
      json: async () => ({ ok: true }),
      text: async () => "",
    });

    await api.get("/health/");

    expect(global.fetch).toHaveBeenCalledWith(
      "http://localhost:8000/api/health/",
      expect.objectContaining({
        method: "GET",
        credentials: "include",
        headers: expect.not.objectContaining({ "X-CSRFToken": expect.any(String) }),
      })
    );
  });

  it("adds CSRF token for mutating requests", async () => {
    document.cookie = "csrftoken=test-token";
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      headers: { get: () => "application/json" },
      json: async () => ({ id: 1 }),
      text: async () => "",
    });

    await api.post("/auth/login/", { username: "demo" });

    expect(global.fetch).toHaveBeenCalledWith(
      "http://localhost:8000/api/auth/login/",
      expect.objectContaining({
        method: "POST",
        credentials: "include",
        headers: expect.objectContaining({ "X-CSRFToken": "test-token" }),
      })
    );
  });

  it("throws API error message from JSON response", async () => {
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: false,
      headers: { get: () => "application/json" },
      json: async () => ({ error: "Credenciales inválidas" }),
      text: async () => "",
    });

    await expect(api.get("/auth/me/")).rejects.toThrow("Credenciales inválidas");
  });
});
