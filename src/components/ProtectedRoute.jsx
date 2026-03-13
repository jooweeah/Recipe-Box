import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function ProtectedRoute({ children }) {
  const user = useAuth();

  if (user === undefined) {
    // Still resolving auth state — render nothing to avoid flash
    return null;
  }

  return user ? children : <Navigate to="/login" replace />;
}
