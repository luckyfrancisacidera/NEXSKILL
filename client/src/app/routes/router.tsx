import type { ReactElement } from 'react';
import { createBrowserRouter, Navigate } from 'react-router-dom';
import { JobseekerLayout } from '@app/layouts/JobseekerLayout';
import { NotAuthorized } from '@shared/pages/NotAuthorized';
import { RouteGuard } from '@app/routes/routes.guard';
import { routeAccess } from '@app/routes/route.config';
import { ApplicationsPage, DashboardPage, JobsPage, MessagesPage, ProfilePage, SavedJobsPage, SettingsPage, applicationsLoader, applyToJobAction, dashboardLoader, jobsLoader } from '@features/jobseeker';
// import { RecruiterPlaceholderPage } from '@features/recruiter/RecruiterPlaceholderPage';
import { AdminPlaceholderPage } from '@features/admin/AdminPlaceholderPage';

const withRoleGate = (allowedRoles: (typeof routeAccess)[keyof typeof routeAccess], element: ReactElement) => (
  <RouteGuard allowedRoles={allowedRoles}>{element}</RouteGuard>
);

export const router = createBrowserRouter([
  { path: '/', element: <Navigate to="/dashboard" replace /> },
  { path: '/not-authorized', element: <NotAuthorized /> },
  {
    path: '/',
    element: <JobseekerLayout />,
    children: [
      {
        path: 'dashboard',
        loader: dashboardLoader,
        element: withRoleGate(routeAccess.dashboard, <DashboardPage />),
      },
      {
        path: 'jobs',
        loader: jobsLoader,
        element: withRoleGate(routeAccess.jobs, <JobsPage />),
      },
      {
        path: 'jobs/apply',
        action: applyToJobAction,
      },
      {
        path: 'applications',
        loader: applicationsLoader,
        element: withRoleGate(routeAccess.applications, <ApplicationsPage />),
      },
      { path: 'messages', element: withRoleGate(routeAccess.messages, <MessagesPage />) },
      { path: 'saved', element: withRoleGate(routeAccess.saved, <SavedJobsPage />) },
      { path: 'profile', element: withRoleGate(routeAccess.profile, <ProfilePage />) },
      { path: 'settings', element: withRoleGate(routeAccess.settings, <SettingsPage />) },
    //   {
    //     path: 'recruiter',
    //     element: withRoleGate(routeAccess.recruiterDashboard, <RecruiterPlaceholderPage title="Recruiter Dashboard" />),
    //   },
    //   {
    //     path: 'recruiter/jobs',
    //     element: withRoleGate(routeAccess.recruiterJobs, <RecruiterPlaceholderPage title="Recruiter Jobs" />),
    //   },
      {
        path: 'admin',
        element: withRoleGate(routeAccess.adminDashboard, <AdminPlaceholderPage title="Admin Dashboard" />),
      },
      {
        path: 'admin/users',
        element: withRoleGate(routeAccess.adminUsers, <AdminPlaceholderPage title="Admin Users" />),
      },
    ],
  },
]);
