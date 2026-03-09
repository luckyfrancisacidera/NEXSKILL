/* eslint-disable react-hooks/preserve-manual-memoization */
/**
 * Recruiter candidates page for filtering applicants and executing bulk stage transitions.
 *
 * Main exports:
 * - `CandidatesPage`: Route component for the recruiter candidate pipeline.
 *
 * Usage notes:
 * - The route expects `CandidatesLoaderData` from its loader.
 * - Filter state is owned by the query string so the page remains bookmarkable.
 * - Bulk actions intentionally respect stage eligibility rules before submitting.
 * - TODO: confirm whether rejected candidates should get a dedicated visible tab once backend support is finalized.
 */
import { useEffect, useMemo, useRef, useState } from 'react';
import { useFetcher, useLoaderData, useSubmit } from 'react-router-dom';

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
import { ConfirmationModal } from '@shared/components/ConfirmationModal';
import type { DropdownOption } from '@shared/components/Dropdown';

const tabsWithRecommendationFilter = new Set(['all', 'Recommended']);

const isActionAllowed = (action: string, submissionStatus: string) => {
  const allowedByAction: Record<string, string[]> = {
    shortlist: ['Applied', 'Recommended', 'Shortlisted', 'Interview'],
    'set-interview': ['Shortlisted', 'Interview'],
    offer: ['Interview', 'Offer'],
    hire: ['Offer', 'Hire'],
    reject: ['Applied', 'Recommended', 'Shortlisted', 'Interview', 'Offer', 'Hire'],
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
      {
        action: 'set-interview',
        status: 'Interview',
        label: 'Set Interview',
        title: 'Move to interview',
        message: `Move ${countLabel} to Interview stage?`,
        accent: 'green',
      },
      {
        action: 'reject',
        status: 'Rejected',
        label: 'Reject',
        title: 'Reject candidates',
        message: `Reject ${countLabel}? This cannot be undone.`,
        accent: 'red',
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
      {
        action: 'offer',
        status: 'Offer',
        label: 'Give Offer',
        title: 'Move to offer',
        message: `Move ${countLabel} to Offer stage?`,
        accent: 'green',
      },
      {
        action: 'reject',
        status: 'Rejected',
        label: 'Reject',
        title: 'Reject candidates',
        message: `Reject ${countLabel}? This cannot be undone.`,
        accent: 'red',
      },
    ];
  }

  if (stage === 'Offer') {
    return [
      {
        action: 'hire',
        status: 'Hire',
        label: 'Hire',
        title: 'Hire candidates',
        message: `Move ${countLabel} to Hire stage?`,
        accent: 'green',
      },
      {
        action: 'reject',
        status: 'Rejected',
        label: 'Reject',
        title: 'Reject candidates',
        message: `Reject ${countLabel}? This cannot be undone.`,
        accent: 'red',
      },
    ];
  }

  if (stage === 'Hire') {
    return [
      {
        action: 'reject',
        status: 'Rejected',
        label: 'Reject',
        title: 'Reject candidates',
        message: `Reject ${countLabel}? This cannot be undone.`,
        accent: 'red',
      },
    ];
  }

  return [];
};

/**
 * Route component for recruiter candidates.
 */
export const CandidatesPage = () => {
  const { candidates, jobs, departments, counts, filters, recommendation, pagination } =
    useLoaderData() as CandidatesLoaderData;
  const fetcher = useFetcher();
  const submit = useSubmit();
  const { showToast } = useToast();
  const filterFormRef = useRef<HTMLFormElement | null>(null);

  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [pendingAction, setPendingAction] = useState<CandidateBulkAction | null>(null);

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

    const payload = fetcher.data as { error?: string; result?: BulkApplicantStageResponseDto };

    if (payload.error) {
      showToast({ title: 'Action failed', description: payload.error, tone: 'error' });
      return;
    }

    if (!payload.result) {
      return;
    }

    const { success_count, failure_count } = payload.result;
    if (failure_count > 0 && success_count > 0) {
      showToast({
        title: 'Bulk action partially completed',
        description: `${success_count} candidate(s) updated, ${failure_count} skipped.`,
        tone: 'info',
      });
      return;
    }

    if (failure_count > 0) {
      const firstError = payload.result.results.find((item) => !item.success)?.message;
      showToast({
        title: 'Bulk action failed',
        description: firstError ?? 'No candidates were updated.',
        tone: 'error',
      });
      return;
    }

    showToast({
      title: 'Bulk action completed',
      description: `${success_count} candidate(s) updated successfully.`,
      tone: 'success',
    });
  }, [fetcher.data, fetcher.state, showToast]);

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

  const queueBulkAction = (action: CandidateBulkAction) => {
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
    setPendingAction({ ...action, eligibleIds, skippedCount, message: summaryMessage });
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
    fetcher.submit(formData, {
      method: 'post',
      action: '/recruiter/candidates',
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
    <Card>
      <div className="mb-3">
        <h2 className="text-xl font-semibold text-zinc-900">Candidates</h2>
        <p className="mt-1 text-sm text-zinc-500">
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
        <p className="text-xs text-zinc-500">
          ATS auto-recommends top {recommendation.top_percent}% by score. Selected: {selectedIdsOnPage.length}
        </p>
        <BulkActionsBar
          actions={bulkActions}
          selectedCount={selectedIdsOnPage.length}
          isSubmittingAction={isSubmittingAction}
          onQueueAction={queueBulkAction}
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

      <ConfirmationModal
        open={Boolean(pendingAction)}
        title={pendingAction?.title ?? 'Confirm action'}
        message={pendingAction?.message ?? 'Are you sure?'}
        confirmLabel={pendingAction?.label ?? 'Confirm'}
        accent={pendingAction?.accent ?? 'violet'}
        loading={isSubmittingAction}
        onClose={() => {
          if (isSubmittingAction) {
            return;
          }

          setPendingAction(null);
        }}
        onCancel={() => {
          if (isSubmittingAction) {
            return;
          }

          setPendingAction(null);
        }}
        onConfirm={() => {
          if (!pendingAction || isSubmittingAction) {
            return;
          }

          const actionToSubmit = pendingAction;
          setPendingAction(null);
          submitBulkAction(actionToSubmit);
        }}
      />
    </Card>
  );
};
