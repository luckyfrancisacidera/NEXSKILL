import type { LoaderFunctionArgs } from "react-router-dom";
import { recruiterService } from "@features/recruiter/service/recruiter.service";
import type { DashboardGroupBy } from "@features/recruiter/types";
import { rethrowAsRouteError } from "@features/recruiter/loaders/utils";

/**
 * dashboardLoader
 *
 * Loads recruiter dashboard metrics and trend data based on
 * the active dashboard filter state.
 */
export const recruiterDashboardLoader = async ({
  request,
}: LoaderFunctionArgs) => {
  try {
    const url = new URL(request.url);
    return await recruiterService.getDashboardStats({
      startDate: url.searchParams.get("startDate") ?? undefined,
      endDate: url.searchParams.get("endDate") ?? undefined,
      department: url.searchParams.get("department") ?? undefined,
      jobRole: url.searchParams.get("jobRole") ?? undefined,
      groupBy:
        (url.searchParams.get("groupBy") as DashboardGroupBy | null) ??
        "month",
    });
  } catch (error) {
    rethrowAsRouteError(error, "Unable to load recruiter dashboard.");
  }
};
