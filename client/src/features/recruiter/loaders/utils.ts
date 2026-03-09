import { redirect } from "react-router-dom";
import { ApiError } from "@shared/api/http";

/**
 * Recruiter Loaders - Shared Utilities
 *
 * Provides common route-loader error handling so recruiter loaders
 * can stay centered on assembling page data.
 */
export const rethrowAsRouteError = (
  error: unknown,
  fallbackMessage: string,
): never => {
  if (error instanceof ApiError) {
    if (error.status === 401) {
      throw redirect("/login");
    }

    if (error.status === 403) {
      throw redirect("/not-authorized");
    }

    throw new Response(error.message || fallbackMessage, {
      status: error.status ?? 500,
      statusText: fallbackMessage,
    });
  }

  throw error;
};
