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
      const className = isSecondary
        ? 'rounded-xl border border-violet-300 bg-white px-3.5 py-2 text-sm text-violet-700 shadow-sm transition hover:bg-violet-50 disabled:cursor-not-allowed disabled:border-zinc-200 disabled:text-zinc-400'
        : isDanger
          ? 'rounded-xl bg-rose-600 px-3.5 py-2 text-sm text-white shadow-sm transition hover:bg-rose-700 disabled:cursor-not-allowed disabled:bg-rose-200'
          : 'rounded-xl bg-zinc-900 px-3.5 py-2 text-sm text-white shadow-sm disabled:cursor-not-allowed disabled:bg-zinc-300';

      return (
        <button key={`${action.action}-${action.label}`} type="button" disabled={selectedCount === 0 || isSubmittingAction} onClick={() => onQueueAction(action)} className={className}>
          {action.label}
        </button>
      );
    })}
  </div>
);
