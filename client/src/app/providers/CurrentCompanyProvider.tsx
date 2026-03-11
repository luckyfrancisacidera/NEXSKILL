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
import { readStorage, writeStorage } from "@shared/utils/storage";

export interface CurrentCompany {
  id: string;
  name: string;
  primaryEmail?: string | null;
}

interface CurrentCompanyContextValue {
  currentCompany: CurrentCompany | null;
  availableCompanies: CurrentCompany[];
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

const CURRENT_COMPANY_STORAGE_KEY = "app.currentCompanyId";

const CurrentCompanyContext = createContext<CurrentCompanyContextValue | null>(
  null,
);

export const CurrentCompanyProvider = ({ children }: PropsWithChildren) => {
  const { isAuthenticated } = useAuth();
  const [availableCompanies, setAvailableCompanies] = useState<CurrentCompany[]>(
    [],
  );
  const [currentCompanyId, setCurrentCompanyId] = useState<string | null>(null);

  const loadCompanies = useCallback(async () => {
    if (!isAuthenticated) {
      setAvailableCompanies([]);
      setCurrentCompanyId(null);
      setActiveCompanyHeader(null);
      return;
    }

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
  }, [isAuthenticated]);

  useEffect(() => {
    void loadCompanies();
  }, [loadCompanies]);

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
      setCurrentCompany,
      refresh: loadCompanies,
    }),
    [currentCompany, availableCompanies, loadCompanies],
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
