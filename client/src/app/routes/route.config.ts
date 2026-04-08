/* =========================================
   ROUTE ACCESS MAP
   Declares the canonical role-to-route access matrix used by guards and route helpers.
========================================= */

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
  | "superAdminCompanyRequests"
  | "superAdminCompanyAdmins"
  | "superAdminRecruiters"
  | "superAdminUsers"
  | "companyAdminDashboard"
  | "companyAdminBilling"
  | "companyAdminEmployees"
  | "companyAdminCandidates";

export const routeAccess: Record<AppRouteKey, Role[]> = {
  dashboard: ["jobseeker"],
  jobs: ["jobseeker"],
  applications: ["jobseeker"],
  offers: ["jobseeker"],
  saved: ["jobseeker"],
  profile: ["jobseeker", "recruiter", "companyadmin", "superadmin"],
  recruiterDashboard: ["recruiter"],
  recruiterJobs: ["recruiter"],
  recruiterCandidates: ["recruiter"],
  recruiterHires: ["recruiter"],
  recruiterInterviews: ["recruiter"],
  superAdminDashboard: ["superadmin"],
  superAdminCompanyRequests: ["superadmin"],
  superAdminCompanyAdmins: ["superadmin"],
  superAdminRecruiters: ["superadmin"],
  superAdminUsers: ["superadmin"],
  companyAdminDashboard: ["companyadmin"],
  companyAdminBilling: ["companyadmin"],
  companyAdminEmployees: ["companyadmin"],
  companyAdminCandidates: ["companyadmin"],
};
