import type { Role } from "@shared/types";

export type AppRouteKey =
  | "dashboard"
  | "jobs"
  | "applications"
  | "offers"
  | "messages"
  | "saved"
  | "profile"
  | "settings"
  | "recruiterDashboard"
  | "recruiterJobs"
  | "recruiterCandidates"
  | "recruiterInterviews"
  | "recruiterAutomations"
  | "recruiterSettings"
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
  profile: ["jobseeker"],
  settings: ["jobseeker", "recruiter"],
  recruiterDashboard: ["recruiter"],
  recruiterJobs: ["recruiter"],
  recruiterCandidates: ["recruiter"],
  recruiterInterviews: ["recruiter"],
  recruiterAutomations: ["recruiter"],
  recruiterSettings: ["recruiter"],
  superAdminDashboard: ["admin", "superAdmin"],
  superAdminCompanyAdmins: ["admin", "superAdmin"],
  superAdminRecruiters: ["admin", "superAdmin"],
  companyAdminDashboard: ["companyAdmin"],
};
