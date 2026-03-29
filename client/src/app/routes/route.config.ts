import type { Role } from "@shared/types";

export type AppRouteKey =
  | "dashboard"
  | "jobs"
  | "applications"
  | "offers"
  | "saved"
  | "profile"
  | "recruiterDashboard"
  | "recruiterJobs"
  | "recruiterCandidates"
  | "recruiterHires"
  | "recruiterInterviews"
  | "superAdminDashboard"
  | "superAdminCompanyAdmins"
  | "superAdminRecruiters"
  | "superAdminUsers"
  | "companyAdminDashboard"
  | "companyAdminEmployees"
  | "companyAdminCandidates";

export const routeAccess: Record<AppRouteKey, Role[]> = {
  dashboard: ["jobseeker"],
  jobs: ["jobseeker"],
  applications: ["jobseeker"],
  offers: ["jobseeker"],
  saved: ["jobseeker"],
  profile: ["jobseeker", "recruiter", "companyAdmin", "superAdmin", "admin"],
  recruiterDashboard: ["recruiter"],
  recruiterJobs: ["recruiter"],
  recruiterCandidates: ["recruiter"],
  recruiterHires: ["recruiter"],
  recruiterInterviews: ["recruiter"],
  superAdminDashboard: ["admin", "superAdmin"],
  superAdminCompanyAdmins: ["admin", "superAdmin"],
  superAdminRecruiters: ["admin", "superAdmin"],
  superAdminUsers: ["admin", "superAdmin"],
  companyAdminDashboard: ["companyAdmin"],
  companyAdminEmployees: ["companyAdmin"],
  companyAdminCandidates: ["companyAdmin"],
};
