import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { BriefcaseBusiness, FileSearch } from 'lucide-react';
import { useLoaderData, useNavigate, useNavigation, useRevalidator, useSearchParams } from 'react-router-dom';

import { useToast } from '@app/providers/ToastProvider';
import { RecruiterHeader } from '@features/recruiter/components/RecruiterHeader';
import { JobPostsFilters } from '@features/recruiter/pages/JobPostsPage/components/JobPostsFilters';
import { JobPostsPagination } from '@features/recruiter/pages/JobPostsPage/components/JobPostsPagination';
import { JobPostsTable } from '@features/recruiter/pages/JobPostsPage/components/JobPostsTable';
import { JobPostsTableSkeleton } from '@features/recruiter/pages/JobPostsPage/components/JobPostsTableSkeleton';
import { useSearchParamToast } from '@features/recruiter/hooks/useSearchParamToast';
import { recruiterService } from '@features/recruiter/service/recruiter.service';
import type { JobListItem, RecruiterJobsLoaderData } from '@features/recruiter/types';
import {
  applyRecruiterJobMutation,
  jobMatchesCurrentFilters,
  publishRecruiterJobMutation,
  readLatestRecruiterJobMutation,
  subscribeRecruiterJobMutations,
  toJobListItem,
  type RecruiterJobMutationPayload,
} from '@features/recruiter/utils/jobMutationSync';
import { Card } from '@shared/components/Card';
import { EmptyState } from '@shared/components/EmptyState';
import { HighRiskVerificationModal } from '@shared/components/HighRiskVerificationModal';
import { useConfirmation } from '@shared/hooks/useConfirmation';
import { normalizeSearchInput } from '@shared/utils/search';

const buildJobPostsQuery = (searchParams: URLSearchParams, next: Record<string, string>) => {
  const merged = { ...Object.fromEntries(searchParams.entries()), ...next };

  Object.keys(merged).forEach((key) => {
    if (!merged[key] || merged[key] === 'all') {
      delete merged[key];
    }
  });

  return new URLSearchParams(merged).toString();
};

