/* =========================================
   SETUP PROVIDER
   Tracks post-login setup requirements and mounts the correct setup modal.
   Related: AuthProvider, account setup endpoints, route guards
========================================= */

/* eslint-disable react-refresh/only-export-components */
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import type { PropsWithChildren } from "react";
import { http } from "@shared/api/http";
import { useAuth } from "@app/providers/AuthProvider";
import { RecruiterInitialSetupModal } from "@shared/components/overlay/setup/RecruiterInitialSetupModal";
import { CompanyAdminInitialSetupModal } from "@shared/components/overlay/setup/CompanyAdminInitialSetupModal";
import { getDefaultRouteForRoles } from "@shared/utils/permissions";
import { normalizeSetupType, type SetupType } from "@shared/utils/role";

interface SetupStatus {
  requiresSetup: boolean;
  type: SetupType;
}

interface SetupContextValue {
  status: SetupStatus;
  isLoading: boolean;
  refresh: () => Promise<void>;
}

const SetupContext = createContext<SetupContextValue | null>(null);

/* =========================================
   SETUP STATE
========================================= */

export const SetupProvider = ({ children }: PropsWithChildren) => {
  const { isAuthenticated, isHydrating, roles } = useAuth();
  const [status, setStatus] = useState<SetupStatus>({
    requiresSetup: false,
    type: null,
  });
  const [isLoading, setIsLoading] = useState(true);

  const loadStatus = useCallback(async () => {
    // Setup status is role-sensitive and can change after auth or tenant context
    // changes, so providers and guards share this one refresh path.
    if (isHydrating) {
      return;
    }

    setIsLoading(true);

    if (!isAuthenticated) {
      setStatus({ requiresSetup: false, type: null });
      setIsLoading(false);
      return;
    }

    try {
      const response = await http.get<{
        requiresSetup?: boolean;
        type?: string;
      }>("/api/account/setup-status");

      setStatus({
        requiresSetup: response.data.requiresSetup ?? false,
        type: normalizeSetupType(response.data.type),
      });
    } catch {
      setStatus({ requiresSetup: false, type: null });
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated, isHydrating]);

  useEffect(() => {
    if (isHydrating) {
      return;
    }

    void loadStatus();
  }, [isHydrating, loadStatus]);

  const handleCompleted = async () => {
    // Force a fresh setup-status read before redirecting so the next route lands
    // on the role's real post-setup default instead of stale pre-setup state.
    await loadStatus();
    const redirectTo = getDefaultRouteForRoles(roles);
    window.location.replace(redirectTo);
  };

  const value = useMemo<SetupContextValue>(
    () => ({
      status,
      isLoading,
      refresh: loadStatus,
    }),
    [status, isLoading, loadStatus],
  );

  const showRecruiterSetup =
    status.requiresSetup && status.type === "recruiter";
  const showCompanyAdminSetup =
    status.requiresSetup && status.type === "companyadmin";

  return (
    <SetupContext.Provider value={value}>
      {children}
      {showRecruiterSetup && (
        <RecruiterInitialSetupModal onCompleted={handleCompleted} />
      )}
      {showCompanyAdminSetup && (
        <CompanyAdminInitialSetupModal onCompleted={handleCompleted} />
      )}
    </SetupContext.Provider>
  );
};

/* =========================================
   SETUP HOOK
========================================= */

export const useSetup = () => {
  const context = useContext(SetupContext);
  if (!context) {
    throw new Error("useSetup must be used within SetupProvider");
  }

  return context;
};

