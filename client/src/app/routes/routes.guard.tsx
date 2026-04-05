/* =========================================
   ROUTE GUARDS
   React-side route guards for authenticated, role-based, and public-only screens.
   Related: AuthProvider, SetupProvider, protectedLoader
========================================= */

import type { PropsWithChildren } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@app/providers/AuthProvider";
import { useSetup } from "@app/providers/SetupProvider";
import { usePermissions } from "@shared/hooks/usePermissions";
import {
  getDefaultRouteForRoles,
  hasAnyAllowedRole,
} from "@shared/utils/permissions";
import type { Role } from "@shared/types";

interface RequireRoleProps extends PropsWithChildren {
  allowedRoles: Role[];
}

/* =========================================
   AUTHENTICATED ROUTES
========================================= */

export const RequireAuth = ({ children }: PropsWithChildren) => {
  const { isAuthenticated, isHydrating, roles } = useAuth();
  const { status, isLoading } = useSetup();
  const location = useLocation();

  if (isHydrating || (isAuthenticated && isLoading)) return null;

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (status.requiresSetup) {
    // Setup completion takes precedence over the originally requested route so
    // the user always lands in the blocking setup workflow first.
    const redirectTo = getDefaultRouteByRole(roles);
    if (location.pathname !== redirectTo) {
      return <Navigate to={redirectTo} replace />;
    }
  }

  return <>{children}</>;
};

export const RequireRole = ({ allowedRoles, children }: RequireRoleProps) => {
  const { isAuthenticated, roles, isHydrating } = useAuth();
  const { status, isLoading } = useSetup();
  const location = useLocation();
  const isAllowed = hasAnyAllowedRole(roles, allowedRoles);

  if (isHydrating || (isAuthenticated && isLoading)) {
    return null;
  }

  if (isAuthenticated && status.requiresSetup) {
    // Preserve setup redirects here as well so role-protected pages do not render
    // partial content before the setup requirement is satisfied.
    const redirectTo = getDefaultRouteByRole(roles);
    if (location.pathname !== redirectTo) {
      return <Navigate to={redirectTo} replace />;
    }

    return <>{children}</>;
  }

  if (!isAllowed) {
    return <Navigate to="/not-authorized" replace />;
  }

  return <>{children}</>;
};

// eslint-disable-next-line react-refresh/only-export-components
export const getDefaultRouteByRole = (roles: Role[]) => getDefaultRouteForRoles(roles);

/* =========================================
   PUBLIC-ONLY ROUTES
========================================= */

export const PublicOnly = ({ children }: PropsWithChildren) => {
  const { isAuthenticated, roles, isHydrating } = useAuth();
  const { isLoading } = useSetup();
  const { isSuperAdmin, isCompanyAdmin, isRecruiter } = usePermissions();

  if (isHydrating || (isAuthenticated && isLoading)) return null;

  if (isAuthenticated) {
    // Public auth pages should immediately hand control back to the most
    // specific signed-in workspace instead of leaving logged-in users on login/register.
    const redirectTo = isSuperAdmin
      ? "/admin/super"
      : isCompanyAdmin
        ? "/admin/company"
        : isRecruiter
          ? "/recruiter/dashboard"
          : getDefaultRouteByRole(roles);

    return <Navigate to={redirectTo} replace />;
  }

  return <>{children}</>;
};
