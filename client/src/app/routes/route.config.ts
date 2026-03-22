import type { Role } from "@shared/types";

export type AppRouteKey =
  | "dashboard"
  | "jobs"
  | "applications"
  | "offers"
  | "messages"
  | "saved"
  | "profile"
  | "recruiterDashboard"
  | "recruiterJobs"
  | "recruiterCandidates"
  | "recruiterInterviews"
  | "recruiterAutomations"
  | "superAdminDashboard"
  | "superAdminCompanyAdmins"
  | "superAdminRecruiters"
  | "companyAdminDashboard";

export const routeAccess: Record<AppRouteKey, Role[]> = {
  dashboard: ["jobseeker"],
  jobs: ["jobseeker"],
  applications: ["jobseeker"],
  offers: ["jobseeker"],
  messages: ["jobseeker"],
  saved: ["jobseeker"],
  profile: ["jobseeker", "recruiter", "companyAdmin", "superAdmin", "admin"],
  recruiterDashboard: ["recruiter"],
  recruiterJobs: ["recruiter"],
  recruiterCandidates: ["recruiter"],
  recruiterInterviews: ["recruiter"],
  recruiterAutomations: ["recruiter"],
  superAdminDashboard: ["admin", "superAdmin"],
  superAdminCompanyAdmins: ["admin", "superAdmin"],
  superAdminRecruiters: ["admin", "superAdmin"],
  companyAdminDashboard: ["companyAdmin"],
};
