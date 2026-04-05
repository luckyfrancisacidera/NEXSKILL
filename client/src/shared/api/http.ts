/* =========================================
   API CLIENT
   Shared Axios client with auth-refresh retry logic and active tenant/profile headers.
   Related: AuthProvider, protectedLoader, recruiter/company context providers
========================================= */

import axios, { AxiosError, type AxiosRequestConfig, type InternalAxiosRequestConfig } from "axios";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "";

export class ApiError extends Error {
  public readonly status?: number;
  public readonly data?: unknown;

  constructor(message: string, status?: number, data?: unknown) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.data = data;
  }
}

export const http = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  timeout: 10_000,
});

/* =========================================
   REQUEST CONTEXT
========================================= */

const requestContext: {
  companyId: string | null;
  recruiterProfileId: string | null;
} = {
  companyId: null,
  recruiterProfileId: null,
};

export const setActiveCompanyHeader = (companyId: string | null) => {
  requestContext.companyId = companyId;
};

export const setActiveRecruiterProfileHeader = (
  recruiterProfileId: string | null,
) => {
  requestContext.recruiterProfileId = recruiterProfileId;
};

interface RetryableAxiosRequestConfig extends InternalAxiosRequestConfig {
  _retry?: boolean;
}

let refreshPromise: Promise<void> | null = null;

const extractApiErrorMessage = (data: unknown) => {
  if (typeof data === "string" && data.trim()) {
    return data;
  }

  if (!data || typeof data !== "object") {
    return null;
  }

  const payload = data as {
    message?: string;
    title?: string;
    error?: string;
    errors?: string[] | Record<string, string[]>;
  };

  if (payload.message?.trim()) {
    return payload.message;
  }

  if (payload.title?.trim()) {
    return payload.title;
  }

  if (payload.error?.trim()) {
    return payload.error;
  }

  if (Array.isArray(payload.errors) && payload.errors.length > 0) {
    return payload.errors.filter(Boolean).join(" ");
  }

  if (payload.errors && typeof payload.errors === "object") {
    const messages = Object.values(payload.errors)
      .flatMap((value) => value)
      .filter(Boolean);
    if (messages.length > 0) {
      return messages.join(" ");
    }
  }

  return null;
};

const shouldSkipRefresh = (config?: AxiosRequestConfig) => {
  const url = config?.url ?? "";
  return url.includes("/api/auth/login") || url.includes("/api/auth/register") || url.includes("/api/auth/refresh");
};

const refreshAccessToken = async () => {
  // Share one in-flight refresh across concurrent 401s so parallel requests do
  // not stampede the refresh endpoint or race to overwrite cookie state.
  if (!refreshPromise) {
    refreshPromise = http.post("/api/auth/refresh").then(() => undefined).finally(() => {
      refreshPromise = null;
    });
  }

  await refreshPromise;
};

http.interceptors.request.use((config) => {
  config.headers = config.headers ?? {};

  // Inject explicit company/profile scope here so feature services stay unaware
  // of header mechanics and only manage business-level context selection.
  if (requestContext.companyId) {
    config.headers["X-Company-Id"] = requestContext.companyId;
  } else {
    delete config.headers["X-Company-Id"];
  }

  if (requestContext.recruiterProfileId) {
    config.headers["X-Recruiter-Profile-Id"] = requestContext.recruiterProfileId;
  } else {
    delete config.headers["X-Recruiter-Profile-Id"];
  }

  return config;
});

http.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as RetryableAxiosRequestConfig | undefined;

    if (
      error.response?.status === 401
      && originalRequest
      && !originalRequest._retry
      && !shouldSkipRefresh(originalRequest)
    ) {
      originalRequest._retry = true;

      try {
        // Retry once after refresh so callers can treat most expired-session cases
        // as transparent recovery instead of duplicating retry behavior per request.
        await refreshAccessToken();
        return await http(originalRequest);
      } catch {
        return Promise.reject(new ApiError("Session expired. Please log in again.", 401));
      }
    }

    const apiError = new ApiError(
      extractApiErrorMessage(error.response?.data) ?? error.message ?? "Request failed",
      error.response?.status,
      error.response?.data,
    );
    return Promise.reject(apiError);
  },
);
