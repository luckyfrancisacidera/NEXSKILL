/* =========================================
   SHARED ROLES
========================================= */

import type { Role } from "@shared/types";

const ROLE_ALIASES: Record<string, Role> = {
  admin: "superadmin",
  superadmin: "superadmin",
  companyadmin: "companyadmin",
  recruiter: "recruiter",
  jobseeker: "jobseeker",
};

export const normalizeRole = (role: string): Role | null => {
  const normalized = role.trim().toLowerCase();
  return ROLE_ALIASES[normalized] ?? null;
};

export const normalizeRoles = (roles: readonly string[]): Role[] =>
  roles
    .map(normalizeRole)
    .filter((role): role is Role => role !== null);

export type SetupType = "recruiter" | "companyadmin" | null;

export const normalizeSetupType = (value: string | null | undefined): SetupType => {
  const normalized = value?.trim().toLowerCase();

  switch (normalized) {
    case "recruiter":
      return "recruiter";
    case "companyadmin":
      return "companyadmin";
    default:
      return null;
  }
};
