import axios, { AxiosError } from "axios";

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

http.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
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
