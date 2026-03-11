import { useMemo } from "react";

import { useAuth } from "@app/providers/AuthProvider";
import { useCurrentCompany } from "@app/providers/CurrentCompanyProvider";
import { useCurrentRecruiter } from "@app/providers/CurrentRecruiterProvider";
import { resolvePermissions } from "@shared/utils/permissions";

export const usePermissions = () => {
  const { roles } = useAuth();
  const { currentCompany } = useCurrentCompany();
  const { currentProfile } = useCurrentRecruiter();

  return useMemo(
    () =>
      resolvePermissions(roles, {
        hasCompanyContext: Boolean(currentCompany?.id),
        hasRecruiterContext: Boolean(currentProfile?.id),
      }),
    [currentCompany?.id, currentProfile?.id, roles],
  );
};
