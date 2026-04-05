import type { JobDto, JobListFilters, JobListItem } from '@features/recruiter/types';
import { matchesSearchFields } from '@shared/utils/search';

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

export type PendingRecruiterJobMutations = Record<string, RecruiterJobMutationPayload>;

const isBrowser = () => typeof window !== 'undefined' && typeof sessionStorage !== 'undefined';

// Maps full job payloads into the smaller list item shape used by recruiter job tables.
export const toJobListItem = (job: JobDto | JobListItem): JobListItem => ({
  id: job.id,
  title: job.title,
  department: job.department,
  location: job.location,
  employment_type: job.employment_type,
  status: job.status,
});

// Publishes recruiter job mutations so list pages can stay current after create, edit, or delete flows.
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

// Use to recover a recent job mutation after navigation back to the listing screen.
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

// Subscribes recruiter pages to in-app job mutations without relying on a server push channel.
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

// Checks whether a mutated job still belongs in the recruiter list under the current filters.
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

  return matchesSearchFields(
    [job.title, job.department, job.location, job.employment_type, job.status],
    normalizedSearch,
  );
};

// Applies a single job mutation to the current list so recruiter pages can update optimistically.
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

const areJobListItemsEqual = (left?: JobListItem, right?: JobListItem) =>
  Boolean(
    left &&
      right &&
      left.id === right.id &&
      left.title === right.title &&
      left.department === right.department &&
      left.location === right.location &&
      left.employment_type === right.employment_type &&
      left.status === right.status,
  );

export const upsertPendingRecruiterJobMutation = (
  pendingMutations: PendingRecruiterJobMutations,
  mutation: RecruiterJobMutationPayload,
): PendingRecruiterJobMutations => ({
  ...pendingMutations,
  [mutation.jobId]: mutation,
});

export const reconcileRecruiterJobsWithPendingMutations = (
  jobs: JobListItem[],
  pendingMutations: PendingRecruiterJobMutations,
  filters: JobListFilters,
) => {
  const sortedMutations = Object.values(pendingMutations).sort((left, right) => left.occurredAt - right.occurredAt);

  if (sortedMutations.length === 0) {
    return { jobs, pendingMutations };
  }

  let nextJobs = jobs;
  let nextPendingMutations = pendingMutations;

  sortedMutations.forEach((mutation) => {
    const loaderJob = nextJobs.find((job) => job.id === mutation.jobId);
    const loaderAlreadyMatches = mutation.type !== 'deleted' && areJobListItemsEqual(loaderJob, mutation.job);
    const loaderAlreadyRemoved = mutation.type === 'deleted' && !loaderJob;
    const loaderAlreadyFilteredOut =
      mutation.type !== 'deleted' &&
      mutation.job &&
      !jobMatchesCurrentFilters(mutation.job, filters) &&
      !loaderJob;

    if (loaderAlreadyMatches || loaderAlreadyRemoved || loaderAlreadyFilteredOut) {
      const { [mutation.jobId]: removedMutation, ...rest } = nextPendingMutations;
      void removedMutation;
      nextPendingMutations = rest;
      return;
    }

    nextJobs = applyRecruiterJobMutation(nextJobs, mutation, filters);
  });

  return {
    jobs: nextJobs,
    pendingMutations: nextPendingMutations,
  };
};
