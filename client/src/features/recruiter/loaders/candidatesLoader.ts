import type { LoaderFunctionArgs } from "react-router-dom";
import { recruiterService } from "@features/recruiter/services/recruiter.service";
import { rethrowAsRouteError } from "@features/recruiter/loaders/utils";

/**
 * candidatesLoader
 *
 * Loads recruiter candidate lists, stage counts, and filtering
 * metadata for candidate management routes.
 */
export const recruiterCandidatesLoader = async ({
  request,
}: LoaderFunctionArgs) => {
  try {
    const url = new URL(request.url);
    const search = url.searchParams.get("search") ?? undefined;
    const stage = url.searchParams.get("stage") ?? "all";
    const jobId = url.searchParams.get("jobId") ?? "all";
    const department = url.searchParams.get("department") ?? "all";
    const recommendedTopPercent = Number(
      url.searchParams.get("recommendedTopPercent") ?? "10",
    );
    const page = Number(url.searchParams.get("page") ?? "1");
    const pageSize = Number(url.searchParams.get("pageSize") ?? "10");
    const safeRecommendedTopPercent = Number.isFinite(recommendedTopPercent)
      ? recommendedTopPercent
      : 10;
    const safePage = Number.isFinite(page) ? page : 1;
    const safePageSize = Number.isFinite(pageSize) ? pageSize : 10;

    let resolvedJobId = jobId;
    let data = await recruiterService.getApplicantScores({
      search,
      stage,
      jobId: jobId === "all" ? undefined : jobId,
      department: department === "all" ? undefined : department,
      recommendedTopPercent: safeRecommendedTopPercent,
      pageNumber: safePage,
      pageSize: safePageSize,
    });

    const jobsForSelectedDepartment =
      department === "all"
        ? data.jobs
        : data.jobs.filter(
            (job) => job.department.toLowerCase() === department.toLowerCase(),
          );

    if (
      jobId !== "all" &&
      !jobsForSelectedDepartment.some((job) => job.id === jobId)
    ) {
      resolvedJobId = "all";
      data = await recruiterService.getApplicantScores({
        search,
        stage,
        jobId: undefined,
        department: department === "all" ? undefined : department,
        recommendedTopPercent: safeRecommendedTopPercent,
        pageNumber: safePage,
        pageSize: safePageSize,
      });
    }

    // recruiterSync removed: always return the latest candidates + counts from the API.
    return {
      candidates: data.items,
      jobs: data.jobs,
      departments: data.departments,
      counts: data.counts,
      recommendation: data.recommendation,
      pagination: {
        page: data.page_number,
        pageSize: data.page_size,
        total: data.total_count,
        totalPages: data.total_pages,
      },
      filters: {
        search: search ?? "",
        stage,
        jobId: resolvedJobId,
        department,
        recommendedTopPercent: String(safeRecommendedTopPercent),
        pageSize: String(safePageSize),
      },
    };
  } catch (error) {
    rethrowAsRouteError(error, "Unable to load candidates.");
  }
};

