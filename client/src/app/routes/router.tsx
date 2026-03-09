/* eslint-disable react-refresh/only-export-components */
import type { ReactElement } from "react";
import { Suspense, lazy } from "react";
import { createBrowserRouter, Navigate, Outlet, type RouteObject } from "react-router-dom";
import { AppShell } from "@app/layouts/AppShell";
import { NotAuthorized } from "@shared/pages/NotAuthorized";
import { RouteErrorPage } from "@shared/pages/RouteErrorPage";
import { ScrollToTop } from "@shared/components/ScrollToTop";
import { PublicOnly, RequireAuth, RequireRole } from "@app/routes/routes.guard";
import { routeAccess, type AppRouteKey } from "@app/routes/route.config";
import {
  ApplicationsPage,
  DashboardPage,
  JobsPage,
  MessagesPage,
  ProfilePage,
  SavedJobsPage,
  SettingsPage,
  applicationsLoader,
  dashboardLoader,
  jobsLoader,
  JobDetailPage as JobSeekerJobDetailPage,
  jobDetailLoader,
  applyJobAction,
} from "@features/jobseeker";
import {
  AutomationsPage,
  CandidateDetailPage,
  CandidatesPage,
  InterviewFormPage,
  InterviewsPage,
  JobDetailPage,
  JobFormPage,
  JobPostsPage,
  RecruiterDashboardPage,
  RecruiterSettingsPage,
  automationRuleAction,
  cancelInterviewAction,
  deleteJobAction,
  recruiterAutomationsLoader,
  recruiterCandidateDetailLoader,
  recruiterCandidatesLoader,
  recruiterDashboardLoader,
  recruiterInterviewDetailLoader,
  recruiterInterviewsLoader,
  recruiterJobDetailLoader,
  recruiterJobsLoader,
  recruiterSettingsLoader,
  runOfferAutomationAction,
  updateCandidateAction,
  updateJobStatusAction,
  updateRecruiterSettingsAction,
  upsertInterviewAction,
  upsertJobAction,
} from "@features/recruiter";
import { RegisterAccount, LoginAccount } from "@features/auth";
import { ForgotPasswordPage } from "@features/auth/pages/ForgotPasswordPage";

type AppRoute = RouteObject;

type ProtectedRouteOptions = {
  access: AppRouteKey;
  element: ReactElement;
  action?: AppRoute["action"];
  caseSensitive?: AppRoute["caseSensitive"];
  children?: AppRoute["children"];
  errorElement?: AppRoute["errorElement"];
  handle?: AppRoute["handle"];
  hydrateFallbackElement?: AppRoute["hydrateFallbackElement"];
  id?: AppRoute["id"];
  index?: boolean;
  lazy?: AppRoute["lazy"];
  loader?: AppRoute["loader"];
  path?: string;
  shouldRevalidate?: AppRoute["shouldRevalidate"];
};

type ActionOnlyRouteOptions = Omit<ProtectedRouteOptions, "element"> & {
  redirectTo: string;
};

const LazyAdminPlaceholderPage = lazy(async () => ({
  default: (await import("@features/admin/AdminPlaceholderPage")).AdminPlaceholderPage,
}));

const withPageScroll = (element: ReactElement) => (
  <>
    <ScrollToTop />
    {element}
  </>
);

const AppShellRoute = () => (
  <>
    <ScrollToTop />
    <RequireAuth>
      <AppShell />
    </RequireAuth>
  </>
);

const ActionRouteFallback = ({ to }: { to: string }) => <Navigate to={to} replace />;

const AdminPlaceholder = ({ title }: { title: string }) => (
  <Suspense fallback={null}>
    <LazyAdminPlaceholderPage title={title} />
  </Suspense>
);

const protectElement = (access: AppRouteKey, element: ReactElement) => (
  <RequireRole allowedRoles={routeAccess[access]}>{element}</RequireRole>
);

const protectedRoute = ({ access, element, ...route }: ProtectedRouteOptions): AppRoute =>
  ({
    ...route,
    element: protectElement(access, element),
  }) as AppRoute;

const actionOnlyRoute = ({
  access,
  redirectTo,
  ...route
}: ActionOnlyRouteOptions): AppRoute =>
  protectedRoute({
    ...route,
    access,
    element: <ActionRouteFallback to={redirectTo} />,
  });

const publicRoute = (path: string, element: ReactElement): AppRoute => ({
  path,
  errorElement: <RouteErrorPage />,
  element: withPageScroll(element),
});

const sharedRoutes: AppRoute[] = [
  protectedRoute({
    path: "dashboard",
    access: "dashboard",
    loader: dashboardLoader,
    element: <DashboardPage />,
  }),
  protectedRoute({
    path: "jobs",
    access: "jobs",
    loader: jobsLoader,
    element: <JobsPage />,
  }),
  protectedRoute({
    path: "jobs/:jobId",
    access: "jobs",
    loader: jobDetailLoader,
    action: applyJobAction,
    element: <JobSeekerJobDetailPage />,
  }),
  protectedRoute({
    path: "applications",
    access: "applications",
    loader: applicationsLoader,
    element: <ApplicationsPage />,
  }),
  protectedRoute({
    path: "messages",
    access: "messages",
    element: <MessagesPage />,
  }),
  protectedRoute({
    path: "saved",
    access: "saved",
    element: <SavedJobsPage />,
  }),
  protectedRoute({
    path: "profile",
    access: "profile",
    element: <ProfilePage />,
  }),
  protectedRoute({
    path: "settings",
    access: "settings",
    element: <SettingsPage />,
  }),
];

