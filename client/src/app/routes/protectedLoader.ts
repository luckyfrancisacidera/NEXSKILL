import { redirect } from "react-router-dom";
import {
  http,
  setActiveCompanyHeader,
  setActiveRecruiterProfileHeader,
} from "@shared/api/http";
import { readStorage } from "@shared/utils/storage";
import {
  getDefaultRouteForRoles,
  hasAnyAllowedRole,
} from "@shared/utils/permissions";
import type { Role } from "@shared/types";
import {
  CURRENT_COMPANY_STORAGE_KEY,
  CURRENT_RECRUITER_PROFILE_STORAGE_KEY,
} from "@app/providers/contextStorage";

interface AuthMeResponse {
  isAuthenticated?: boolean;
  roles?: string[];
  activeCompanyId?: string | null;
  activeRecruiterProfileId?: string | null;
  companyIds?: string[];
  recruiterProfileIds?: string[];
}

interface SetupStatusResponse {
  requiresSetup?: boolean;
  activeCompanyId?: string | null;
  company?: {
    id?: string;
  } | null;
}

interface ProtectedLoaderGuardOptions<T> {
  allowedRoles: Role[];
  fallback: () => T;
  requireCompany?: boolean;
  requireRecruiter?: boolean;
}

type ProtectedLoaderGuardResult<T> =
  | { shouldLoad: true }
  | { shouldLoad: false; data: T };

const normalizeRole = (role: string): Role | null => {
  const normalized = role.trim().toLowerCase();

  switch (normalized) {
    case "admin":
      return "admin";
    case "superadmin":
      return "superAdmin";
    case "companyadmin":
      return "companyAdmin";
    case "recruiter":
      return "recruiter";
    case "jobseeker":
      return "jobseeker";
    default:
      return null;
  }
};

const normalizeRoles = (roles: string[]): Role[] =>
  roles
    .map(normalizeRole)
    .filter((role): role is Role => role !== null);

const resolvePreferredId = (
  storedId: string | null,
  activeId: string | null | undefined,
  availableIds: string[],
) => {
  if (storedId && availableIds.includes(storedId)) {
    return storedId;
  }

  if (activeId && availableIds.includes(activeId)) {
    return activeId;
  }

  return availableIds[0] ?? null;
};

export const guardProtectedLoader = async <T>({
  allowedRoles,
  fallback,
  requireCompany = false,
  requireRecruiter = false,
}: ProtectedLoaderGuardOptions<T>): Promise<ProtectedLoaderGuardResult<T>> => {
  const meResponse = await http.get<AuthMeResponse>("/api/auth/me");
  const me = meResponse.data;

  if (!me.isAuthenticated) {
    throw redirect("/login");
  }

  const roles = normalizeRoles(me.roles ?? []);
  if (!hasAnyAllowedRole(roles, allowedRoles)) {
    throw redirect(getDefaultRouteForRoles(roles));
  }

  const setupResponse = await http.get<SetupStatusResponse>(
    "/api/account/setup-status",
  );
  const setup = setupResponse.data;

  if (setup.requiresSetup) {
    setActiveCompanyHeader(null);
    setActiveRecruiterProfileHeader(null);
    return { shouldLoad: false, data: fallback() };
  }

  const companyIds = new Set<string>((me.companyIds ?? []).filter(Boolean));
  if (setup.activeCompanyId) {
    companyIds.add(setup.activeCompanyId);
  }
  if (setup.company?.id) {
    companyIds.add(setup.company.id);
  }

  const resolvedCompanyId = resolvePreferredId(
    readStorage<string | null>(CURRENT_COMPANY_STORAGE_KEY, null),
    me.activeCompanyId,
    Array.from(companyIds),
  );

  if (requireCompany) {
    if (!resolvedCompanyId) {
      setActiveCompanyHeader(null);
      return { shouldLoad: false, data: fallback() };
    }

    setActiveCompanyHeader(resolvedCompanyId);
  } else {
    setActiveCompanyHeader(null);
  }

  const resolvedRecruiterProfileId = resolvePreferredId(
    readStorage<string | null>(CURRENT_RECRUITER_PROFILE_STORAGE_KEY, null),
    me.activeRecruiterProfileId,
    (me.recruiterProfileIds ?? []).filter(Boolean),
  );

  if (requireRecruiter) {
    if (!resolvedRecruiterProfileId) {
      setActiveRecruiterProfileHeader(null);
      return { shouldLoad: false, data: fallback() };
    }

    setActiveRecruiterProfileHeader(resolvedRecruiterProfileId);
  } else {
    setActiveRecruiterProfileHeader(null);
  }

  return { shouldLoad: true };
};
