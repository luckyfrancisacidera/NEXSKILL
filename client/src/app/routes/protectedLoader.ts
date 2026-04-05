/* =========================================
   AUTH GUARDS
   Shared loader-side access checks for auth, setup, company context, and recruiter context.
   Related: AuthProvider, SetupProvider, routes.guard
========================================= */

import { redirect } from "react-router-dom";
import {
  http,
  setActiveCompanyHeader,
  setActiveRecruiterProfileHeader,
} from "@shared/api/http";
import type { AuthMeResponse } from "@features/auth/types/auth.types";
import { readStorage } from "@shared/utils/storage";
import {
  getDefaultRouteForRoles,
  hasAnyAllowedRole,
} from "@shared/utils/permissions";
import type { Role } from "@shared/types";
import { normalizeRoles } from "@shared/utils/role";
import {
  CURRENT_COMPANY_STORAGE_KEY,
  CURRENT_RECRUITER_PROFILE_STORAGE_KEY,
} from "@app/providers/contextStorage";

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

/* =========================================
   CONTEXT RESOLUTION
========================================= */

const resolvePreferredId = (
  storedId: string | null,
  activeId: string | null | undefined,
  availableIds: string[],
) => {
  // Prefer stable client state first so reloads preserve the user's chosen
  // company/profile scope when that scope is still valid for the session.
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
  // Loaders cannot rely on mounted React providers, so this duplicates the
  // minimum auth/setup bootstrap needed to keep route data access consistent.
  const meResponse = await http.get<AuthMeResponse>("/api/auth/me");
  const me = meResponse.data;

  if (!me.is_authenticated) {
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

  /* =========================================
     COMPANY CONTEXT
  ========================================= */

  const companyIds = new Set<string>((me.company_ids ?? []).filter(Boolean));
  if (setup.activeCompanyId) {
    companyIds.add(setup.activeCompanyId);
  }
  if (setup.company?.id) {
    companyIds.add(setup.company.id);
  }

  const resolvedCompanyId = resolvePreferredId(
    readStorage<string | null>(CURRENT_COMPANY_STORAGE_KEY, null),
    me.active_company_id,
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

  /* =========================================
     RECRUITER CONTEXT
  ========================================= */

  const resolvedRecruiterProfileId = resolvePreferredId(
    readStorage<string | null>(CURRENT_RECRUITER_PROFILE_STORAGE_KEY, null),
    me.active_recruiter_profile_id,
    (me.recruiter_profile_ids ?? []).filter(Boolean),
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
