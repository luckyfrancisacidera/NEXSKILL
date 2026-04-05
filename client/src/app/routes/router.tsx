/* =========================================
   ROUTER COMPOSITION
========================================= */

import { Navigate, Outlet, createBrowserRouter } from "react-router-dom";
import { AppShellRoute } from "@app/routes/route.helpers";
import { commonRoutes } from "@app/routes/common.routes";
import { companyAdminRoutes } from "@app/routes/companyAdmin.routes";
import { jobseekerRoutes } from "@app/routes/jobseeker.routes";
import { publicRoutes } from "@app/routes/public.routes";
import { recruiterRoutes } from "@app/routes/recruiter.routes";
import { superAdminIndexRoute, superAdminRoutes } from "@app/routes/superAdmin.routes";
import { RouteErrorPage } from "@shared/pages/RouteErrorPage";

export const router = createBrowserRouter([
  { path: "/", element: <Navigate to="/dashboard" replace /> },
  ...publicRoutes,
  {
    path: "/",
    errorElement: <RouteErrorPage />,
    element: <AppShellRoute />,
    children: [
      ...commonRoutes,
      ...jobseekerRoutes,
      recruiterRoutes,
      {
        path: "admin",
        element: <Outlet />,
        children: [
          superAdminIndexRoute,
          ...superAdminRoutes,
          ...companyAdminRoutes,
        ],
      },
      { path: "*", element: <Navigate to="/dashboard" replace /> },
    ],
  },
  { path: "*", element: <Navigate to="/login" replace /> },
]);
