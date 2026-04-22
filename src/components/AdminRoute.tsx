import type { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

type AdminRouteProps = {
  children: ReactNode;
};

const ADMIN_EMAILS = new Set([
  "msm446@gmail.com",
]);

const AdminRoute = ({ children }: AdminRouteProps) => {
  const { user, loading } = useAuth();

  if (loading) {
    return null;
  }

  if (!user || !ADMIN_EMAILS.has(user.email?.toLowerCase() ?? "")) {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default AdminRoute;