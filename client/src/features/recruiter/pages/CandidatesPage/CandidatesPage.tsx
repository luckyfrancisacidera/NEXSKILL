import { useEffect, useMemo, useRef, useState } from 'react';
import {
  CalendarDays,
  FileSearch,
  Users,
  UserRoundCheck,
  UserRoundSearch,
  UserX,
} from 'lucide-react';
import { useFetcher, useLoaderData, useNavigate, useNavigation, useRevalidator, useSubmit } from 'react-router-dom';

import { useToast } from '@app/providers/ToastProvider';
import { BulkActionsBar } from '@features/recruiter/pages/CandidatesPage/components/BulkActionsBar';
import { CandidateStageTabs } from '@features/recruiter/pages/CandidatesPage/components/CandidateStageTabs';
import { CandidatesFilters } from '@features/recruiter/pages/CandidatesPage/components/CandidatesFilters';
import { CandidatesTable } from '@features/recruiter/pages/CandidatesPage/components/CandidatesTable';

import type {
  BulkApplicantStageResponseDto,
  CandidateBulkAction,
  CandidateFilters,
  CandidatesLoaderData,
} from '@features/recruiter/types';
import { canShortlistCandidate, getShortlistWarningMessage } from '@features/recruiter/utils/candidateStageRules';
import { Card } from '@shared/components/Card';
import { EmptyState } from '@shared/components/EmptyState';
import type { DropdownOption } from '@shared/components/Dropdown';
import { TablePagination } from '@shared/components/ui/data-table/TablePagination';
import { useConfirmation } from '@shared/hooks/useConfirmation';

const tabsWithRecommendationFilter = new Set(['all', 'Recommended']);

const isActionAllowed = (action: string, submissionStatus: string) => {
  if (action === 'shortlist') {
    return canShortlistCandidate(submissionStatus);
  }

  const allowedByAction: Record<string, string[]> = {
    'remove-shortlist': ['Shortlisted', 'Interview'],
  };

  const allowedStatuses = allowedByAction[action] ?? [];
  return allowedStatuses.includes(submissionStatus);
};

const buildCandidateQuery = (filters: CandidateFilters, page: number) =>
  `?search=${encodeURIComponent(filters.search)}&jobId=${encodeURIComponent(filters.jobId)}&department=${encodeURIComponent(filters.department)}&recommendedTopPercent=${encodeURIComponent(filters.recommendedTopPercent)}&pageSize=${encodeURIComponent(filters.pageSize)}&page=${page}&stage=${encodeURIComponent(filters.stage)}`;

const stageEmptyStateMap: Record<
  string,
  {
    title: string;
    description: string;
    icon: typeof Users;
  }
> = {
  all: {
    title: 'No candidates yet',
    description: 'Candidates will appear here once applicants start applying to your open jobs.',
    icon: Users,
  },
  Applied: {
    title: 'No applications yet',
    description: 'New applicants will appear here as soon as people apply to your jobs.',
    icon: Users,
  },
  Recommended: {
    title: 'No recommended candidates',
    description: 'Recommended candidates will appear here once matching applicants are scored.',
    icon: UserRoundSearch,
  },
  Shortlisted: {
    title: 'No shortlisted candidates',
    description: 'Shortlisted candidates will appear here after you move strong applicants forward.',
    icon: UserRoundCheck,
  },
  Interview: {
    title: 'No interviews scheduled',
    description: 'Candidates in the interview stage will appear here once interviews are scheduled.',
    icon: CalendarDays,
  },
  Offer: {
    title: 'No offers sent',
    description: 'Candidates will appear here after you send them an offer.',
    icon: FileSearch,
  },
  Hire: {
    title: 'No hired candidates yet',
    description: 'Hired candidates will appear here after an offer has been accepted and marked hired.',
    icon: UserRoundCheck,
  },
  Hired: {
    title: 'No hired candidates yet',
    description: 'Hired candidates will appear here after an offer has been accepted and marked hired.',
    icon: UserRoundCheck,
  },
  Rejected: {
    title: 'No rejected candidates',
    description: 'Rejected candidates will appear here whenever applicants are closed out of the pipeline.',
    icon: UserX,
  },
};

