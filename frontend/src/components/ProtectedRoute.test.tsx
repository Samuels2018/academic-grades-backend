import { render, screen } from "@testing-library/react";
import { ProtectedRoute } from "./ProtectedRoute";
import { useAuth } from "../hooks/useAuth";

jest.mock(
  "react-router-dom",
  () => ({
    Navigate: ({ to }: { to: string }) => <div>Redirect:{to}</div>,
  }),
  { virtual: true }
);

jest.mock("../hooks/useAuth", () => ({
  useAuth: jest.fn(),
}));

const mockedUseAuth = useAuth as jest.Mock;

function renderWithRoutes(allowedRoles?: Array<"student" | "teacher" | "admin">) {
  return render(
    <ProtectedRoute allowedRoles={allowedRoles}>
      <div>Protected Content</div>
    </ProtectedRoute>
  );
}

describe("ProtectedRoute", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("shows loading state", () => {
    mockedUseAuth.mockReturnValue({ user: null, loading: true });

    renderWithRoutes();

    expect(screen.getByText("Cargando...")).toBeInTheDocument();
  });

  it("redirects unauthenticated users to login", () => {
    mockedUseAuth.mockReturnValue({ user: null, loading: false });

    renderWithRoutes();

    expect(screen.getByText("Redirect:/login")).toBeInTheDocument();
  });

  it("redirects users without role permissions", () => {
    mockedUseAuth.mockReturnValue({
      user: { id: 1, username: "student1", email: "s@s.com", role: "student" },
      loading: false,
    });

    renderWithRoutes(["admin"]);

    expect(screen.getByText("Redirect:/dashboard")).toBeInTheDocument();
  });

  it("renders protected content for allowed users", () => {
    mockedUseAuth.mockReturnValue({
      user: { id: 1, username: "admin", email: "a@a.com", role: "admin" },
      loading: false,
    });

    renderWithRoutes(["admin"]);

    expect(screen.getByText("Protected Content")).toBeInTheDocument();
  });
});
