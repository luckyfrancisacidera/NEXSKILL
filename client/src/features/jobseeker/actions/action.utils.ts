import { ApiError } from "@shared/api/http";
import type { ApiMessageResponse } from "@features/jobseeker/types";

export const getString = (formData: FormData, key: string) =>
  String(formData.get(key) ?? "").trim();

export const getApiErrorMessage = (
  error: unknown,
  fallbackMessage: string,
) => {
  if (error instanceof ApiError) {
    const payload = error.data as ApiMessageResponse | null;

    return (
      payload?.errors?.[0] ??
      payload?.message ??
      error.message ??
      fallbackMessage
    );
  }

  return fallbackMessage;
};
