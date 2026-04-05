/* =========================================
   COMMON ROUTES
========================================= */

import { Navigate } from "react-router-dom";
import { protectedRoute, lazyRouteElement, type AppRoute } from "@app/routes/route.helpers";

export const commonRoutes: AppRoute[] = [
  protectedRoute({
    path: "profile",
    access: "profile",
    element: lazyRouteElement(
      () => import("@features/jobseeker/pages/ProfilePage/ProfilePage"),
      "ProfilePage",
    ),
  }),
  {
    path: "settings",
    element: <Navigate to="/profile" replace />,
  },
  {
    path: "notifications",
    element: lazyRouteElement(
      () => import("@shared/pages/NotificationsPage"),
      "NotificationsPage",
    ),
  },
];
