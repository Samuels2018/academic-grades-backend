import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "./useAuth";

export function useRequireAuth(allowedRoles?: Array<"student" | "teacher" | "admin">) {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading) {
      if (!user) {
        navigate("/login");
      } else if (allowedRoles && !allowedRoles.includes(user.role)) {
        navigate("/dashboard");
      }
    }
  }, [user, loading, navigate, allowedRoles]);

  return { user, loading };
}