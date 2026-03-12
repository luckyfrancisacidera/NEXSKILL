import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import type { PropsWithChildren } from "react";
import {
  http,
  setActiveRecruiterProfileHeader,
} from "@shared/api/http";
import { useAuth } from "@app/providers/AuthProvider";
import { useSetup } from "@app/providers/SetupProvider";
import {
  CURRENT_RECRUITER_PROFILE_STORAGE_KEY,
} from "@app/providers/contextStorage";
import { readStorage, writeStorage } from "@shared/utils/storage";
import { isRecruiterRole } from "@shared/utils/permissions";

export interface RecruiterProfileSummary {
  id: string;
  companyName?: string | null;
  companyEmail?: string | null;
}

interface CurrentRecruiterContextValue {
  currentProfile: RecruiterProfileSummary | null;
  profiles: RecruiterProfileSummary[];
  isLoading: boolean;
  setCurrentProfile: (profileId: string) => void;
  refresh: () => Promise<void>;
}

interface AuthMeResponse {
  isAuthenticated?: boolean;
  activeRecruiterProfileId?: string | null;
  recruiterProfileIds?: string[];
}

interface RecruiterProfileResponse {
  profile_id?: string;
  company_name?: string | null;
  company_email?: string | null;
}

const CurrentRecruiterContext =
  createContext<CurrentRecruiterContextValue | null>(null);

export const CurrentRecruiterProvider = ({
  children,
}: PropsWithChildren) => {
  const { isAuthenticated, isHydrating, roles } = useAuth();
  const { status, isLoading: isSetupLoading } = useSetup();
  const [profiles, setProfiles] = useState<RecruiterProfileSummary[]>([]);
  const [currentProfileId, setCurrentProfileId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const isRecruiter = isRecruiterRole(roles);

  const loadProfiles = useCallback(async () => {
    if (isHydrating) {
      return;
    }

    setIsLoading(true);

    if (!isAuthenticated || !isRecruiter || isSetupLoading || status.requiresSetup) {
      setProfiles([]);
      setCurrentProfileId(null);
      setActiveRecruiterProfileHeader(null);
      setIsLoading(false);
      return;
    }

    try {
      const meResponse = await http.get<AuthMeResponse>("/api/auth/me");
      const profileIds = (meResponse.data.recruiterProfileIds ?? []).filter(Boolean);

      if (profileIds.length === 0) {
        setProfiles([]);
        setCurrentProfileId(null);
        return;
      }

      let recruiterProfile: RecruiterProfileResponse | null = null;
      try {
        const response = await http.get<RecruiterProfileResponse>("/api/recruiter/profile");
        recruiterProfile = response.data;
      } catch {
        recruiterProfile = null;
      }

      const availableProfiles = profileIds.map<RecruiterProfileSummary>((profileId) => ({
        id: profileId,
        companyName:
          recruiterProfile?.profile_id === profileId
            ? recruiterProfile.company_name ?? null
            : null,
        companyEmail:
          recruiterProfile?.profile_id === profileId
            ? recruiterProfile.company_email ?? null
            : null,
      }));

      const storedProfileId = readStorage<string | null>(
        CURRENT_RECRUITER_PROFILE_STORAGE_KEY,
        null,
      );

      const resolvedProfileId =
        storedProfileId && availableProfiles.some((profile) => profile.id === storedProfileId)
          ? storedProfileId
          : meResponse.data.activeRecruiterProfileId ||
            availableProfiles[0]?.id ||
            null;

      setProfiles(availableProfiles);
      setCurrentProfileId(resolvedProfileId);
    } catch {
      setProfiles([]);
      setCurrentProfileId(null);
      setActiveRecruiterProfileHeader(null);
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated, isHydrating, isRecruiter, isSetupLoading, status.requiresSetup]);

  useEffect(() => {
    if (isHydrating) {
      return;
    }

    void loadProfiles();
  }, [isHydrating, loadProfiles]);

  useEffect(() => {
    setActiveRecruiterProfileHeader(currentProfileId);
    writeStorage(CURRENT_RECRUITER_PROFILE_STORAGE_KEY, currentProfileId);
  }, [currentProfileId]);

  const setCurrentProfile = (profileId: string) => {
    setCurrentProfileId(profileId);
  };

  const currentProfile = useMemo(
    () => profiles.find((profile) => profile.id === currentProfileId) ?? null,
    [profiles, currentProfileId],
  );

  const value = useMemo<CurrentRecruiterContextValue>(
    () => ({
      currentProfile,
      profiles,
      isLoading,
      setCurrentProfile,
      refresh: loadProfiles,
    }),
    [currentProfile, profiles, isLoading, loadProfiles],
  );

  return (
    <CurrentRecruiterContext.Provider value={value}>
      {children}
    </CurrentRecruiterContext.Provider>
  );
};

export const useCurrentRecruiter = () => {
  const context = useContext(CurrentRecruiterContext);
  if (!context) {
    throw new Error(
      "useCurrentRecruiter must be used within CurrentRecruiterProvider",
    );
  }

  return context;
};
