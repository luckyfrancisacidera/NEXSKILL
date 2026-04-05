import type { LoaderFunctionArgs } from "react-router-dom";
import { recruiterService } from "@features/recruiter/services/recruiter.service";
import { rethrowAsRouteError } from "@features/recruiter/loaders/utils";

/**
 * jobsLoader
 *
 * Loads recruiter job listings along with the filter metadata
 * needed by the job posts management screen.
 */
export const recruiterJobsLoader = async ({
  request,
}: LoaderFunctionArgs) => {
  try {
    const url = new URL(request.url);
    const pageNumber = Number(url.searchParams.get("page") ?? "1");
    const pageSize = Number(url.searchParams.get("pageSize") ?? "10");
    const search = url.searchParams.get("search") ?? undefined;
    const department = url.searchParams.get("department") ?? undefined;
    const data = await recruiterService.getRecruiterJobs({
      pageNumber,
      pageSize,
      search,
      department,
    });
    const dashboard = await recruiterService
      .getDashboardStats({ groupBy: "month" })
      .catch(() => null);
    const fallbackDepartments = Array.from(
      new Set(data.items.map((job) => job.department).filter(Boolean)),
    ).sort() as string[];
    const departments = dashboard?.filters?.departments?.length
      ? dashboard.filters.departments
      : fallbackDepartments;

    return {
      jobs: data.items,
      total: data.totalCount,
      page: data.pageNumber,
      pageSize: data.pageSize,
      totalPages: data.totalPages,
      filters: { search: search ?? "", department: department ?? "all" },
      candidates: [],
      options: { locations: [], departments, types: [] },
    };
  } catch (error) {
    rethrowAsRouteError(error, "Unable to load recruiter jobs.");
  }
};
