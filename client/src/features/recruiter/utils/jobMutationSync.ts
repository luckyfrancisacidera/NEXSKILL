import type { JobDto, JobListFilters, JobListItem } from '@features/recruiter/types';

const JOB_MUTATION_EVENT_NAME = 'recruiter:jobs:mutation';
const JOB_MUTATION_STORAGE_KEY = 'recruiter.jobs.latestMutation';
const JOB_MUTATION_TTL_MS = 5 * 60 * 1000;

export type RecruiterJobMutationType = 'created' | 'updated' | 'deleted' | 'duplicated' | 'status_updated';

export interface RecruiterJobMutationPayload {
  mutationId: string;
  type: RecruiterJobMutationType;
  occurredAt: number;
  jobId: string;
  job?: JobListItem;
}

const isBrowser = () => typeof window !== 'undefined' && typeof sessionStorage !== 'undefined';

export const toJobListItem = (job: JobDto | JobListItem): JobListItem => ({
  id: job.id,
  title: job.title,
  department: job.department,
  location: job.location,
  employment_type: job.employment_type,
  status: job.status,
});

export const publishRecruiterJobMutation = (payload: Omit<RecruiterJobMutationPayload, 'mutationId' | 'occurredAt'>) => {
  if (!isBrowser()) {
    return;
  }

  const mutation: RecruiterJobMutationPayload = {
    ...payload,
    mutationId: `${payload.type}:${payload.jobId}:${Date.now()}`,
    occurredAt: Date.now(),
  };

  console.info('[RecruiterJobsSync] Publishing mutation', mutation);
  sessionStorage.setItem(JOB_MUTATION_STORAGE_KEY, JSON.stringify(mutation));
  window.dispatchEvent(new CustomEvent<RecruiterJobMutationPayload>(JOB_MUTATION_EVENT_NAME, { detail: mutation }));
};

export const readLatestRecruiterJobMutation = (): RecruiterJobMutationPayload | null => {
  if (!isBrowser()) {
    return null;
  }

  const raw = sessionStorage.getItem(JOB_MUTATION_STORAGE_KEY);
  if (!raw) {
    return null;
  }

  try {
    const mutation = JSON.parse(raw) as RecruiterJobMutationPayload;
    if (!mutation?.mutationId || Date.now() - mutation.occurredAt > JOB_MUTATION_TTL_MS) {
      return null;
    }

    return mutation;
  } catch {
    return null;
  }
};

export const subscribeRecruiterJobMutations = (
  handler: (payload: RecruiterJobMutationPayload) => void,
) => {
  if (!isBrowser()) {
    return () => undefined;
  }

  const listener = (event: Event) => {
    const customEvent = event as CustomEvent<RecruiterJobMutationPayload>;
    handler(customEvent.detail);
  };

  window.addEventListener(JOB_MUTATION_EVENT_NAME, listener);
  return () => window.removeEventListener(JOB_MUTATION_EVENT_NAME, listener);
};

export const jobMatchesCurrentFilters = (job: JobListItem, filters: JobListFilters) => {
  const normalizedDepartment = filters.department?.trim().toLowerCase();
  if (normalizedDepartment && normalizedDepartment !== 'all') {
    const jobDepartment = job.department?.trim().toLowerCase();
    if (jobDepartment !== normalizedDepartment) {
      return false;
    }
  }

  const normalizedSearch = filters.search?.trim().toLowerCase();
  if (!normalizedSearch) {
    return true;
  }

  return [job.title, job.department, job.location, job.employment_type, job.status]
    .filter(Boolean)
    .some((value) => value!.toLowerCase().includes(normalizedSearch));
};

export const applyRecruiterJobMutation = (
  jobs: JobListItem[],
  mutation: RecruiterJobMutationPayload,
  filters: JobListFilters,
) => {
  const withoutCurrent = jobs.filter((job) => job.id !== mutation.jobId);

  if (mutation.type === 'deleted' || !mutation.job) {
    return withoutCurrent;
  }

  if (!jobMatchesCurrentFilters(mutation.job, filters)) {
    return withoutCurrent;
  }

  const existingIndex = jobs.findIndex((job) => job.id === mutation.jobId);
  if (existingIndex >= 0) {
    const next = [...jobs];
    next[existingIndex] = mutation.job;
    return next;
  }

  return [mutation.job, ...withoutCurrent];
};
