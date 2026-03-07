import type { LoaderFunctionArgs } from 'react-router-dom';
import { redirect } from 'react-router-dom';
import { getRecruiterState } from '@features/recruiter/data/storage';
import { recruiterService } from '@features/recruiter/service/recruiter.service';

import { ApiError } from '@shared/api/http';

const rethrowAsRouteError = (error: unknown, fallbackMessage: string) => {
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

export const recruiterDashboardLoader = async ({ request }: LoaderFunctionArgs) => {
  try {
    const url = new URL(request.url);
      return await recruiterService.getDashboardStats({
      startDate: url.searchParams.get('startDate') ?? undefined,
      endDate: url.searchParams.get('endDate') ?? undefined,
      department: url.searchParams.get('department') ?? undefined,
      jobRole: url.searchParams.get('jobRole') ?? undefined,
      groupBy: (url.searchParams.get('groupBy') as 'week' | 'month' | 'year' | 'department' | 'job' | null) ?? 'month',
    });
  } catch (error) {
    rethrowAsRouteError(error, 'Unable to load recruiter dashboard.');
  }
};

export const recruiterJobsLoader = async ({ request }: LoaderFunctionArgs) => {
  try {
    const url = new URL(request.url);
    const pageNumber = Number(url.searchParams.get('page') ?? '1');
    const pageSize = Number(url.searchParams.get('pageSize') ?? '10');
    const search = url.searchParams.get('search') ?? undefined;
    const data = await recruiterService.getRecruiterJobs({ pageNumber, pageSize, search });

    return {
      jobs: data.items,
      total: data.totalCount,
      page: data.pageNumber,
      pageSize: data.pageSize,
      filters: { search: search ?? '' },
      candidates: [],
      options: { locations: [], departments: [], types: [] },
    };
  } catch (error) {
    rethrowAsRouteError(error, 'Unable to load recruiter jobs.');
  }
};

export const recruiterJobDetailLoader = async ({ params }: LoaderFunctionArgs) => {
  try {
      if (!params.jobId) throw new Response('Job not found', { status: 404 });
      const job = await recruiterService.getRecruiterJob(params.jobId);
      return { job, applicants: [], trend: [] };
    } catch (error) {
      rethrowAsRouteError(error, 'Unable to load job details.');
    }
};

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

    const data = await recruiterService.getApplicantScores({
      search,
      stage,
      jobId: jobId === 'all' ? undefined : jobId,
      department: department === 'all' ? undefined : department,
      recommendedTopPercent: Number.isFinite(recommendedTopPercent) ? recommendedTopPercent : 10,
      pageNumber: Number.isFinite(page) ? page : 1,
      pageSize: Number.isFinite(pageSize) ? pageSize : 10,
    });

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
        jobId,
        department,
        recommendedTopPercent: String(Number.isFinite(recommendedTopPercent) ? recommendedTopPercent : 10),
        pageSize: String(Number.isFinite(pageSize) ? pageSize : 10),
      },
    };
  } catch (error) {
    rethrowAsRouteError(error, 'Unable to load candidates.');
  }
};

export const recruiterCandidateDetailLoader = async ({ params }: LoaderFunctionArgs) => {
 
  try {
    if (!params.candidateId) throw new Response('Candidate not found', { status: 404 });
      
    const candidate = await recruiterService.getApplicantBySubmissionId(params.candidateId);

    if (!candidate) throw new Response('Candidate not found', { status: 404 });

    return { candidate };
  } catch (error) {
    rethrowAsRouteError(error, 'Unable to load candidate details.');
  }
};

export const recruiterInterviewsLoader = async () => {
  const state = getRecruiterState();
  return {
    interviews: state.interviews,
    candidates: state.candidates,
    jobs: state.jobs,
    settings: state.settings,
    interviewers: ['Jordan Kim', 'Morgan Diaz', 'Sam Rivera', 'Priya Nair'],
  };
};

export const recruiterInterviewDetailLoader = async ({ params }: LoaderFunctionArgs) => {
  const state = getRecruiterState();
  const interview = state.interviews.find((item) => item.id === params.interviewId);
  if (!interview) throw new Response('Interview not found', { status: 404 });
  return {
    interview,
    candidates: state.candidates,
    jobs: state.jobs,
    settings: state.settings,
    interviewers: ['Jordan Kim', 'Morgan Diaz', 'Sam Rivera', 'Priya Nair'],
  };
};

export const recruiterAutomationsLoader = async () => {
  const state = getRecruiterState();
  return { rules: state.automations, auditLog: state.auditLog, outbox: state.outbox, jobs: state.jobs };
};

export const recruiterSettingsLoader = async () => {
  const state = getRecruiterState();
  return { settings: state.settings };
};
