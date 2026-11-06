import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../src/contexts/auth-context";

export default function ProtectedRoute({ children }) {
  const { user, authLoading } = useAuth();
  const location = useLocation();

  if (authLoading) return <main className="account-loading">Loading account...</main>;
  if (!user) return <Navigate to="/account" replace state={{ from: location }} />;
  return children;
}
