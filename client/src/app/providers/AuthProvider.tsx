import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import type { PropsWithChildren } from "react";
import type { AuthMeResponse } from "@features/auth/types/auth.types";
import type { Role } from "@shared/types";
import { ApiError, http } from "@shared/api/http";

interface AuthUser {
  userId: string;
  email: string;
  firstName?: string | null;
  lastName?: string | null;
  role?: string | null;
}

interface AuthContextValue {
  isAuthenticated: boolean;
  user: AuthUser | null;
  roles: Role[];
  login: (email: string, password: string) => Promise<Role[]>;
  register: (email: string, password: string) => Promise<Role[]>;
  logout: () => Promise<void>;
  refreshMe: () => Promise<Role[]>;
  isHydrating: boolean;
}

const AuthContext = createContext<AuthContextValue | null>(null);

interface AuthResponsePayload {
  user?: {
    userId?: string;
    email?: string;
    roles?: string[];
  };
}

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

export const AuthProvider = ({ children }: PropsWithChildren) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [roles, setRoles] = useState<Role[]>([]);
  const [isHydrating, setIsHydrating] = useState(true);

  const refreshMe = useCallback(async (): Promise<Role[]> => {
    try {
      const response = await http.get<AuthMeResponse>("/api/auth/me");
      if (
        !response.data.is_authenticated ||
        !response.data.user_id ||
        !response.data.email
      ) {
        setUser(null);
        setRoles([]);
        return [];
      }

      setUser({
        userId: response.data.user_id,
        email: response.data.email,
        firstName: response.data.first_name,
        lastName: response.data.last_name,
        role: response.data.role,
      });
      const parsedRoles = normalizeRoles(response.data.roles ?? []);
      setRoles(parsedRoles);
      return parsedRoles;
    } catch {
      setUser(null);
      setRoles([]);
      return [];
    }
  }, []);

  const login = useCallback(
    async (email: string, password: string) => {
      const response = await http.post<AuthResponsePayload>("/api/auth/login", {
        email,
        password,
      });

      const userId = response.data.user?.userId;
      const userEmail = response.data.user?.email;
      const parsedRoles = normalizeRoles(response.data.user?.roles ?? []);

      if (userId && userEmail) {
        setUser({ userId, email: userEmail });
        setRoles(parsedRoles);
        return parsedRoles;
      }

      return refreshMe();
    },
    [refreshMe],
  );

  const register = useCallback(
    async (email: string, password: string) => {
      const response = await http.post<AuthResponsePayload>(
        "/api/auth/register",
        { email, password },
      );

      const userId = response.data.user?.userId;
      const userEmail = response.data.user?.email;
      const parsedRoles = normalizeRoles(response.data.user?.roles ?? []);

      if (userId && userEmail) {
        setUser({ userId, email: userEmail });
        setRoles(parsedRoles);
        return parsedRoles;
      }

      return refreshMe();
    },
    [refreshMe],
  );

  const logout = useCallback(async () => {
    try {
      await http.post("/api/auth/logout");
    } catch (error) {
      if (!(error instanceof ApiError) || error.status !== 401) {
        throw error;
      }
    }

    setUser(null);
    setRoles([]);
  }, []);

  useEffect(() => {
    const hydrate = async () => {
      await refreshMe();
      setIsHydrating(false);
    };

    void hydrate();
  }, [refreshMe]);

  const value = useMemo<AuthContextValue>(
    () => ({
      isAuthenticated: !!user,
      user,
      roles,
      login,
      register,
      logout,
      refreshMe,
      isHydrating,
    }),
    [user, roles, login, logout, refreshMe, isHydrating, register],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
  }

  return context;
};
