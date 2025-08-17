import type { ReactNode } from "react";
import { Role } from "../lib/types";
import { useAuth } from "../contexts/AuthContext";

interface ProtectedRouteProps {
  children: ReactNode;
  allowedRoles?: Role[];
}

export function ProtectedRoute({
  children,
  allowedRoles,
}: ProtectedRouteProps) {
  const { user } = useAuth();

  // Check if user is authenticated
  if (!user) {
    // Redirect to login or show unauthorized
    return <div>Redirecting to login...</div>;
  }

  // Check role permissions if allowedRoles is provided
  if (
    allowedRoles &&
    user.user_metadata?.role &&
    !allowedRoles.includes(user.user_metadata.role)
  ) {
    // Redirect to unauthorized page
    return <div>Redirecting to unauthorized...</div>;
  }

  return <>{children}</>;
}
