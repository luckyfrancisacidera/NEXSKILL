import type { LoaderFunctionArgs } from 'react-router-dom';
import { getRecruiterState } from '@features/recruiter/data/storage';
import { recruiterService } from '@features/recruiter/service/recruiter.service';

export const recruiterDashboardLoader = async ({ request }: LoaderFunctionArgs) => {
  const url = new URL(request.url);
  const range = (url.searchParams.get('range') as 'last30' | 'last90' | 'ytd' | null) ?? 'last30';
  return recruiterService.getDashboardStats(range);
};

export const recruiterJobsLoader = async ({ request }: LoaderFunctionArgs) => {
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
};

export const recruiterJobDetailLoader = async ({ params }: LoaderFunctionArgs) => {
  if (!params.jobId) throw new Response('Job not found', { status: 404 });
  const job = await recruiterService.getRecruiterJob(params.jobId);
  return { job, applicants: [], trend: [] };
};

export const recruiterCandidatesLoader = async ({ request }: LoaderFunctionArgs) => {
  const url = new URL(request.url);
  const search = url.searchParams.get('search') ?? undefined;
  const stage = url.searchParams.get('stage') ?? 'all';
  const jobId = url.searchParams.get('jobId') ?? 'all';
  const recommendedTopPercent = Number(url.searchParams.get('recommendedTopPercent') ?? '10');

  const data = await recruiterService.getApplicantScores({
    search,
    stage,
    jobId: jobId === 'all' ? undefined : jobId,
    recommendedTopPercent: Number.isFinite(recommendedTopPercent) ? recommendedTopPercent : 10,
  });

 return {
    candidates: data.items,
    jobs: data.jobs,
    counts: data.counts,
    recommendation: data.recommendation,
    filters: {
      search: search ?? '',
      stage,
      jobId,
      recommendedTopPercent: String(Number.isFinite(recommendedTopPercent) ? recommendedTopPercent : 10),
    },
  };
};

export const recruiterCandidateDetailLoader = async ({ params }: LoaderFunctionArgs) => {
 
  if (!params.candidateId) throw new Response('Candidate not found', { status: 404 });

  const candidate = await recruiterService.getApplicantBySubmissionId(params.candidateId);

  if (!candidate) throw new Response('Candidate not found', { status: 404 });

  return { candidate };
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
