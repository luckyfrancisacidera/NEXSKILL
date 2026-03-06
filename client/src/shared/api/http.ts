import axios, { AxiosError, type AxiosRequestConfig, type InternalAxiosRequestConfig } from "axios";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ?? "http://localhost:5062";

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


interface RetryableAxiosRequestConfig extends InternalAxiosRequestConfig {
  _retry?: boolean;
}

let refreshPromise: Promise<void> | null = null;

const shouldSkipRefresh = (config?: AxiosRequestConfig) => {
  const url = config?.url ?? "";
  return url.includes("/api/auth/login") || url.includes("/api/auth/register") || url.includes("/api/auth/refresh");
};

const refreshAccessToken = async () => {
  if (!refreshPromise) {
    refreshPromise = http.post("/api/auth/refresh").then(() => undefined).finally(() => {
      refreshPromise = null;
    });
  }

  await refreshPromise;
};


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
        await refreshAccessToken();
        return await http(originalRequest);
      } catch {
        return Promise.reject(new ApiError("Session expired. Please log in again.", 401));
      }
    }


    const responseData = error.response?.data as
      | { message?: string }
      | undefined;
    const apiError = new ApiError(
      responseData?.message ?? "Request failed",
      error.response?.status,
      error.response?.data,
    );
    return Promise.reject(apiError);
  },
);
