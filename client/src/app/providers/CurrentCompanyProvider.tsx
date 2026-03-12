import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import type { PropsWithChildren } from "react";
import { http, setActiveCompanyHeader } from "@shared/api/http";
import { useAuth } from "@app/providers/AuthProvider";
import { useSetup } from "@app/providers/SetupProvider";
import {
  CURRENT_COMPANY_STORAGE_KEY,
} from "@app/providers/contextStorage";
import { readStorage, writeStorage } from "@shared/utils/storage";

export interface CurrentCompany {
  id: string;
  name: string;
  primaryEmail?: string | null;
}

interface CurrentCompanyContextValue {
  currentCompany: CurrentCompany | null;
  availableCompanies: CurrentCompany[];
  isLoading: boolean;
  setCurrentCompany: (companyId: string) => void;
  refresh: () => Promise<void>;
}

interface AuthMeResponse {
  isAuthenticated?: boolean;
  activeCompanyId?: string | null;
  companyIds?: string[];
}

interface SetupStatusResponse {
  activeCompanyId?: string | null;
  company?: {
    id?: string;
    name?: string;
    primaryEmail?: string | null;
  } | null;
}

const CurrentCompanyContext = createContext<CurrentCompanyContextValue | null>(
  null,
);

export const CurrentCompanyProvider = ({ children }: PropsWithChildren) => {
  const { isAuthenticated, isHydrating } = useAuth();
  const { status, isLoading: isSetupLoading } = useSetup();
  const [availableCompanies, setAvailableCompanies] = useState<CurrentCompany[]>(
    [],
  );
  const [currentCompanyId, setCurrentCompanyId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const loadCompanies = useCallback(async () => {
    if (isHydrating) {
      return;
    }

    setIsLoading(true);

    if (!isAuthenticated || isSetupLoading || status.requiresSetup) {
      setAvailableCompanies([]);
      setCurrentCompanyId(null);
      setActiveCompanyHeader(null);
      setIsLoading(false);
      return;
    }

    try {
      const [meResponse, setupStatusResponse] = await Promise.all([
        http.get<AuthMeResponse>("/api/auth/me"),
        http.get<SetupStatusResponse>("/api/account/setup-status"),
      ]);

      const discoveredCompanyIds = new Set<string>(
        (meResponse.data.companyIds ?? []).filter(Boolean),
      );

      if (setupStatusResponse.data.activeCompanyId) {
        discoveredCompanyIds.add(setupStatusResponse.data.activeCompanyId);
      }

      if (setupStatusResponse.data.company?.id) {
        discoveredCompanyIds.add(setupStatusResponse.data.company.id);
      }

      const companies = Array.from(discoveredCompanyIds).map<CurrentCompany>((id) => {
        if (setupStatusResponse.data.company?.id === id) {
          return {
            id,
            name: setupStatusResponse.data.company.name?.trim() || "Company",
            primaryEmail: setupStatusResponse.data.company.primaryEmail ?? null,
          };
        }

        return {
          id,
          name: "Company",
          primaryEmail: null,
        };
      });

      const storedCompanyId = readStorage<string | null>(
        CURRENT_COMPANY_STORAGE_KEY,
        null,
      );

      const resolvedCompanyId =
        storedCompanyId && companies.some((company) => company.id === storedCompanyId)
          ? storedCompanyId
          : meResponse.data.activeCompanyId ||
            setupStatusResponse.data.activeCompanyId ||
            companies[0]?.id ||
            null;

      setAvailableCompanies(companies);
      setCurrentCompanyId(resolvedCompanyId);
    } catch {
      setAvailableCompanies([]);
      setCurrentCompanyId(null);
      setActiveCompanyHeader(null);
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated, isHydrating, isSetupLoading, status.requiresSetup]);

  useEffect(() => {
    if (isHydrating) {
      return;
    }

    void loadCompanies();
  }, [isHydrating, loadCompanies]);

  useEffect(() => {
    setActiveCompanyHeader(currentCompanyId);
    writeStorage(CURRENT_COMPANY_STORAGE_KEY, currentCompanyId);
  }, [currentCompanyId]);

  const setCurrentCompany = (companyId: string) => {
    setCurrentCompanyId(companyId);
  };

  const currentCompany = useMemo(
    () => availableCompanies.find((company) => company.id === currentCompanyId) ?? null,
    [availableCompanies, currentCompanyId],
  );

  const value = useMemo<CurrentCompanyContextValue>(
    () => ({
      currentCompany,
      availableCompanies,
      isLoading,
      setCurrentCompany,
      refresh: loadCompanies,
    }),
    [currentCompany, availableCompanies, isLoading, loadCompanies],
  );

  return (
    <CurrentCompanyContext.Provider value={value}>
      {children}
    </CurrentCompanyContext.Provider>
  );
};

export const useCurrentCompany = () => {
  const context = useContext(CurrentCompanyContext);
  if (!context) {
    throw new Error("useCurrentCompany must be used within CurrentCompanyProvider");
  }

  return context;
};
