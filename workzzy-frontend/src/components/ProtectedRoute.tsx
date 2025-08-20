import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import type { ReactElement } from "react";

// Use const object instead of enum to avoid TypeScript configuration issues
export const Role = {
  HIRER: "hirer",
  WORKER: "worker",
} as const;

// Update type to use const object values
type Role = (typeof Role)[keyof typeof Role];
interface ProtectedRouteProps {
  children: ReactElement;
  allowedRoles?: Array<Role>;
}

export default function ProtectedRoute({
  children,
  allowedRoles,
}: ProtectedRouteProps) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Validate role is both present and matches allowed roles
  if (allowedRoles) {
    const userRole = user.user_metadata.role?.toLowerCase();
    const validRoles = allowedRoles.map((role) => role.toLowerCase());

    if (!userRole || !validRoles.includes(userRole as Role)) {
      return <Navigate to="/unauthorized" state={{ from: location }} replace />;
    }
  }

  return children;
}
