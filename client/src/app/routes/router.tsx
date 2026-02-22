import type { ReactElement } from "react";
import { createBrowserRouter, Navigate } from "react-router-dom";
import { JobseekerLayout } from "@app/layouts/JobseekerLayout";
import { NotAuthorized } from "@shared/pages/NotAuthorized";
import { RouteGuard } from "@app/routes/routes.guard";
import { routeAccess } from "@app/routes/route.config";
import {
  ApplicationsPage,
  DashboardPage,
  JobsPage,
  MessagesPage,
  ProfilePage,
  SavedJobsPage,
  SettingsPage,
  applicationsLoader,
  applyToJobAction,
  dashboardLoader,
  jobsLoader,
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
import { AdminPlaceholderPage } from "@features/admin/AdminPlaceholderPage";

const withRoleGate = (
  allowedRoles: (typeof routeAccess)[keyof typeof routeAccess],
  element: ReactElement,
) => <RouteGuard allowedRoles={allowedRoles}>{element}</RouteGuard>;

export const router = createBrowserRouter([
  { path: "/", element: <Navigate to="/dashboard" replace /> },
  { path: "/not-authorized", element: <NotAuthorized /> },
  {
    path: "/",
    element: <JobseekerLayout />,
    children: [
      {
        path: "dashboard",
        loader: dashboardLoader,
        element: withRoleGate(routeAccess.dashboard, <DashboardPage />),
      },
      {
        path: "jobs",
        loader: jobsLoader,
        element: withRoleGate(routeAccess.jobs, <JobsPage />),
      },
      {
        path: "jobs/apply",
        action: applyToJobAction,
      },
      {
        path: "applications",
        loader: applicationsLoader,
        element: withRoleGate(routeAccess.applications, <ApplicationsPage />),
      },
      {
        path: "messages",
        element: withRoleGate(routeAccess.messages, <MessagesPage />),
      },
      {
        path: "saved",
        element: withRoleGate(routeAccess.saved, <SavedJobsPage />),
      },
      {
        path: "profile",
        element: withRoleGate(routeAccess.profile, <ProfilePage />),
      },
      {
        path: "settings",
        element: withRoleGate(routeAccess.settings, <SettingsPage />),
      },

    //   RECRUITER ROUTES
      {
        path: "recruiter/dashboard",
        loader: recruiterDashboardLoader,
        element: withRoleGate(
          routeAccess.recruiterDashboard,
          <RecruiterDashboardPage />,
        ),
      },
      {
        path: "recruiter/job-posts",
        loader: recruiterJobsLoader,
        element: withRoleGate(routeAccess.recruiterJobs, <JobPostsPage />),
      },
      {
        path: "recruiter/job-posts/new",
        loader: async () => ({}),
        action: upsertJobAction,
        element: withRoleGate(
          routeAccess.recruiterJobs,
          <JobFormPage mode="create" />,
        ),
      },
      {
        path: "recruiter/job-posts/:jobId",
        loader: recruiterJobDetailLoader,
        element: withRoleGate(routeAccess.recruiterJobs, <JobDetailPage />),
      },
      {
        path: "recruiter/job-posts/:jobId/edit",
        loader: recruiterJobDetailLoader,
        action: upsertJobAction,
        element: withRoleGate(
          routeAccess.recruiterJobs,
          <JobFormPage mode="edit" />,
        ),
      },
      {
        path: "recruiter/job-posts/:jobId/delete",
        action: deleteJobAction,
      },
      {
        path: "recruiter/job-posts/:jobId/status",
        action: updateJobStatusAction,
      },
      {
        path: "recruiter/candidates",
        loader: recruiterCandidatesLoader,
        element: withRoleGate(
          routeAccess.recruiterCandidates,
          <CandidatesPage />,
        ),
      },
      {
        path: "recruiter/candidates/:candidateId",
        loader: recruiterCandidateDetailLoader,
        action: updateCandidateAction,
        element: withRoleGate(
          routeAccess.recruiterCandidates,
          <CandidateDetailPage />,
        ),
      },
      {
        path: "recruiter/interviews",
        loader: recruiterInterviewsLoader,
        element: withRoleGate(
          routeAccess.recruiterInterviews,
          <InterviewsPage />,
        ),
      },
      {
        path: "recruiter/interviews/new",
        loader: recruiterInterviewsLoader,
        action: upsertInterviewAction,
        element: withRoleGate(
          routeAccess.recruiterInterviews,
          <InterviewFormPage mode="create" />,
        ),
      },
      {
        path: "recruiter/interviews/:interviewId/edit",
        loader: recruiterInterviewDetailLoader,
        action: upsertInterviewAction,
        element: withRoleGate(
          routeAccess.recruiterInterviews,
          <InterviewFormPage mode="edit" />,
        ),
      },
      {
        path: "recruiter/interviews/:interviewId/cancel",
        action: cancelInterviewAction,
      },
      {
        path: "recruiter/automations",
        loader: recruiterAutomationsLoader,
        action: automationRuleAction,
        element: withRoleGate(
          routeAccess.recruiterAutomations,
          <AutomationsPage />,
        ),
      },
      {
        path: "recruiter/automations/:ruleId",
        action: automationRuleAction,
      },
      {
        path: "recruiter/automations/run-offer",
        action: runOfferAutomationAction,
      },
      {
        path: "recruiter/settings",
        loader: recruiterSettingsLoader,
        action: updateRecruiterSettingsAction,
        element: withRoleGate(
          routeAccess.recruiterSettings,
          <RecruiterSettingsPage />,
        ),
      },
      {
        path: "admin",
        element: withRoleGate(
          routeAccess.adminDashboard,
          <AdminPlaceholderPage title="Admin Dashboard" />,
        ),
      },
      {
        path: "admin/users",
        element: withRoleGate(
          routeAccess.adminUsers,
          <AdminPlaceholderPage title="Admin Users" />,
        ),
      },
    ],
  },
]);
