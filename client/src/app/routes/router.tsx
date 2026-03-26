/* eslint-disable react-refresh/only-export-components */
import type { ReactElement } from "react";
import { createBrowserRouter, Navigate, Outlet, type RouteObject } from "react-router-dom";
import { AppShell } from "@app/layouts/AppShell";
import { useAuth } from "@app/providers/AuthProvider";
import { NotAuthorized } from "@shared/pages/NotAuthorized";
import { NotificationsPage } from "@shared/pages/NotificationsPage";
import { RouteErrorPage } from "@shared/pages/RouteErrorPage";
import { ScrollToTop } from "@shared/components/ScrollToTop";
import { PublicOnly, RequireAuth, RequireRole, getDefaultRouteByRole } from "@app/routes/routes.guard";
import { routeAccess, type AppRouteKey } from "@app/routes/route.config";
import {
  ApplicationsPage,
  DashboardPage,
  JobsPage,
  ProfilePage,
  SavedJobsPage,
  applicationsLoader,
  dashboardLoader,
  jobsLoader,
  JobDetailPage as JobSeekerJobDetailPage,
  jobDetailLoader,
  applyJobAction,
  InterviewPage,
  OffersPage,
} from "@features/jobseeker";
import {
  CandidateDetailPage,
  CandidatesPage,
  InterviewFormPage,
  JobDetailPage,
  JobFormPage,
  JobPostsPage,
  RecruiterDashboardPage,
  cancelInterviewAction,
  deleteJobAction,
  recruiterCandidateDetailLoader,
  recruiterCandidatesLoader,
  recruiterDashboardLoader,
  recruiterInterviewDetailLoader,
  recruiterInterviewsLoader,
  recruiterJobDetailLoader,
  recruiterJobsLoader,
  candidatesAction,
  updateCandidateAction,
  updateJobStatusAction,
  upsertInterviewAction,
  upsertJobAction,
} from "@features/recruiter";
import {
  CompanyAdminDashboardPage,
  SuperAdminCompanyAdminsPage,
  SuperAdminDashboardPage,
  SuperAdminRecruitersPage,
  companyAdminDashboardLoader,
  superAdminCompanyAdminsLoader,
  superAdminDashboardLoader,
  superAdminRecruitersLoader,
} from "@features/admin";
import {
  RegisterAccount,
  LoginAccount,
  PrivacyPolicyPage,
  TermsOfServicePage,
} from "@features/auth";
import { ForgotPasswordPage } from "@features/auth/pages/ForgotPasswordPage";
import { ResetPasswordPage } from "@features/auth/pages/ResetPasswordPage";

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

const AdminIndexRedirect = () => {
  const { roles } = useAuth();
  const route = getDefaultRouteByRole(roles);
  return <Navigate to={route.startsWith("/admin") ? route : "/not-authorized"} replace />;
};

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
    path: "offers",
    access: "offers",
    loader: applicationsLoader,
    element: <OffersPage />,
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
  {
    path: "settings",
    element: <Navigate to="/profile" replace />,
  },
  protectedRoute({
    path: "jobseeker/interviews",
    access: "applications",
    element: <InterviewPage />,
  }),
];

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
          action: candidatesAction,
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
          element: <InterviewFormPage />,
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
              element: <InterviewFormPage />,
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
      path: "settings",
      element: <Navigate to="/profile" replace />,
    },
  ],
};

const adminRoutes: AppRoute = {
  path: "admin",
  element: <Outlet />,
  children: [
    { index: true, element: <AdminIndexRedirect /> },
    protectedRoute({
      path: "super",
      access: "superAdminDashboard",
      loader: superAdminDashboardLoader,
      element: <SuperAdminDashboardPage />,
    }),
    protectedRoute({
      path: "super/company-admins",
      access: "superAdminCompanyAdmins",
      loader: superAdminCompanyAdminsLoader,
      element: <SuperAdminCompanyAdminsPage />,
    }),
    protectedRoute({
      path: "super/recruiters",
      access: "superAdminRecruiters",
      loader: superAdminRecruitersLoader,
      element: <SuperAdminRecruitersPage />,
    }),
    protectedRoute({
      path: "company",
      access: "companyAdminDashboard",
      loader: companyAdminDashboardLoader,
      element: <CompanyAdminDashboardPage />,
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
  publicRoute("/terms", <TermsOfServicePage />),
  publicRoute("/privacy", <PrivacyPolicyPage />),
  publicRoute("/forgot-password", <ForgotPasswordPage />),
  publicRoute("/reset-password", <ResetPasswordPage />),
  {
    path: "/",
    errorElement: <RouteErrorPage />,
    element: <AppShellRoute />,
    children: [
      ...sharedRoutes,
      { path: "notifications", element: <NotificationsPage /> },
      recruiterRoutes,
      adminRoutes,
      { path: "*", element: <Navigate to="/dashboard" replace /> },
    ],
  },
  { path: "*", element: <Navigate to="/login" replace /> },
]);
