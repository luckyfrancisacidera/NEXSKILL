import { cn } from '@shared/utils/cn';
import type { CandidateBulkAction } from '@features/recruiter/types';

export interface BulkActionsBarProps {
  actions: CandidateBulkAction[];
  selectedCount: number;
  isSubmittingAction: boolean;
  onQueueAction: (action: CandidateBulkAction) => void;
}

/**
 * Action bar that renders the available bulk actions for the active pipeline stage.
 */
export const BulkActionsBar = ({ actions, selectedCount, isSubmittingAction, onQueueAction }: BulkActionsBarProps) => (
  <div className="flex flex-wrap items-center gap-2">
    {actions.map((action) => {
      const isSecondary = action.accent === 'violet';
      const isDanger = action.accent === 'red';
      const isDisabled = selectedCount === 0 || isSubmittingAction || action.disabled;
      const disabledTitle = action.action === 'shortlist' && action.disabled
        ? 'Candidates in Shortlisted, Interview, Offer, or Hired cannot be shortlisted again.'
        : undefined;
      const label = action.action === 'remove-shortlist' && selectedCount > 1
        ? `Remove From Shortlist (${selectedCount})`
        : action.label;
      const className = isSecondary
        ? cn(
            'rounded-xl border px-3.5 py-2 text-sm shadow-sm transition',
            isDisabled
              ? 'cursor-not-allowed border-zinc-200 bg-zinc-100 text-zinc-400 opacity-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-500'
              : 'border-violet-300 bg-white text-violet-700 opacity-100 hover:bg-violet-50 dark:border-zinc-900 dark:bg-zinc-900 dark:text-white dark:hover:bg-zinc-800',
          )
        : isDanger
          ? cn(
              'rounded-xl px-3.5 py-2 text-sm text-white shadow-sm transition',
              isDisabled
                ? 'cursor-not-allowed bg-rose-200 opacity-50 dark:bg-rose-950'
                : 'bg-rose-600 opacity-100 hover:bg-rose-700 dark:bg-rose-900 dark:hover:bg-rose-800',
            )
          : cn(
              'rounded-xl px-3.5 py-2 text-sm text-white shadow-sm transition',
              isDisabled
                ? 'cursor-not-allowed bg-zinc-300 opacity-50 dark:bg-zinc-800'
                : 'bg-zinc-900 opacity-100 hover:bg-zinc-700 dark:bg-violet-700 dark:hover:bg-violet-600',
            );

      return (
        <button key={`${action.action}-${action.label}`} type="button" disabled={isDisabled} onClick={() => onQueueAction(action)} className={className} title={disabledTitle}>
          {label}
        </button>
      );
    })}
  </div>
);
