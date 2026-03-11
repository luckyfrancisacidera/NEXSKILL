import type { Role } from "@shared/types";

export interface PermissionContextState {
  hasCompanyContext?: boolean;
  hasRecruiterContext?: boolean;
}

export const isSuperAdminRole = (roles: readonly Role[]) =>
  roles.includes("superAdmin") || roles.includes("admin");

export const isCompanyAdminRole = (roles: readonly Role[]) =>
  roles.includes("companyAdmin");

export const isRecruiterRole = (roles: readonly Role[]) =>
  roles.includes("recruiter");

export const hasAnyAllowedRole = (roles: readonly Role[], allowedRoles: readonly Role[]) =>
  allowedRoles.some((role) => roles.includes(role));

export const getDefaultRouteForRoles = (roles: readonly Role[]) => {
  if (isSuperAdminRole(roles)) return "/admin/super";
  if (isCompanyAdminRole(roles)) return "/admin/company";
  if (isRecruiterRole(roles)) return "/recruiter/dashboard";
  return "/dashboard";
};

export const resolvePermissions = (
  roles: readonly Role[],
  context: PermissionContextState = {},
) => {
  const isSuperAdmin = isSuperAdminRole(roles);
  const isCompanyAdmin = isCompanyAdminRole(roles);
  const isRecruiter = isRecruiterRole(roles);
  const hasCompanyContext = Boolean(context.hasCompanyContext);
  const hasRecruiterContext = Boolean(context.hasRecruiterContext);

  return {
    isSuperAdmin,
    isCompanyAdmin,
    isRecruiter,
    canManageCompanies: isSuperAdmin,
    canManageRecruiters: isSuperAdmin || (isCompanyAdmin && hasCompanyContext),
    canCreateJobs: isRecruiter && hasCompanyContext && hasRecruiterContext,
    canSendOffers: isRecruiter && hasCompanyContext && hasRecruiterContext,
    canHireCandidates: isRecruiter && hasCompanyContext && hasRecruiterContext,
  };
};
