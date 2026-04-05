import { redirect } from "react-router-dom";
import { ApiError } from "@shared/api/http";

// Maps API failures into route-level redirects and responses that React Router can render correctly.
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

// Normalizes numeric query params used by jobseeker loaders.
export const getPositiveNumber = (
  value: string | null,
  fallbackValue: number,
) => {
  const parsedValue = Number(value ?? "");

  return Number.isFinite(parsedValue) && parsedValue > 0
    ? parsedValue
    : fallbackValue;
};
