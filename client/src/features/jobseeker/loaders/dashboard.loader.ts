import type { LoaderFunctionArgs } from "react-router-dom";
import { jobseekerService } from "@features/jobseeker/service/jobseeker.service";
import type {
  DashboardLoaderData,
  DashboardRange,
} from "@features/jobseeker/types";
import { rethrowAsRouteError } from "@features/jobseeker/loaders/loader.utils";

export const dashboardLoader = async ({
  request,
}: LoaderFunctionArgs): Promise<DashboardLoaderData> => {
  try {
    const url = new URL(request.url);
    const range =
      (url.searchParams.get("range") as DashboardRange | null) ?? "this_week";

    return await jobseekerService.getDashboard(range);
  } catch (error) {
    return rethrowAsRouteError(error, "Unable to load dashboard.");
  }
};
