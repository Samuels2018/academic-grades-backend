import { authService } from "./auth";
import { api } from "./api";

jest.mock("./api", () => ({
  api: {
    post: jest.fn(),
    get: jest.fn(),
  },
}));

describe("authService", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("calls login endpoint with credentials", async () => {
    (api.post as jest.Mock).mockResolvedValue({ id: 1, username: "john", role: "student" });

    await authService.login("john", "secret");

    expect(api.post).toHaveBeenCalledWith("/auth/login/", {
      username: "john",
      password: "secret",
    });
  });

  it("calls logout endpoint", async () => {
    (api.post as jest.Mock).mockResolvedValue({ message: "ok" });

    await authService.logout();

    expect(api.post).toHaveBeenCalledWith("/auth/logout/");
  });

  it("calls current user endpoint", async () => {
    (api.get as jest.Mock).mockResolvedValue({ id: 2, username: "teacher", role: "teacher" });

    await authService.me();

    expect(api.get).toHaveBeenCalledWith("/auth/me/");
  });
});