// Recruiter routes now live in one nested tree so child segments stay relative and role guards are applied through helpers.
const recruiterRoutes: AppRoute = {
  path: "recruiter",
  element: <Outlet />,
  children: [
    protectedRoute({
      path: "dashboard",
      access: "recruiterDashboard",
      loader: recruiterDashboardLoader,
      element: <RecruiterDashboardPage />,
    }),
    {
      path: "job-posts",
      element: <Outlet />,
      children: [
        protectedRoute({
          index: true,
          access: "recruiterJobs",
          loader: recruiterJobsLoader,
          element: <JobPostsPage />,
        }),
        protectedRoute({
          path: "new",
          access: "recruiterJobs",
          loader: async () => ({}),
          action: upsertJobAction,
          element: <JobFormPage mode="create" />,
        }),
        {
          path: ":jobId",
          element: <Outlet />,
          children: [
            protectedRoute({
              index: true,
              access: "recruiterJobs",
              loader: recruiterJobDetailLoader,
              element: <JobDetailPage />,
            }),
            protectedRoute({
              path: "edit",
              access: "recruiterJobs",
              loader: recruiterJobDetailLoader,
              action: upsertJobAction,
              element: <JobFormPage mode="edit" />,
            }),
            actionOnlyRoute({
              path: "delete",
              access: "recruiterJobs",
              action: deleteJobAction,
              redirectTo: "/recruiter/job-posts",
            }),
            actionOnlyRoute({
              path: "status",
              access: "recruiterJobs",
              action: updateJobStatusAction,
              redirectTo: "/recruiter/job-posts",
            }),
          ],
        },
      ],
    },
    {
      path: "candidates",
      element: <Outlet />,
      children: [
        protectedRoute({
          index: true,
          access: "recruiterCandidates",
          loader: recruiterCandidatesLoader,
          action: updateCandidateAction,
          element: <CandidatesPage />,
        }),
        protectedRoute({
          path: ":candidateId",
          access: "recruiterCandidates",
          loader: recruiterCandidateDetailLoader,
          action: updateCandidateAction,
          element: <CandidateDetailPage />,
        }),
      ],
    },
    {
      path: "interviews",
      element: <Outlet />,
      children: [
        protectedRoute({
          index: true,
          access: "recruiterInterviews",
          loader: recruiterInterviewsLoader,
          element: <InterviewsPage />,
        }),
        protectedRoute({
          path: "new",
          access: "recruiterInterviews",
          loader: recruiterInterviewsLoader,
          action: upsertInterviewAction,
          element: <InterviewFormPage mode="create" />,
        }),
        {
          path: ":interviewId",
          element: <Outlet />,
          children: [
            protectedRoute({
              path: "edit",
              access: "recruiterInterviews",
              loader: recruiterInterviewDetailLoader,
              action: upsertInterviewAction,
              element: <InterviewFormPage mode="edit" />,
            }),
            actionOnlyRoute({
              path: "cancel",
              access: "recruiterInterviews",
              action: cancelInterviewAction,
              redirectTo: "/recruiter/interviews",
            }),
          ],
        },
      ],
    },
    {
      path: "automations",
      element: <Outlet />,
      children: [
        protectedRoute({
          index: true,
          access: "recruiterAutomations",
          loader: recruiterAutomationsLoader,
          action: automationRuleAction,
          element: <AutomationsPage />,
        }),
        actionOnlyRoute({
          path: ":ruleId",
          access: "recruiterAutomations",
          action: automationRuleAction,
          redirectTo: "/recruiter/automations",
        }),
        actionOnlyRoute({
          path: "run-offer",
          access: "recruiterAutomations",
          action: runOfferAutomationAction,
          redirectTo: "/recruiter/automations",
        }),
      ],
    },
    protectedRoute({
      path: "settings",
      access: "recruiterSettings",
      loader: recruiterSettingsLoader,
      action: updateRecruiterSettingsAction,
      element: <RecruiterSettingsPage />,
    }),
  ],
};

// Admin pages are grouped separately, and the placeholder screens are lazy-loaded to reduce up-front bundle work.
const adminRoutes: AppRoute = {
  path: "admin",
  element: <Outlet />,
  children: [
    protectedRoute({
      index: true,
      access: "adminDashboard",
      element: <AdminPlaceholder title="Admin Dashboard" />,
    }),
    protectedRoute({
      path: "users",
      access: "adminUsers",
      element: <AdminPlaceholder title="Admin Users" />,
    }),
  ],
};

export const router = createBrowserRouter([
  { path: "/", element: <Navigate to="/dashboard" replace /> },
  publicRoute("/not-authorized", <NotAuthorized />),
  publicRoute(
    "/register",
    <PublicOnly>
      <RegisterAccount />
    </PublicOnly>,
  ),
  publicRoute(
    "/login",
    <PublicOnly>
      <LoginAccount />
    </PublicOnly>,
  ),
  publicRoute("/forgot-password", <ForgotPasswordPage />),
  {
    path: "/",
    errorElement: <RouteErrorPage />,
    element: <AppShellRoute />,
    children: [
      ...sharedRoutes,
      recruiterRoutes,
      adminRoutes,
      { path: "*", element: <Navigate to="/dashboard" replace /> },
    ],
  },
  { path: "*", element: <Navigate to="/login" replace /> },
]);


