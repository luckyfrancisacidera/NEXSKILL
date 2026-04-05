/* =========================================
   SUPERADMIN ROUTES
========================================= */

import { Navigate } from "react-router-dom";
import { useAuth } from "@app/providers/AuthProvider";
import { getDefaultRouteByRole } from "@app/routes/routes.guard";
import { lazyRouteElement, protectedRoute, type AppRoute } from "@app/routes/route.helpers";
import {
  superAdminCompanyAdminsLoader,
  superAdminDashboardLoader,
  superAdminRecruitersLoader,
  superAdminUsersLoader,
} from "@features/admin/loaders/admin.loaders";

const AdminIndexRedirect = () => {
  const { roles } = useAuth();
  const route = getDefaultRouteByRole(roles);
  return <Navigate to={route.startsWith("/admin") ? route : "/not-authorized"} replace />;
};

export const superAdminIndexRoute: AppRoute = {
  index: true,
  element: <AdminIndexRedirect />,
};

export const superAdminRoutes: AppRoute[] = [
  protectedRoute({
    path: "super",
    access: "superAdminDashboard",
    loader: superAdminDashboardLoader,
    element: lazyRouteElement(
      () => import("@features/admin/pages/SuperAdminDashboardPage"),
      "SuperAdminDashboardPage",
    ),
  }),
  protectedRoute({
    path: "super/company-admins",
    access: "superAdminCompanyAdmins",
    loader: superAdminCompanyAdminsLoader,
    element: lazyRouteElement(
      () => import("@features/admin/pages/SuperAdminCompanyAdminsPage"),
      "SuperAdminCompanyAdminsPage",
    ),
  }),
  protectedRoute({
    path: "super/recruiters",
    access: "superAdminRecruiters",
    loader: superAdminRecruitersLoader,
    element: lazyRouteElement(
      () => import("@features/admin/pages/SuperAdminRecruitersPage"),
      "SuperAdminRecruitersPage",
    ),
  }),
  protectedRoute({
    path: "super/users",
    access: "superAdminUsers",
    loader: superAdminUsersLoader,
    element: lazyRouteElement(
      () => import("@features/admin/pages/SuperAdminUsersPage"),
      "SuperAdminUsersPage",
    ),
  }),
];