const getBulkActionsForStage = (
  stage: string,
  selectedCount: number,
  selectedValidShortlistCount: number,
): CandidateBulkAction[] => {
  const countLabel = `${selectedCount} selected candidate(s)`;

  if (stage === 'all' || stage === 'Recommended') {
    return [
      {
        action: 'shortlist',
        status: 'Shortlisted',
        label: 'Shortlist',
        title: 'Shortlist candidates',
        message: `Move ${countLabel} to Shortlisted stage?`,
        accent: 'green',
        disabled: selectedValidShortlistCount === 0,
      },
    ];
  }

  if (stage === 'Shortlisted') {
    return [
      {
        action: 'remove-shortlist',
        status: 'Applied',
        label: 'Remove from Shortlist',
        title: 'Remove from shortlist',
        message: `Remove shortlist status for ${countLabel}?`,
        accent: 'violet',
      },
    ];
  }

  return [];
};

export const CandidatesPage = () => {
  const { candidates, jobs, departments, counts, filters, recommendation, pagination } =
    useLoaderData() as CandidatesLoaderData;
  const fetcher = useFetcher();
  const navigate = useNavigate();
  const navigation = useNavigation();
  const submit = useSubmit();
  const revalidator = useRevalidator();
  const { showToast } = useToast();
  const confirm = useConfirmation();
  const filterFormRef = useRef<HTMLFormElement | null>(null);

  // The recruiterSync cache is removed; loader data is the single source of truth.
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const normalizedFilters: CandidateFilters = {
    search: filters.search ?? '',
    stage: filters.stage ?? 'all',
    jobId: filters.jobId ?? 'all',
    department: filters.department ?? 'all',
    recommendedTopPercent: filters.recommendedTopPercent ?? '10',
    pageSize: filters.pageSize ?? '10',
  };

  const countByStage: Record<string, number> = {
    all: counts.all_applicants,
    Recommended: counts.recommended,
    Shortlisted: counts.shortlisted,
    Interview: counts.interview,
    Offer: counts.offer,
  };

  const candidateIdsOnPage = useMemo(
    () => new Set(candidates.map((candidate) => candidate.resume_submission_id)),
    [candidates],
  );

  useEffect(() => {
    if (fetcher.state !== 'idle' || !fetcher.data) {
      return;
    }

    const payload = fetcher.data as { error?: string } & Partial<BulkApplicantStageResponseDto>;

    if (payload.error) {
      showToast({ title: 'Action failed', description: payload.error, tone: 'error' });
      return;
    }

    if (payload.success_count === undefined || payload.failure_count === undefined) {
      return;
    }

    const successCount = payload.success_count;
    const failureCount = payload.failure_count;

    if (failureCount > 0 && successCount > 0) {
      showToast({
        title: 'Bulk action partially completed',
        description: `${successCount} candidate(s) updated, ${failureCount} skipped.`,
        tone: 'info',
      });
    } else if (failureCount > 0) {
      const firstError = payload.results?.find((item) => !item.success)?.message;
      showToast({
        title: 'Bulk action failed',
        description: firstError ?? 'No candidates were updated.',
        tone: 'error',
      });
    } else {
      showToast({
        title: 'Bulk action completed',
        description: `${successCount} candidate(s) updated successfully.`,
        tone: 'success',
      });
    }

    revalidator.revalidate();
  }, [fetcher.data, fetcher.state, revalidator, showToast]);

  const selectedIdsOnPage = useMemo(
    () => selectedIds.filter((id) => candidateIdsOnPage.has(id)),
    [selectedIds, candidateIdsOnPage],
  );
  const selectedSet = useMemo(() => new Set(selectedIdsOnPage), [selectedIdsOnPage]);
  const candidateById = useMemo(
    () => new Map(candidates.map((candidate) => [candidate.resume_submission_id, candidate])),
    [candidates],
  );
  const selectedCandidatesOnPage = useMemo(
    () =>
      selectedIdsOnPage
        .map((id) => candidateById.get(id))
        .filter((candidate): candidate is NonNullable<typeof candidate> => Boolean(candidate)),
    [candidateById, selectedIdsOnPage],
  );
  const selectedValidShortlistCount = useMemo(
    () =>
      selectedCandidatesOnPage.filter((candidate) => canShortlistCandidate(candidate.submission_status)).length,
    [selectedCandidatesOnPage],
  );

  const isAllChecked = candidates.length > 0 && candidates.every((candidate) => selectedSet.has(candidate.resume_submission_id));
  const isRecommendationFilterVisible = tabsWithRecommendationFilter.has(normalizedFilters.stage);
  const isSubmittingAction = fetcher.state !== 'idle';
  // eslint-disable-next-line react-hooks/preserve-manual-memoization
  const bulkActions = useMemo(
    () => getBulkActionsForStage(normalizedFilters.stage, selectedIdsOnPage.length, selectedValidShortlistCount),
    [normalizedFilters.stage, selectedIdsOnPage.length, selectedValidShortlistCount],
  );

  const recommendedCutoffOptions: DropdownOption[] = [5, 10, 15, 20, 25, 30].map((value) => ({
    value: String(value),
    label: `Top ${value}%`,
    accentClassName: 'bg-violet-100 text-violet-700',
  }));
  const previousPageHref = buildCandidateQuery(normalizedFilters, Math.max(1, pagination.page - 1));
  const hasSearchOrFacetFilters =
    normalizedFilters.search.trim().length > 0 ||
    normalizedFilters.jobId !== 'all' ||
    normalizedFilters.department !== 'all';
  const isEmptyPage = pagination.total > 0 && candidates.length === 0;
  const isLoadingList = navigation.state === 'loading' && navigation.location?.pathname === '/recruiter/candidates';
  const emptyStateContent = stageEmptyStateMap[normalizedFilters.stage] ?? stageEmptyStateMap.all;

  const toggleAllRows = () => {
    if (isAllChecked) {
      setSelectedIds([]);
      return;
    }

    setSelectedIds(candidates.map((candidate) => candidate.resume_submission_id));
  };

  const toggleSingleRow = (id: string) => {
    setSelectedIds((previous) =>
      previous.includes(id) ? previous.filter((value) => value !== id) : [...previous, id],
    );
  };

  const queueBulkAction = async (action: CandidateBulkAction) => {
    if (selectedIdsOnPage.length === 0 || isSubmittingAction || action.disabled) {
      return;
    }

    const eligibleIds = selectedIdsOnPage.filter((id) => {
      const candidate = candidateById.get(id);
      return candidate ? isActionAllowed(action.action, candidate.submission_status) : false;
    });
    const skippedCount = selectedIdsOnPage.length - eligibleIds.length;

    if (action.action === 'shortlist' && skippedCount > 0) {
      showToast({
        title: 'Shortlist unavailable',
        description: getShortlistWarningMessage(skippedCount, eligibleIds.length === 0),
        tone: 'warning',
      });
      return;
    }

    if (eligibleIds.length === 0) {
      showToast({
        title: `No eligible candidates for ${action.label.toLowerCase()}`,
        description: 'All selected candidates are in stages that do not allow this action.',
        tone: 'error',
      });
      return;
    }

    const summaryMessage = `${action.message} Eligible: ${eligibleIds.length}.${
      skippedCount > 0 ? ` Skipped: ${skippedCount} ineligible candidate(s).` : ''
    }`;
    const confirmed = await confirm({
      title: action.title,
      message: summaryMessage,
      confirmLabel: action.label,
      accent: action.accent,
    });

    if (!confirmed) {
      return;
    }

    submitBulkAction({ ...action, eligibleIds, skippedCount, message: summaryMessage });
  };

  const submitBulkAction = (action: CandidateBulkAction) => {
    const eligibleIds = action.eligibleIds ?? selectedIdsOnPage;
    if (eligibleIds.length === 0) {
      return;
    }

    const formData = new FormData();
    formData.set('intent', 'bulk-stage');
    formData.set('action', action.action);

    if (action.status) {
      formData.set('status', action.status);
    }

    formData.set('selectedIds', eligibleIds.join(','));
    console.log('[CandidatesPage] submitting bulk action', action.action, eligibleIds);
    fetcher.submit(formData, {
      method: 'post',
      action: '/recruiter/candidates?index',
    });
    setSelectedIds([]);
  };

  const submitFilters = (event?: { target: { name: string; value: string } }) => {
    if (!filterFormRef.current) {
      return;
    }

    const formData = new FormData(filterFormRef.current);
    if (event?.target.name) {
      formData.set(event.target.name, event.target.value);
    }

    formData.set('page', '1');
    submit(formData, {
      method: 'get',
      action: '/recruiter/candidates',
    });
  };

  return (
    <Card className="-mx-4 border-0 bg-transparent p-0 shadow-none sm:mx-0 dark:border-0 dark:bg-transparent">
      <section className="border border-zinc-200 bg-white px-3 py-4 dark:border-zinc-800 dark:bg-zinc-950 sm:px-6 sm:py-5">
        <div className="mb-3">
          <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 sm:text-xl">Candidates</h2>
          <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
            Review applications, filter by hiring stage, and move candidates forward.
          </p>
        </div>

        <CandidateStageTabs countByStage={countByStage} filters={normalizedFilters} />

        <CandidatesFilters
          filters={normalizedFilters}
          jobs={jobs}
          departments={departments}
          counts={counts}
          isRecommendationFilterVisible={isRecommendationFilterVisible}
          recommendedCutoffOptions={recommendedCutoffOptions}
          formRef={filterFormRef}
          onSubmitFilters={submitFilters}
        />
      </section>

      <section className="mt-4 min-w-0 border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950">
        <div className="flex flex-col gap-3 border-b border-zinc-200 px-3 py-4 dark:border-zinc-800 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between sm:px-6">
          <p className="text-xs leading-5 text-zinc-500 dark:text-zinc-400">
            ATS auto-recommends top {recommendation.top_percent}% by score. Selected: {selectedIdsOnPage.length}
          </p>
          <BulkActionsBar
            actions={bulkActions}
            selectedCount={selectedIdsOnPage.length}
            isSubmittingAction={isSubmittingAction}
            onQueueAction={(action) => {
              void queueBulkAction(action);
            }}
          />
        </div>

        {isEmptyPage ? (
          <EmptyState
            icon={FileSearch}
            title="No results on this page"
            description="There are candidates in this view, but this page has no results. Go back a page to continue reviewing them."
            actionLabel="Go to previous page"
            onAction={() => {
              navigate(`/recruiter/candidates${previousPageHref}`);
            }}
          />
        ) : candidates.length === 0 ? (
          <EmptyState
            icon={emptyStateContent.icon}
            title={emptyStateContent.title}
            description={
              hasSearchOrFacetFilters
                ? 'Try adjusting your search, job, or department filters to broaden the candidate list.'
                : emptyStateContent.description
            }
          />
        ) : (
          <CandidatesTable
            candidates={candidates}
            stage={normalizedFilters.stage}
            isAllChecked={isAllChecked}
            selectedSet={selectedSet}
            onToggleAllRows={toggleAllRows}
            onToggleSingleRow={toggleSingleRow}
            loading={isLoadingList}
          />
        )}

        {(pagination.total > 0 || isEmptyPage) ? (
          <TablePagination
            page={pagination.page}
            totalPages={pagination.totalPages}
            totalCount={pagination.total}
            pageSize={pagination.pageSize}
            itemLabel="candidates"
            getPageHref={(page) => buildCandidateQuery(normalizedFilters, page)}
          />
        ) : null}
      </section>
    </Card>
  );
};
