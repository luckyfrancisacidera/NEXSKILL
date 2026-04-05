import type { LoaderFunctionArgs } from "react-router-dom";
import { recruiterService } from "@features/recruiter/services/recruiter.service";
import { rethrowAsRouteError } from "@features/recruiter/loaders/utils";

// Use to preload the hired employees table and preserve its current filters.
export const recruiterHiredEmployeesLoader = async ({ request }: LoaderFunctionArgs) => {
  try {
    const url = new URL(request.url);
    const search = url.searchParams.get("search") ?? "";
    const page = Number(url.searchParams.get("page") ?? "1");
    const pageSize = Number(url.searchParams.get("pageSize") ?? "10");

    const data = await recruiterService.getHiredEmployees({
      search: search || undefined,
      page: Number.isFinite(page) && page > 0 ? page : 1,
      pageSize: Number.isFinite(pageSize) && pageSize > 0 ? pageSize : 10,
    });

    return {
      employees: data.items,
      pagination: {
        page: data.pageNumber,
        pageSize: data.pageSize,
        total: data.totalCount,
        totalPages: data.totalPages,
      },
      filters: {
        search,
        pageSize: String(data.pageSize),
      },
    };
  } catch (error) {
    rethrowAsRouteError(error, "Unable to load hired employees.");
  }
};
