import type { PropsWithChildren } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@app/providers/AuthProvider";
import type { Role } from "@shared/types";

interface RequireRoleProps extends PropsWithChildren {
  allowedRoles: Role[];
}

export const RequireAuth = ({ children }: PropsWithChildren) => {
  const { isAuthenticated, isHydrating } = useAuth();
  const location = useLocation();

  if (isHydrating) return null;

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  return <>{children}</>;
};

export const RequireRole = ({ allowedRoles, children }: RequireRoleProps) => {
  const { roles } = useAuth();
  const isAllowed = roles.some((role) => allowedRoles.includes(role));

  if (!isAllowed) {
    return <Navigate to="/not-authorized" replace />;
  }

  return <>{children}</>;
};

// eslint-disable-next-line react-refresh/only-export-components
export const getDefaultRouteByRole = (roles: Role[]) => {
  if (roles.includes("admin")) return "/admin";
  if (roles.includes("recruiter")) return "/recruiter/dashboard";
  return "/dashboard";
};

export const PublicOnly = ({ children }: PropsWithChildren) => {
  const { isAuthenticated, roles, isHydrating } = useAuth();

  if (isHydrating) return null;

  if (isAuthenticated) {
    return <Navigate to={getDefaultRouteByRole(roles)} replace />;
  }

  return <>{children}</>;
};
