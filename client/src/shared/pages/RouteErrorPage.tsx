import { Link, isRouteErrorResponse, useRouteError } from "react-router-dom";
import { ApiError } from "@shared/api/http";

const getErrorCopy = (error: unknown) => {
  if (isRouteErrorResponse(error)) {
    if (error.status === 401) {
      return {
        title: "Session expired",
        description: "Your session has ended. Please log in again to continue.",
        ctaLabel: "Go to login",
        ctaTo: "/login",
      };
    }

    if (error.status === 403) {
      return {
        title: "Not authorized",
        description: "You do not have permission to view this page.",
        ctaLabel: "Go to dashboard",
        ctaTo: "/dashboard",
      };
    }

    if (error.status === 404) {
      return {
        title: "Page not found",
        description: "The page or data you requested could not be found.",
        ctaLabel: "Back to dashboard",
        ctaTo: "/dashboard",
      };
    }
  }

  if (error instanceof ApiError && error.status === 401) {
    return {
      title: "Session expired",
      description: "Your session has ended. Please log in again to continue.",
      ctaLabel: "Go to login",
      ctaTo: "/login",
    };
  }

  return {
    title: "Something went wrong",
    description: "We couldn't load this page right now. Please try again.",
    ctaLabel: "Try dashboard",
    ctaTo: "/dashboard",
  };
};

export const RouteErrorPage = () => {
  const error = useRouteError();
  const content = getErrorCopy(error);

  return (
    <div className="flex min-h-[60vh] items-center justify-center p-4 font-inter">
      <div className="w-full max-w-md rounded-xl border border-zinc-200 bg-white p-8 text-center shadow-sm">
        <h1 className="text-2xl font-semibold text-zinc-900">{content.title}</h1>
        <p className="mt-2 text-zinc-500">{content.description}</p>
        <div className="mt-6 flex justify-center gap-3">
          <Link
            to={content.ctaTo}
            className="inline-block rounded-lg bg-zinc-900 px-4 py-2 text-sm text-zinc-50"
          >
            {content.ctaLabel}
          </Link>
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="inline-block rounded-lg border border-zinc-300 px-4 py-2 text-sm text-zinc-700"
          >
            Reload
          </button>
        </div>
      </div>
    </div>
  );
};
