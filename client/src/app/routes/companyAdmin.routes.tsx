/* =========================================
   COMPANY ADMIN ROUTES
========================================= */

import { lazyRouteElement, protectedRoute, type AppRoute } from "@app/routes/route.helpers";
import {
  companyAdminCandidateDetailLoader,
  companyAdminDashboardLoader,
  companyAdminEmployeesLoader,
} from "@features/admin/loaders/admin.loaders";

export const companyAdminRoutes: AppRoute[] = [
  protectedRoute({
    path: "company",
    access: "companyAdminDashboard",
    loader: companyAdminDashboardLoader,
    element: lazyRouteElement(
      () => import("@features/admin/pages/CompanyAdminDashboardPage"),
      "CompanyAdminDashboardPage",
    ),
  }),
  protectedRoute({
    path: "company/employees",
    access: "companyAdminEmployees",
    loader: companyAdminEmployeesLoader,
    element: lazyRouteElement(
      () => import("@features/admin/pages/CompanyAdminEmployeesPage"),
      "CompanyAdminEmployeesPage",
    ),
  }),
  protectedRoute({
    path: "company/candidates/:candidateId",
    access: "companyAdminCandidates",
    loader: companyAdminCandidateDetailLoader,
    element: lazyRouteElement(
      () => import("@features/recruiter/pages/CandidateDetailPage/CandidateDetailPage"),
      "CandidateDetailPage",
    ),
  }),
];
