import { useEffect, useMemo, useRef, useState } from 'react';
import { useFetcher, useLoaderData, useRevalidator, useSubmit } from 'react-router-dom';

import { useToast } from '@app/providers/ToastProvider';
import { BulkActionsBar } from '@features/recruiter/pages/CandidatesPage/components/BulkActionsBar';
import { CandidateStageTabs } from '@features/recruiter/pages/CandidatesPage/components/CandidateStageTabs';
import { CandidatesFilters } from '@features/recruiter/pages/CandidatesPage/components/CandidatesFilters';
import { CandidatesPagination } from '@features/recruiter/pages/CandidatesPage/components/CandidatesPagination';
import { CandidatesTable } from '@features/recruiter/pages/CandidatesPage/components/CandidatesTable';

import type {
  BulkApplicantStageResponseDto,
  CandidateBulkAction,
  CandidateFilters,
  CandidatesLoaderData,
} from '@features/recruiter/types';
import { Card } from '@shared/components/Card';
import { useConfirmation } from '@shared/hooks/useConfirmation';
import type { DropdownOption } from '@shared/components/Dropdown';

const tabsWithRecommendationFilter = new Set(['all', 'Recommended']);

const isActionAllowed = (action: string, submissionStatus: string) => {
  const allowedByAction: Record<string, string[]> = {
    shortlist: ['Applied', 'Recommended', 'Shortlisted', 'Interview'],
    'remove-shortlist': ['Shortlisted', 'Interview'],
  };

  const allowedStatuses = allowedByAction[action] ?? [];
  return allowedStatuses.includes(submissionStatus);
};

const buildCandidateQuery = (filters: CandidateFilters, page: number) =>
  `?search=${encodeURIComponent(filters.search)}&jobId=${encodeURIComponent(filters.jobId)}&department=${encodeURIComponent(filters.department)}&recommendedTopPercent=${encodeURIComponent(filters.recommendedTopPercent)}&pageSize=${encodeURIComponent(filters.pageSize)}&page=${page}&stage=${encodeURIComponent(filters.stage)}`;

const getBulkActionsForStage = (stage: string, selectedCount: number): CandidateBulkAction[] => {
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

  if (stage === 'Interview') {
    return [
      {
        action: 'shortlist',
        status: 'Shortlisted',
        label: 'Shortlist',
        title: 'Shortlist interview candidates',
        message: `Move ${countLabel} back to Shortlisted stage?`,
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
    Hire: counts.hire,
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

  const isAllChecked = candidates.length > 0 && candidates.every((candidate) => selectedSet.has(candidate.resume_submission_id));
  const isRecommendationFilterVisible = tabsWithRecommendationFilter.has(normalizedFilters.stage);
  const isSubmittingAction = fetcher.state !== 'idle';
  // eslint-disable-next-line react-hooks/preserve-manual-memoization
  const bulkActions = useMemo(
    () => getBulkActionsForStage(normalizedFilters.stage, selectedIdsOnPage.length),
    [normalizedFilters.stage, selectedIdsOnPage.length],
  );

  const recommendedCutoffOptions: DropdownOption[] = [5, 10, 15, 20, 25, 30].map((value) => ({
    value: String(value),
    label: `Top ${value}%`,
    accentClassName: 'bg-violet-100 text-violet-700',
  }));

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
    if (selectedIdsOnPage.length === 0 || isSubmittingAction) {
      return;
    }

    const eligibleIds = selectedIdsOnPage.filter((id) => {
      const candidate = candidateById.get(id);
      return candidate ? isActionAllowed(action.action, candidate.submission_status) : false;
    });
    const skippedCount = selectedIdsOnPage.length - eligibleIds.length;

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
    <Card className="dark:border-zinc-800 dark:bg-zinc-950 bg-white">
      <div className="mb-3">
        <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100">Candidates</h2>
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

      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <p className="text-xs text-zinc-500 dark:text-zinc-400">
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

      <CandidatesTable
        candidates={candidates}
        isAllChecked={isAllChecked}
        selectedSet={selectedSet}
        onToggleAllRows={toggleAllRows}
        onToggleSingleRow={toggleSingleRow}
      />

      <CandidatesPagination
        page={pagination.page}
        totalPages={pagination.totalPages}
        total={pagination.total}
        previousHref={buildCandidateQuery(normalizedFilters, Math.max(1, pagination.page - 1))}
        nextHref={buildCandidateQuery(normalizedFilters, Math.min(pagination.totalPages, pagination.page + 1))}
      />

    </Card>
  );
};






