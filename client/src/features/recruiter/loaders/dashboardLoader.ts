import type { LoaderFunctionArgs } from "react-router-dom";
import { guardProtectedLoader } from "@app/routes/protectedLoader";
import { recruiterService } from "@features/recruiter/services/recruiter.service";
import type { DashboardDto, DashboardGroupBy } from "@features/recruiter/types";
import { rethrowAsRouteError } from "@features/recruiter/loaders/utils";

const createEmptyDashboardData = (): DashboardDto => ({
  filters: {
    departments: [],
    job_roles: [],
    job_roles_by_department: {},
  },
  summary: {
    total_applicants: { value: 0, previous_value: 0, comparison_percent: 0 },
    total_shortlisted: { value: 0, previous_value: 0, comparison_percent: 0 },
    total_interview: { value: 0, previous_value: 0, comparison_percent: 0 },
    total_offer: { value: 0, previous_value: 0, comparison_percent: 0 },
    total_hired: { value: 0, previous_value: 0, comparison_percent: 0 },
  },
  trends: {
    labels: [],
    datasets: [],
  },
});

/**
 * dashboardLoader
 *
 * Loads recruiter dashboard metrics and trend data based on
 * the active dashboard filter state.
 */
export const recruiterDashboardLoader = async ({
  request,
}: LoaderFunctionArgs) => {
  const guard = await guardProtectedLoader({
    allowedRoles: ["recruiter"],
    fallback: createEmptyDashboardData,
    requireCompany: true,
    requireRecruiter: true,
  });

  if (!guard.shouldLoad) {
    return guard.data;
  }

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
