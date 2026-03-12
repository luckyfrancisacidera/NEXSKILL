import type { LoaderFunctionArgs } from "react-router-dom";
import { guardProtectedLoader } from "@app/routes/protectedLoader";
import { jobseekerService } from "@features/jobseeker/service/jobseeker.service";
import type {
  DashboardLoaderData,
  DashboardRange,
} from "@features/jobseeker/types";
import { rethrowAsRouteError } from "@features/jobseeker/loaders/loader.utils";

const createEmptyDashboardData = (): DashboardLoaderData => ({
  status: {
    applied: 0,
    interview: 0,
    offer: 0,
  },
  saved_jobs: [],
  recent_applications: [],
  analytics: {
    labels: [],
    counts: [],
    total: 0,
    range: "this_week",
  },
});

export const dashboardLoader = async ({
  request,
}: LoaderFunctionArgs): Promise<DashboardLoaderData> => {
  const guard = await guardProtectedLoader({
    allowedRoles: ["jobseeker"],
    fallback: createEmptyDashboardData,
  });

  if (!guard.shouldLoad) {
    return guard.data;
  }

  try {
    const url = new URL(request.url);
    const range =
      (url.searchParams.get("range") as DashboardRange | null) ?? "this_week";

    return await jobseekerService.getDashboard(range);
  } catch (error) {
    return rethrowAsRouteError(error, "Unable to load dashboard.");
  }
};