export const JobPostsPage = () => {
  const loaderData = useLoaderData() as RecruiterJobsLoaderData;
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const navigation = useNavigation();
  const revalidator = useRevalidator();
  const { showToast } = useToast();
  const confirm = useConfirmation();
  const handledMutationIdsRef = useRef<Set<string>>(new Set());

  const [jobs, setJobs] = useState(loaderData.jobs);
  const [isVerificationOpen, setIsVerificationOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isDuplicating, setIsDuplicating] = useState(false);
  const [deleteError, setDeleteError] = useState<string | undefined>();
  const [selectedJob, setSelectedJob] = useState<JobListItem | null>(null);
  const [searchDraft, setSearchDraft] = useState(loaderData.filters.search);

  useEffect(() => {
    setJobs(loaderData.jobs);
  }, [loaderData.jobs]);

  useEffect(() => {
    setSearchDraft(loaderData.filters.search);
  }, [loaderData.filters.search]);

  const applyMutationSync = useCallback((mutation: RecruiterJobMutationPayload, showHiddenFeedback: boolean) => {
    if (!mutation || handledMutationIdsRef.current.has(mutation.mutationId)) {
      return;
    }

    handledMutationIdsRef.current.add(mutation.mutationId);
    console.info('[JobPostsPage] Applying recruiter job mutation', mutation);

    setJobs((current) => applyRecruiterJobMutation(current, mutation, loaderData.filters));

    if (showHiddenFeedback && mutation.job && !jobMatchesCurrentFilters(mutation.job, loaderData.filters)) {
      showToast({
        title: 'Job updated',
        description: `${mutation.job.title} changed successfully, but it may be hidden by your current filters.`,
        tone: 'info',
      });
    }

    revalidator.revalidate();
  }, [loaderData.filters, revalidator, showToast]);

  useEffect(() => {
    const latestMutation = readLatestRecruiterJobMutation();
    if (latestMutation) {
      applyMutationSync(latestMutation, false);
    }

    return subscribeRecruiterJobMutations((mutation) => applyMutationSync(mutation, true));
  }, [applyMutationSync]);

  const pageCount = Math.max(1, loaderData.totalPages ?? Math.ceil(loaderData.total / loaderData.pageSize));
  const currentDepartment = loaderData.filters.department ?? 'all';
  const isLoadingList = navigation.state === 'loading' && navigation.location?.pathname === '/recruiter/job-posts';
  const hasActiveFilters = Boolean(loaderData.filters.search?.trim()) || currentDepartment !== 'all';
  const isEmptyPage = loaderData.total > 0 && jobs.length === 0;
  const isEmptyJobs = !jobs || jobs.length === 0;

  const departments = useMemo(() => {
    const fromList = loaderData.options?.departments ?? [];
    const withCurrent = currentDepartment !== 'all' ? [...fromList, currentDepartment] : fromList;
    return Array.from(new Set(withCurrent.filter(Boolean))).sort();
  }, [currentDepartment, loaderData.options?.departments]);

  const toastHandlers = useMemo(
    () => ({
      updated: () => {
        showToast({
          title: 'Job updated successfully',
          description: 'Latest changes are now reflected in your listing.',
          tone: 'success',
        });
      },
    }),
    [showToast],
  );

  useSearchParamToast({
    searchParams,
    handlers: toastHandlers,
    onCleanup: () => {
      const cleaned = new URLSearchParams(searchParams);
      cleaned.delete('toast');
      cleaned.delete('updatedJobId');
      navigate(`/recruiter/job-posts${cleaned.toString() ? `?${cleaned.toString()}` : ''}`, { replace: true });
    },
  });

  const openDeleteFlow = async (job: JobListItem) => {
    if (isDeleting || isDuplicating) {
      return;
    }

    setSelectedJob(job);
    setDeleteError(undefined);
    setIsVerificationOpen(false);

    const isPublished = job.status?.toLowerCase() === 'published';
    const confirmed = await confirm({
      title: isPublished ? 'Delete published job?' : 'Delete this job?',
      message: isPublished
        ? "This job is published. You'll need one more verification step before it is deleted."
        : 'This action permanently removes the job post and cannot be undone.',
      confirmLabel: isPublished ? 'Continue' : 'Delete Job',
      accent: 'red',
    });

    if (!confirmed) {
      setSelectedJob(null);
      return;
    }

    if (isPublished) {
      setIsVerificationOpen(true);
      return;
    }

    await runDelete(job);
  };

  const closeDeleteFlow = () => {
    if (isDeleting || isDuplicating) {
      return;
    }

    setDeleteError(undefined);
    setIsVerificationOpen(false);
    setSelectedJob(null);
  };

  const runDelete = async (jobToDelete: JobListItem = selectedJob as JobListItem) => {
    if (!jobToDelete || isDeleting || isDuplicating) {
      return;
    }

    const previousJobs = jobs;

    try {
      setIsDeleting(true);
      setDeleteError(undefined);
      setJobs((current) => current.filter((job) => job.id !== jobToDelete.id));
      await recruiterService.deleteJob(jobToDelete.id);
      publishRecruiterJobMutation({ type: 'deleted', jobId: jobToDelete.id });
      showToast({ title: 'Job deleted', description: `${jobToDelete.title} has been removed.`, tone: 'success' });
      setIsVerificationOpen(false);
      setSelectedJob(null);
      navigate(`/recruiter/job-posts?${buildJobPostsQuery(searchParams, { page: String(loaderData.page) })}`, {
        replace: true,
      });
    } catch {
      setJobs(previousJobs);
      setDeleteError('Unable to delete this job right now. Please try again.');
      showToast({ title: 'Delete failed', description: 'Please try again.', tone: 'error' });
    } finally {
      setIsDeleting(false);
    }
  };

  const openDuplicateFlow = async (job: JobListItem) => {
    if (isDeleting || isDuplicating) {
      return;
    }

    const confirmed = await confirm({
      title: 'Duplicate this job posting?',
      message: 'A new draft job will be created with all current details pre-filled so you can edit and publish it separately.',
      confirmLabel: 'Duplicate Job',
      accent: 'violet',
    });

    if (!confirmed) {
      return;
    }

    try {
      setIsDuplicating(true);
      const duplicated = await recruiterService.duplicateJob(job.id);
      publishRecruiterJobMutation({ type: 'duplicated', jobId: duplicated.id, job: toJobListItem(duplicated) });
      showToast({
        title: 'Job duplicated successfully',
        description: `${duplicated.title} is ready to edit as a draft.`,
        tone: 'success',
      });
      navigate(`/recruiter/job-posts/${duplicated.id}/edit`);
    } catch {
      showToast({
        title: 'Unable to duplicate job',
        description: 'Please try again.',
        tone: 'error',
      });
    } finally {
      setIsDuplicating(false);
    }
  };

  const previousHref = `/recruiter/job-posts?${buildJobPostsQuery(searchParams, {
    page: String(Math.max(1, loaderData.page - 1)),
  })}`;
  const nextHref = `/recruiter/job-posts?${buildJobPostsQuery(searchParams, {
    page: String(Math.min(pageCount, loaderData.page + 1)),
  })}`;
  const previousPageHref = `/recruiter/job-posts?${buildJobPostsQuery(searchParams, {
    page: String(Math.max(1, loaderData.page - 1)),
  })}`;

  return (
    <div className="space-y-6">
      <RecruiterHeader />
      <Card className="dark:border-zinc-800 dark:bg-zinc-950 bg-white">
        <div className="mb-4 flex items-center justify-between gap-3">
          <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100">Job Posts</h2>
        </div>

        <JobPostsFilters
          currentDepartment={currentDepartment}
          currentSearch={searchDraft}
          departments={departments}
          onDepartmentChange={(department) => {
            navigate(`/recruiter/job-posts?${buildJobPostsQuery(searchParams, { department, page: '1' })}`);
          }}
          onSearchChange={(value) => {
            setSearchDraft(value);

            const normalizedValue = normalizeSearchInput(value);
            const normalizedCurrentSearch = normalizeSearchInput(loaderData.filters.search);
            if (normalizedValue === normalizedCurrentSearch) {
              return;
            }

            navigate(
              `/recruiter/job-posts?${buildJobPostsQuery(searchParams, { search: normalizedValue, page: '1' })}`,
              { replace: true },
            );
          }}
        />

        {isLoadingList && isEmptyJobs ? (
          <JobPostsTableSkeleton />
        ) : isEmptyPage ? (
          <EmptyState
            icon={FileSearch}
            title="No results on this page"
            description="There are job posts in this view, but this page is empty. Go back a page to keep browsing."
            actionLabel="Go to previous page"
            onAction={() => {
              navigate(previousPageHref);
            }}
            className="mt-4"
          />
        ) : isEmptyJobs ? (
          <EmptyState
            icon={BriefcaseBusiness}
            title={hasActiveFilters ? 'No matching job posts' : 'No job posts yet'}
            description={
              hasActiveFilters
                ? 'Try adjusting your search or filters to see more openings.'
                : 'Create your first job post to start receiving applications.'
            }
            actionLabel={hasActiveFilters ? 'Clear filters' : 'Create Job'}
            onAction={() => {
              if (hasActiveFilters) {
                navigate('/recruiter/job-posts');
                return;
              }

              navigate('/recruiter/job-posts/new');
            }}
            className="mt-4"
          />
        ) : (
          <JobPostsTable
            jobs={jobs}
            isDeleting={isDeleting}
            isDuplicating={isDuplicating}
            onDelete={openDeleteFlow}
            onDuplicate={openDuplicateFlow}
          />
        )}

        {(loaderData.total > 0 || isEmptyPage) ? (
          <JobPostsPagination
            page={loaderData.page}
            pageCount={pageCount}
            pageSize={loaderData.pageSize}
            onPageSizeChange={(pageSize) => {
              navigate(`/recruiter/job-posts?${buildJobPostsQuery(searchParams, { pageSize, page: '1' })}`);
            }}
            previousHref={previousHref}
            nextHref={nextHref}
          />
        ) : null}
      </Card>

      <HighRiskVerificationModal
        open={Boolean(selectedJob) && isVerificationOpen}
        title="Final verification required"
        message="For published job posts, type DELETE or the exact job title to confirm this destructive action."
        expectedKeyword="DELETE"
        expectedText={selectedJob?.title}
        loading={isDeleting || navigation.state === 'loading'}
        error={deleteError}
        onClose={closeDeleteFlow}
        onCancel={closeDeleteFlow}
        onConfirm={() => {
          void runDelete();
        }}
      />
    </div>
  );
};
