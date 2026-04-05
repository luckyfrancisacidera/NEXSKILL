/* =========================================
   RECRUITER ROUTES
========================================= */

import { Navigate, Outlet } from "react-router-dom";
import { actionOnlyRoute, lazyRouteElement, protectedRoute, type AppRoute } from "@app/routes/route.helpers";
import {
  cancelInterviewAction,
  candidatesAction,
  deleteJobAction,
  updateCandidateAction,
  updateJobStatusAction,
  upsertInterviewAction,
  upsertJobAction,
} from "@features/recruiter/actions";
import {
  recruiterCandidateDetailLoader,
  recruiterCandidatesLoader,
  recruiterDashboardLoader,
  recruiterHiredEmployeesLoader,
  recruiterInterviewDetailLoader,
  recruiterInterviewsLoader,
  recruiterJobDetailLoader,
  recruiterJobsLoader,
} from "@features/recruiter/loaders";

export const recruiterRoutes: AppRoute = {
  path: "recruiter",
  element: <Outlet />,
  children: [
    protectedRoute({
      path: "dashboard",
      access: "recruiterDashboard",
      loader: recruiterDashboardLoader,
      element: lazyRouteElement(
        () => import("@features/recruiter/pages/RecruiterDashboardPage/RecruiterDashboardPage"),
        "RecruiterDashboardPage",
      ),
    }),
    {
      path: "job-posts",
      element: <Outlet />,
      children: [
        protectedRoute({
          index: true,
          access: "recruiterJobs",
          loader: recruiterJobsLoader,
          element: lazyRouteElement(
            () => import("@features/recruiter/pages/JobPostsPage/JobPostsPage"),
            "JobPostsPage",
          ),
        }),
        protectedRoute({
          path: "new",
          access: "recruiterJobs",
          loader: async () => ({}),
          action: upsertJobAction,
          element: lazyRouteElement(
            () => import("@features/recruiter/pages/JobFormPage/JobFormPage"),
            "JobFormPage",
            { mode: "create" },
          ),
        }),
        {
          path: ":jobId",
          element: <Outlet />,
          children: [
            protectedRoute({
              index: true,
              access: "recruiterJobs",
              loader: recruiterJobDetailLoader,
              element: lazyRouteElement(
                () => import("@features/recruiter/pages/JobDetailPage/JobDetailPage"),
                "JobDetailPage",
              ),
            }),
            protectedRoute({
              path: "edit",
              access: "recruiterJobs",
              loader: recruiterJobDetailLoader,
              action: upsertJobAction,
              element: lazyRouteElement(
                () => import("@features/recruiter/pages/JobFormPage/JobFormPage"),
                "JobFormPage",
                { mode: "edit" },
              ),
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
          element: lazyRouteElement(
            () => import("@features/recruiter/pages/CandidatesPage/CandidatesPage"),
            "CandidatesPage",
          ),
        }),
        protectedRoute({
          path: ":candidateId",
          access: "recruiterCandidates",
          loader: recruiterCandidateDetailLoader,
          action: updateCandidateAction,
          element: lazyRouteElement(
            () => import("@features/recruiter/pages/CandidateDetailPage/CandidateDetailPage"),
            "CandidateDetailPage",
          ),
        }),
      ],
    },
    {
      path: "offers",
      element: <Navigate to="/recruiter/candidates?stage=Offer" replace />,
    },
    {
      path: "hired",
      children: [
        protectedRoute({
          index: true,
          access: "recruiterHires",
          loader: recruiterHiredEmployeesLoader,
          element: lazyRouteElement(
            () => import("@features/recruiter/pages/HiredEmployeesPage/HiredEmployeesPage"),
            "HiredEmployeesPage",
          ),
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
          element: lazyRouteElement(
            () => import("@features/recruiter/pages/InterviewFormPage/InterviewFormPage"),
            "InterviewFormPage",
          ),
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
              element: lazyRouteElement(
                () => import("@features/recruiter/pages/InterviewFormPage/InterviewFormPage"),
                "InterviewFormPage",
              ),
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
