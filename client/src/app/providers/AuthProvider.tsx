/* =========================================
   AUTH PROVIDER
   Owns authenticated user state, role normalization, and session hydration.
   Related: SetupProvider, routes.guard, protectedLoader
========================================= */

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import type { PropsWithChildren } from "react";
import type {
  AuthMeResponse,
  AuthMutationResponse,
  RegisterPayload,
} from "@features/auth/types/auth.types";
import type { Role } from "@shared/types";
import { ApiError, http } from "@shared/api/http";
import { normalizeRoles } from "@shared/utils/role";

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
  login: (email: string, password: string, rememberMe?: boolean) => Promise<Role[]>;
  register: (payload: RegisterPayload) => Promise<Role[]>;
  logout: () => Promise<void>;
  refreshMe: () => Promise<Role[]>;
  isHydrating: boolean;
  isAppTransitioning: boolean;
  startAppTransition: () => void;
  clearAppTransition: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

/* =========================================
   AUTH STATE
========================================= */

export const AuthProvider = ({ children }: PropsWithChildren) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [roles, setRoles] = useState<Role[]>([]);
  const [isHydrating, setIsHydrating] = useState(true);
  const [isAppTransitioning, setIsAppTransitioning] = useState(false);

  const refreshMe = useCallback(async (): Promise<Role[]> => {
    // Centralize session hydration here so route guards, providers, and loaders
    // all derive from one canonical "me" payload instead of diverging fetch rules.
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
    async (email: string, password: string, rememberMe = false) => {
      const response = await http.post<AuthMutationResponse>("/api/auth/login", {
        email,
        password,
        rememberMe,
      });

      const userId = response.data.user?.userId;
      const userEmail = response.data.user?.email;
      const firstName = response.data.user?.first_name;
      const lastName = response.data.user?.last_name;
      const parsedRoles = normalizeRoles(response.data.user?.roles ?? []);

      if (userId && userEmail) {
        setUser({ userId, email: userEmail, firstName, lastName });
        setRoles(parsedRoles);
        return parsedRoles;
      }

      return refreshMe();
    },
    [refreshMe],
  );

  const register = useCallback(
    async (payload: RegisterPayload) => {
      const response = await http.post<AuthMutationResponse>(
        "/api/auth/register",
        payload,
      );

      const userId = response.data.user?.userId;
      const userEmail = response.data.user?.email;
      const firstName = response.data.user?.first_name;
      const lastName = response.data.user?.last_name;
      const parsedRoles = normalizeRoles(response.data.user?.roles ?? []);

      if (userId && userEmail) {
        setUser({ userId, email: userEmail, firstName, lastName });
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
    // Clear transition state on logout so the next public route does not inherit
    // a protected-route loading surface from the previous session.
    setIsAppTransitioning(false);
  }, []);

  const startAppTransition = useCallback(() => {
    setIsAppTransitioning(true);
  }, []);

  const clearAppTransition = useCallback(() => {
    setIsAppTransitioning(false);
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
      isAppTransitioning,
      startAppTransition,
      clearAppTransition,
    }),
    [
      clearAppTransition,
      isAppTransitioning,
      isHydrating,
      login,
      logout,
      refreshMe,
      register,
      roles,
      startAppTransition,
      user,
    ],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

/* =========================================
   AUTH HOOK
========================================= */

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
  }

  return context;
};
