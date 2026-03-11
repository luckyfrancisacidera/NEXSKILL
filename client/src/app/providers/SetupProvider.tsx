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
import { RecruiterInitialSetupModal } from "@shared/components/setup/RecruiterInitialSetupModal";
import { CompanyAdminInitialSetupModal } from "@shared/components/setup/CompanyAdminInitialSetupModal";

type SetupType = "recruiter" | "companyAdmin" | null;

interface SetupStatus {
  requiresSetup: boolean;
  type: SetupType;
}

interface SetupContextValue {
  status: SetupStatus;
  refresh: () => Promise<void>;
}

const SetupContext = createContext<SetupContextValue | null>(null);

export const SetupProvider = ({ children }: PropsWithChildren) => {
  const { isAuthenticated, isHydrating } = useAuth();
  const [status, setStatus] = useState<SetupStatus>({
    requiresSetup: false,
    type: null,
  });

  const loadStatus = useCallback(async () => {
    if (!isAuthenticated) {
      setStatus({ requiresSetup: false, type: null });
      return;
    }

    const response = await http.get<{
      requiresSetup?: boolean;
      type?: "recruiter" | "companyAdmin";
    }>("/api/account/setup-status");

    setStatus({
      requiresSetup: response.data.requiresSetup ?? false,
      type: (response.data.type as SetupType) ?? null,
    });
  }, [isAuthenticated]);

  useEffect(() => {
    if (isHydrating) return;
    void loadStatus();
  }, [isHydrating, loadStatus]);

  const handleCompleted = async () => {
    await loadStatus();
  };

  const value = useMemo<SetupContextValue>(
    () => ({
      status,
      refresh: loadStatus,
    }),
    [status, loadStatus],
  );

  const showRecruiterSetup =
    status.requiresSetup && status.type === "recruiter";
  const showCompanyAdminSetup =
    status.requiresSetup && status.type === "companyAdmin";

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

export const useSetup = () => {
  const context = useContext(SetupContext);
  if (!context) {
    throw new Error("useSetup must be used within SetupProvider");
  }

  return context;
};

