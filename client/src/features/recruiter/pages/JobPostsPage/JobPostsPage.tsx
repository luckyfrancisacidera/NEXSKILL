import { useEffect, useMemo, useState } from 'react';
import { useLoaderData, useNavigate, useNavigation, useSearchParams } from 'react-router-dom';

import { useToast } from '@app/providers/ToastProvider';
import { RecruiterHeader } from '@features/recruiter/components/RecruiterHeader';
import { JobPostsFilters } from '@features/recruiter/pages/JobPostsPage/components/JobPostsFilters';
import { JobPostsPagination } from '@features/recruiter/pages/JobPostsPage/components/JobPostsPagination';
import { JobPostsTable } from '@features/recruiter/pages/JobPostsPage/components/JobPostsTable';
import { useSearchParamToast } from '@features/recruiter/hooks/useSearchParamToast';
import { recruiterService } from '@features/recruiter/service/recruiter.service';
import type { JobListItem, RecruiterJobsLoaderData } from '@features/recruiter/types';
import { Card } from '@shared/components/Card';
import { HighRiskVerificationModal } from '@shared/components/HighRiskVerificationModal';
import { useConfirmation } from '@shared/hooks/useConfirmation';

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
  const { showToast } = useToast();
  const confirm = useConfirmation();

  const [jobs, setJobs] = useState(loaderData.jobs);
  const [isVerificationOpen, setIsVerificationOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | undefined>();
  const [selectedJob, setSelectedJob] = useState<JobListItem | null>(null);

  useEffect(() => {
    setJobs(loaderData.jobs);
  }, [loaderData.jobs]);



  const pageCount = Math.max(1, loaderData.totalPages ?? Math.ceil(loaderData.total / loaderData.pageSize));
  const currentDepartment = loaderData.filters.department ?? 'all';

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
    if (isDeleting) {
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
    if (isDeleting) {
      return;
    }

    setDeleteError(undefined);
    setIsVerificationOpen(false);
    setSelectedJob(null);
  };

  const runDelete = async (jobToDelete: JobListItem = selectedJob as JobListItem) => {
    if (!jobToDelete || isDeleting) {
      return;
    }

    const previousJobs = jobs;

    try {
      setIsDeleting(true);
      setDeleteError(undefined);
      setJobs((current) => current.filter((job) => job.id !== jobToDelete.id));
      await recruiterService.deleteJob(jobToDelete.id);
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

  const previousHref = `/recruiter/job-posts?${buildJobPostsQuery(searchParams, {
    page: String(Math.max(1, loaderData.page - 1)),
  })}`;
  const nextHref = `/recruiter/job-posts?${buildJobPostsQuery(searchParams, {
    page: String(Math.min(pageCount, loaderData.page + 1)),
  })}`;

  return (
    <div className="space-y-6">
      <RecruiterHeader />
      <Card className="dark:border-zinc-800 dark:bg-zinc-950">
        <div className="mb-4 flex items-center justify-between gap-3">
          <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100">Job Posts</h2>
        </div>

        <JobPostsFilters
          currentDepartment={currentDepartment}
          currentSearch={loaderData.filters.search}
          departments={departments}
          onDepartmentChange={(department) => {
            navigate(`/recruiter/job-posts?${buildJobPostsQuery(searchParams, { department, page: '1' })}`);
          }}
          onSearchCommit={(value) => {
            if (value === loaderData.filters.search) {
              return;
            }

            navigate(`/recruiter/job-posts?${buildJobPostsQuery(searchParams, { search: value, page: '1' })}`);
          }}
        />

        <JobPostsTable jobs={jobs} isDeleting={isDeleting} onDelete={openDeleteFlow} />

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


