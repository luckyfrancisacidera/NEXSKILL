/* =========================================
   JOBSEEKER ROUTES
========================================= */

import { protectedRoute, lazyRouteElement, type AppRoute } from "@app/routes/route.helpers";
import { applyJobAction } from "@features/jobseeker/actions";
import {
  applicationsLoader,
  archivedInterviewsLoader,
  dashboardLoader,
  jobDetailLoader,
  jobsLoader,
} from "@features/jobseeker/loaders";

export const jobseekerRoutes: AppRoute[] = [
  protectedRoute({
    path: "dashboard",
    access: "dashboard",
    loader: dashboardLoader,
    element: lazyRouteElement(
      () => import("@features/jobseeker/pages/DashboardPage/DashboardPage"),
      "DashboardPage",
    ),
  }),
  protectedRoute({
    path: "jobs",
    access: "jobs",
    loader: jobsLoader,
    element: lazyRouteElement(
      () => import("@features/jobseeker/pages/JobsPage/JobsPage"),
      "JobsPage",
    ),
  }),
  protectedRoute({
    path: "jobs/:jobId",
    access: "jobs",
    loader: jobDetailLoader,
    action: applyJobAction,
    element: lazyRouteElement(
      () => import("@features/jobseeker/pages/JobDetailPage/JobDetailPage"),
      "JobDetailPage",
    ),
  }),
  protectedRoute({
    path: "applications",
    access: "applications",
    loader: applicationsLoader,
    element: lazyRouteElement(
      () => import("@features/jobseeker/pages/ApplicationsPage/ApplicationsPage"),
      "ApplicationsPage",
    ),
  }),
  protectedRoute({
    path: "applications/archived",
    access: "applications",
    loader: applicationsLoader,
    element: lazyRouteElement(
      () => import("@features/jobseeker/pages/ArchivedApplicationsPage/ArchivedApplicationsPage"),
      "ArchivedApplicationsPage",
    ),
  }),
  protectedRoute({
    path: "offers",
    access: "offers",
    loader: applicationsLoader,
    element: lazyRouteElement(
      () => import("@features/jobseeker/pages/OffersPage/OffersPage"),
      "OffersPage",
    ),
  }),
  protectedRoute({
    path: "saved",
    access: "saved",
    element: lazyRouteElement(
      () => import("@features/jobseeker/pages/SavedJobsPage/SavedJobsPage"),
      "SavedJobsPage",
    ),
  }),
  protectedRoute({
    path: "jobseeker/interviews",
    access: "applications",
    element: lazyRouteElement(
      () => import("@features/jobseeker/pages/InterviewPage/InterviewPage"),
      "InterviewPage",
    ),
  }),
  protectedRoute({
    path: "jobseeker/interviews/archived",
    access: "applications",
    loader: archivedInterviewsLoader,
    element: lazyRouteElement(
      () => import("@features/jobseeker/pages/ArchivedInterviewsPage/ArchivedInterviewsPage"),
      "ArchivedInterviewsPage",
    ),
  }),
];
