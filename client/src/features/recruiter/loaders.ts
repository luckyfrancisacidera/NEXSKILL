import type { LoaderFunctionArgs } from 'react-router-dom';
import { getRecruiterState } from '@features/recruiter/data/storage';

export const recruiterDashboardLoader = async () => {
  const state = getRecruiterState();
  const openRoles = state.jobs.filter((job) => job.status === 'Open').length;
  const interviewsThisWeek = state.interviews.filter((item) => {
    const date = new Date(item.startsAt).getTime();
    const now = Date.now();
    return date > now && date < now + 7 * 24 * 60 * 60 * 1000 && item.status === 'Scheduled';
  }).length;
  const totalApplicants = state.candidates.length;
  const stageDistribution = state.candidates.reduce<Record<string, number>>((acc, candidate) => {
    acc[candidate.stage] = (acc[candidate.stage] ?? 0) + 1;
    return acc;
  }, {});

  return {
    kpis: { openRoles, totalApplicants, interviewsThisWeek, timeToHire: '24 days' },
    stageDistribution: Object.entries(stageDistribution).map(([name, value]) => ({ day: name, applications: value })),
    recentActivity: state.auditLog.slice(0, 8),
  };
};

export const recruiterJobsLoader = async ({ request }: LoaderFunctionArgs) => {
  const state = getRecruiterState();
  const url = new URL(request.url);
  const search = url.searchParams.get('search')?.toLowerCase() ?? '';
  const status = url.searchParams.get('status') ?? 'all';
  const location = url.searchParams.get('location') ?? 'all';
  const department = url.searchParams.get('department') ?? 'all';
  const type = url.searchParams.get('type') ?? 'all';
  const sort = url.searchParams.get('sort') ?? 'updatedAt';
  const page = Number(url.searchParams.get('page') ?? '1');
  const pageSize = Number(url.searchParams.get('pageSize') ?? '10');

  const filtered = state.jobs.filter((job) => {
    const textMatch = [job.title, job.department, job.location].join(' ').toLowerCase().includes(search);
    const statusMatch = status === 'all' || job.status === status;
    const locationMatch = location === 'all' || job.location === location;
    const departmentMatch = department === 'all' || job.department === department;
    const typeMatch = type === 'all' || job.type === type;
    return textMatch && statusMatch && locationMatch && departmentMatch && typeMatch;
  });

  const sorted = [...filtered].sort((a, b) => {
    if (sort === 'applicants') {
      const aCount = state.candidates.filter((candidate) => candidate.jobId === a.id).length;
      const bCount = state.candidates.filter((candidate) => candidate.jobId === b.id).length;
      return bCount - aCount;
    }
    return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
  });

  const offset = (page - 1) * pageSize;
  const paginated = sorted.slice(offset, offset + pageSize);

  return {
    jobs: paginated,
    total: sorted.length,
    page,
    pageSize,
    filters: { search, status, location, department, type, sort },
    candidates: state.candidates,
    options: {
      locations: [...new Set(state.jobs.map((job) => job.location))],
      departments: [...new Set(state.jobs.map((job) => job.department))],
      types: [...new Set(state.jobs.map((job) => job.type))],
    },
  };
};

export const recruiterJobDetailLoader = async ({ params }: LoaderFunctionArgs) => {
  const state = getRecruiterState();
  const job = state.jobs.find((item) => item.id === params.jobId);
  if (!job) throw new Response('Job not found', { status: 404 });
  return {
    job,
    applicants: state.candidates.filter((item) => item.jobId === job.id),
    trend: [5, 8, 12, 9, 14, 16].map((value, index) => ({ day: `W${index + 1}`, applications: value })),
  };
};

export const recruiterCandidatesLoader = async ({ request }: LoaderFunctionArgs) => {
  const state = getRecruiterState();
  const url = new URL(request.url);
  const search = url.searchParams.get('search')?.toLowerCase() ?? '';
  const stage = url.searchParams.get('stage') ?? 'all';
  const jobId = url.searchParams.get('jobId') ?? 'all';

  const candidates = state.candidates.filter((candidate) => {
    const textMatch = [candidate.name, candidate.email].join(' ').toLowerCase().includes(search);
    const stageMatch = stage === 'all' || candidate.stage === stage;
    const jobMatch = jobId === 'all' || candidate.jobId === jobId;
    return textMatch && stageMatch && jobMatch;
  });

  return { candidates, jobs: state.jobs };
};

export const recruiterCandidateDetailLoader = async ({ params }: LoaderFunctionArgs) => {
  const state = getRecruiterState();
  const candidate = state.candidates.find((item) => item.id === params.candidateId);
  if (!candidate) throw new Response('Candidate not found', { status: 404 });
  const job = state.jobs.find((item) => item.id === candidate.jobId);
  const activity = state.auditLog.filter((item) => item.candidateId === candidate.id).slice(0, 20);
  return { candidate, job, activity };
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
