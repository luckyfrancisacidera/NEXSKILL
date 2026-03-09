import { ApiError } from "@shared/api/http";

/**
 * Recruiter Actions - Shared Utilities
 *
 * Centralizes the small parsing and error helpers used by recruiter
 * route actions so individual action files stay focused on workflow logic.
 */
export const getString = (formData: FormData, key: string) =>
  String(formData.get(key) ?? "").trim();

export const getNum = (formData: FormData, key: string) => {
  const value = Number(formData.get(key));
  return Number.isFinite(value) ? value : undefined;
};

export const getApiErrorMessage = (
  error: unknown,
  fallbackMessage: string,
) => {
  if (error instanceof ApiError) {
    const responseData = error.data as
      | { message?: string; errors?: string[] }
      | null;

    if (responseData?.errors?.length) {
      return responseData.errors.join(" ");
    }

    return responseData?.message ?? error.message ?? fallbackMessage;
  }

  return fallbackMessage;
};
