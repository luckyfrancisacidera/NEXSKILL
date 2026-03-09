import { redirect, type LoaderFunctionArgs } from "react-router-dom";
import { ApiError } from "@shared/api/http";
import { jobseekerService } from "./service/jobseeker.service";
import type {
  ApplicationsLoaderData,
  DashboardLoaderData,
  DashboardRange,
  JobDetailLoaderData,
  JobsLoaderData,
  JobseekerApplicationsQueryParams,
  JobseekerProfileDto,
  SavedJobDto,
} from "./types/jobseeker.types";

const rethrowAsRouteError = (
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

const getPositiveNumber = (value: string | null, fallbackValue: number) => {
  const parsedValue = Number(value ?? "");
  return Number.isFinite(parsedValue) && parsedValue > 0
    ? parsedValue
    : fallbackValue;
};

export const jobsLoader = async ({
  request,
}: LoaderFunctionArgs): Promise<JobsLoaderData> => {
  try {
    const url = new URL(request.url);
    const pageNumber = getPositiveNumber(url.searchParams.get("page"), 1);
    const pageSize = getPositiveNumber(url.searchParams.get("pageSize"), 10);
    const search = url.searchParams.get("search") ?? undefined;

    return await jobseekerService.getPublicJobs({
      pageNumber,
      pageSize,
      search,
    });
  } catch (error) {
    return rethrowAsRouteError(error, "Unable to load jobs.");
  }
};

export const jobDetailLoader = async ({
  params,
}: LoaderFunctionArgs): Promise<JobDetailLoaderData> => {
  try {
    if (!params.jobId) {
      throw new Response("Not found", { status: 404 });
    }

    return await jobseekerService.getJobDetail(params.jobId);
  } catch (error) {
    return rethrowAsRouteError(error, "Unable to load job details.");
  }
};

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

export const applicationsLoader = async ({
  request,
}: LoaderFunctionArgs): Promise<ApplicationsLoaderData> => {
  try {
    const url = new URL(request.url);
    const params: JobseekerApplicationsQueryParams = {
      pageNumber: getPositiveNumber(url.searchParams.get("page"), 1),
      pageSize: getPositiveNumber(url.searchParams.get("pageSize"), 10),
      search: url.searchParams.get("search") ?? undefined,
      status: url.searchParams.get("status") ?? undefined,
    };

    return await jobseekerService.getMyApplications(params);
  } catch (error) {
    return rethrowAsRouteError(error, "Unable to load applications.");
  }
};

export const savedJobsLoader = async ({
  request,
}: LoaderFunctionArgs): Promise<SavedJobDto[]> => {
  try {
    const url = new URL(request.url);
    const search = url.searchParams.get("search") ?? undefined;
    return await jobseekerService.getSavedJobs(search);
  } catch (error) {
    return rethrowAsRouteError(error, "Unable to load saved jobs.");
  }
};

export const profileLoader = async (): Promise<JobseekerProfileDto> => {
  try {
    return await jobseekerService.getProfile();
  } catch (error) {
    return rethrowAsRouteError(error, "Unable to load profile.");
  }
};
