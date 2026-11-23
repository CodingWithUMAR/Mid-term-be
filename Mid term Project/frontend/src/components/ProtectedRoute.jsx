import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
export default function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  const location = useLocation();
  if (loading) return <div className="grid min-h-[60vh] place-items-center text-sm text-neutral-500">Loading TURBO...</div>;
  if (!user) return <Navigate to="/signup" replace state={{ from: location.pathname }}/>;
  return children;
}
