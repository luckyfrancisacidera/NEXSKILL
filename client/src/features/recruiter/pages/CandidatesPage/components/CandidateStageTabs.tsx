import { Link } from 'react-router-dom';

import type { CandidateFilters } from '@features/recruiter/types';
import { getApplicationStatusAppearance } from '@shared/utils/applicationStatus';

const stageTabs = [
  { key: 'all', label: 'All Applicants' },
  { key: 'Recommended', label: 'Recommended' },
  { key: 'Shortlisted', label: 'Shortlisted' },
  { key: 'Interview', label: 'Interview' },
  { key: 'Offer', label: 'Offer' },
] as const;

export interface CandidateStageTabsProps {
  countByStage: Record<string, number>;
  filters: CandidateFilters;
}

/**
 * Top navigation tabs for the candidate pipeline stages.
 */
export const CandidateStageTabs = ({ countByStage, filters }: CandidateStageTabsProps) => (
  <div className="mb-0 border-b border-zinc-200 dark:border-zinc-800">
    <div className="flex min-w-max gap-2 overflow-x-auto overflow-y-hidden pt-2">
      {stageTabs.map((tab) => {
        const isActive = filters.stage === tab.key;
        const appearance =
          tab.key === 'all'
            ? null
            : getApplicationStatusAppearance(tab.key);

        return (
          <Link
            key={tab.key}
            to={`?search=${encodeURIComponent(filters.search)}&jobId=${encodeURIComponent(filters.jobId)}&department=${encodeURIComponent(filters.department)}&recommendedTopPercent=${encodeURIComponent(filters.recommendedTopPercent)}&pageSize=${encodeURIComponent(filters.pageSize)}&page=1&stage=${encodeURIComponent(tab.key)}`}
            className={`relative -mb-px inline-flex items-center gap-2 rounded-t-xl border px-4 py-2.5 text-sm font-medium transition ${
              isActive
                ? 'border-zinc-200 border-b-white bg-white text-zinc-900 shadow-sm dark:border-zinc-800 dark:border-b-zinc-950 dark:bg-zinc-950 dark:text-zinc-100'
                : 'border-zinc-200 bg-zinc-50 text-zinc-500 hover:bg-zinc-100 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800'
            }`}
          >
            <span>{tab.label}</span>
            <span
              className={`flex h-6 min-w-6 items-center justify-center rounded-full px-2 text-xs font-semibold ${
                isActive
                  ? appearance?.accentClassName ?? 'bg-slate-100 text-slate-700 dark:bg-slate-900/60 dark:text-slate-300'
                  : 'bg-zinc-200 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400'
              }`}
            >
              {countByStage[tab.key] ?? 0}
            </span>
          </Link>
        );
      })}
    </div>
  </div>
);
