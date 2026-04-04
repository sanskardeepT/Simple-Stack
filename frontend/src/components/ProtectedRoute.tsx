import type { PropsWithChildren } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useBootstrapAuth } from "../features/auth/useAuth.js";
import { useAuthStore } from "../lib/store/auth.store.js";
import { PageSkeleton } from "./PageSkeleton.js";

type Role = "admin" | "editor" | "viewer";

export function ProtectedRoute({
  allowedRoles,
  children,
}: PropsWithChildren<{ allowedRoles?: Role[] }>) {
  useBootstrapAuth();
  const location = useLocation();
  const { isAuthenticated, isLoading, user } = useAuthStore();

  if (isLoading) {
    return <PageSkeleton />;
  }

  if (!isAuthenticated || !user) {
    return <Navigate replace to="/login" state={{ from: location }} />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate replace to="/unauthorized" />;
  }

  return <>{children}</>;
}
