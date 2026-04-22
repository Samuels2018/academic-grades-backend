import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

export function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  if (!user) return null;

  return (
    <nav className="bg-white shadow-md border-b border-gray-200">
      <div className="container mx-auto px-4 max-w-7xl flex items-center gap-6 py-3">
        <Link to="/dashboard" className="text-gray-700 hover:text-blue-600 font-medium">
          Dashboard
        </Link>
        <Link to="/courses" className="text-gray-700 hover:text-blue-600 font-medium">
          Cursos
        </Link>
        <Link to="/grades" className="text-gray-700 hover:text-blue-600 font-medium">
          Notas
        </Link>
        {user.role === "admin" && (
          <Link to="/admin" className="text-gray-700 hover:text-blue-600 font-medium">
            Administración
          </Link>
        )}
        <div className="ml-auto flex items-center gap-4">
          <span className="text-sm text-gray-500">{user.username} ({user.role})</span>
          <button
            onClick={handleLogout}
            className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-1.5 rounded-md text-sm border border-gray-300 transition-colors"
          >
            Cerrar sesión
          </button>
        </div>
      </div>
    </nav>
  );
}