import { redirect, type LoaderFunctionArgs } from 'react-router-dom';
import { getRecruiterState } from '@features/recruiter/data/storage';
import { recruiterService } from '@features/recruiter/service/recruiter.service';
import type { DashboardGroupBy } from '@features/recruiter/types';
import { ApiError } from '@shared/api/http';

const interviewers = ['Jordan Kim', 'Morgan Diaz', 'Sam Rivera', 'Priya Nair'];

const rethrowAsRouteError = (error: unknown, fallbackMessage: string): never => {
  if (error instanceof ApiError) {
    if (error.status === 401) {
      throw redirect('/login');
    }

    if (error.status === 403) {
      throw redirect('/not-authorized');
    }

    throw new Response(error.message || fallbackMessage, {
      status: error.status ?? 500,
      statusText: fallbackMessage,
    });
  }

  throw error;
};

/** Load recruiter dashboard metrics and trend data. */
export const recruiterDashboardLoader = async ({ request }: LoaderFunctionArgs) => {
  try {
    const url = new URL(request.url);
    return await recruiterService.getDashboardStats({
      startDate: url.searchParams.get('startDate') ?? undefined,
      endDate: url.searchParams.get('endDate') ?? undefined,
      department: url.searchParams.get('department') ?? undefined,
      jobRole: url.searchParams.get('jobRole') ?? undefined,
      groupBy: (url.searchParams.get('groupBy') as DashboardGroupBy | null) ?? 'month',
    });
  } catch (error) {
    rethrowAsRouteError(error, 'Unable to load recruiter dashboard.');
  }
};

/** Load paginated recruiter job posts and filter metadata. */
export const recruiterJobsLoader = async ({ request }: LoaderFunctionArgs) => {
  try {
    const url = new URL(request.url);
    const pageNumber = Number(url.searchParams.get('page') ?? '1');
    const pageSize = Number(url.searchParams.get('pageSize') ?? '10');
    const search = url.searchParams.get('search') ?? undefined;
    const department = url.searchParams.get('department') ?? undefined;
    const data = await recruiterService.getRecruiterJobs({ pageNumber, pageSize, search, department });
    const dashboard = await recruiterService.getDashboardStats({ groupBy: 'month' }).catch(() => null);
    const fallbackDepartments = Array.from(new Set(data.items.map((job) => job.department).filter(Boolean))).sort() as string[];
    const departments = dashboard?.filters?.departments?.length ? dashboard.filters.departments : fallbackDepartments;

    return {
      jobs: data.items,
      total: data.totalCount,
      page: data.pageNumber,
      pageSize: data.pageSize,
      totalPages: data.totalPages,
      filters: { search: search ?? '', department: department ?? 'all' },
      candidates: [],
      options: { locations: [], departments, types: [] },
    };
  } catch (error) {
    rethrowAsRouteError(error, 'Unable to load recruiter jobs.');
  }
};

/** Load a single recruiter job detail. */
export const recruiterJobDetailLoader = async ({ params }: LoaderFunctionArgs) => {
  try {
    if (!params.jobId) {
      throw new Response('Job not found', { status: 404 });
    }

    const job = await recruiterService.getRecruiterJob(params.jobId);
    return { job, applicants: [], trend: [] };
  } catch (error) {
    rethrowAsRouteError(error, 'Unable to load job details.');
  }
};

/** Load recruiter candidates, filters, and pagination metadata. */
export const recruiterCandidatesLoader = async ({ request }: LoaderFunctionArgs) => {
  try {
    const url = new URL(request.url);
    const search = url.searchParams.get('search') ?? undefined;
    const stage = url.searchParams.get('stage') ?? 'all';
    const jobId = url.searchParams.get('jobId') ?? 'all';
    const department = url.searchParams.get('department') ?? 'all';
    const recommendedTopPercent = Number(url.searchParams.get('recommendedTopPercent') ?? '10');
    const page = Number(url.searchParams.get('page') ?? '1');
    const pageSize = Number(url.searchParams.get('pageSize') ?? '10');
    const safeRecommendedTopPercent = Number.isFinite(recommendedTopPercent) ? recommendedTopPercent : 10;
    const safePage = Number.isFinite(page) ? page : 1;
    const safePageSize = Number.isFinite(pageSize) ? pageSize : 10;

    let resolvedJobId = jobId;
    let data = await recruiterService.getApplicantScores({
      search,
      stage,
      jobId: jobId === 'all' ? undefined : jobId,
      department: department === 'all' ? undefined : department,
      recommendedTopPercent: safeRecommendedTopPercent,
      pageNumber: safePage,
      pageSize: safePageSize,
    });

    const jobsForSelectedDepartment = department === 'all'
      ? data.jobs
      : data.jobs.filter((job) => job.department.toLowerCase() === department.toLowerCase());

    if (jobId !== 'all' && !jobsForSelectedDepartment.some((job) => job.id === jobId)) {
      resolvedJobId = 'all';
      data = await recruiterService.getApplicantScores({
        search,
        stage,
        jobId: undefined,
        department: department === 'all' ? undefined : department,
        recommendedTopPercent: safeRecommendedTopPercent,
        pageNumber: safePage,
        pageSize: safePageSize,
      });
    }

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
        search: search ?? '',
        stage,
        jobId: resolvedJobId,
        department,
        recommendedTopPercent: String(safeRecommendedTopPercent),
        pageSize: String(safePageSize),
      },
    };
  } catch (error) {
    rethrowAsRouteError(error, 'Unable to load candidates.');
  }
};

/** Load a single candidate detail record. */
export const recruiterCandidateDetailLoader = async ({ params }: LoaderFunctionArgs) => {
  try {
    if (!params.candidateId) {
      throw new Response('Candidate not found', { status: 404 });
    }

    const candidate = await recruiterService.getApplicantBySubmissionId(params.candidateId);
    if (!candidate) {
      throw new Response('Candidate not found', { status: 404 });
    }

    return { candidate };
  } catch (error) {
    rethrowAsRouteError(error, 'Unable to load candidate details.');
  }
};

/** Load local interview scheduling data. */
export const recruiterInterviewsLoader = async () => {
  try {
    const state = getRecruiterState();
    return {
      interviews: state.interviews,
      candidates: state.candidates,
      jobs: state.jobs,
      settings: state.settings,
      interviewers,
    };
  } catch (error) {
    rethrowAsRouteError(error, 'Unable to load interviews.');
  }
};

/** Load a single interview record. */
export const recruiterInterviewDetailLoader = async ({ params }: LoaderFunctionArgs) => {
  try {
    const state = getRecruiterState();
    const interview = state.interviews.find((item) => item.id === params.interviewId);

    if (!interview) {
      throw new Response('Interview not found', { status: 404 });
    }

    return {
      interview,
      candidates: state.candidates,
      jobs: state.jobs,
      settings: state.settings,
      interviewers,
    };
  } catch (error) {
    rethrowAsRouteError(error, 'Unable to load interview details.');
  }
};

/** Load recruiter automation rules and audit data. */
export const recruiterAutomationsLoader = async () => {
  try {
    const state = getRecruiterState();
    return {
      rules: state.automations,
      auditLog: state.auditLog,
      outbox: state.outbox,
      jobs: state.jobs,
    };
  } catch (error) {
    rethrowAsRouteError(error, 'Unable to load automations.');
  }
};

/** Load recruiter settings. */
export const recruiterSettingsLoader = async () => {
  try {
    const state = getRecruiterState();
    return { settings: state.settings };
  } catch (error) {
    rethrowAsRouteError(error, 'Unable to load recruiter settings.');
  }
};


