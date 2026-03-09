import { Link } from 'react-router-dom';

import type { CandidateFilters } from '@features/recruiter/types';

const stageTabs = [
  { key: 'all', label: 'All Applicants', badge: 'bg-slate-100 text-slate-700' },
  { key: 'Recommended', label: 'Recommended', badge: 'bg-violet-100 text-violet-700' },
  { key: 'Shortlisted', label: 'Shortlisted', badge: 'bg-sky-100 text-sky-700' },
  { key: 'Interview', label: 'Interview', badge: 'bg-amber-100 text-amber-700' },
  { key: 'Offer', label: 'Offer', badge: 'bg-emerald-100 text-emerald-700' },
  { key: 'Hire', label: 'Hire', badge: 'bg-fuchsia-100 text-fuchsia-700' },
] as const;

export interface CandidateStageTabsProps {
  countByStage: Record<string, number>;
  filters: CandidateFilters;
}

/**
 * Top navigation tabs for the candidate pipeline stages.
 */
export const CandidateStageTabs = ({ countByStage, filters }: CandidateStageTabsProps) => (
  <div className="mb-0 border-b border-zinc-200">
    <div className="flex min-w-max gap-2 overflow-x-auto overflow-y-hidden pt-2">
      {stageTabs.map((tab) => {
        const isActive = filters.stage === tab.key;

        return (
          <Link
            key={tab.key}
            to={`?search=${encodeURIComponent(filters.search)}&jobId=${encodeURIComponent(filters.jobId)}&department=${encodeURIComponent(filters.department)}&recommendedTopPercent=${encodeURIComponent(filters.recommendedTopPercent)}&pageSize=${encodeURIComponent(filters.pageSize)}&page=1&stage=${encodeURIComponent(tab.key)}`}
            className={`relative -mb-px inline-flex items-center gap-2 rounded-t-xl border px-4 py-2.5 text-sm font-medium transition ${
              isActive
                ? 'border-zinc-200 border-b-white bg-white text-zinc-900 shadow-sm'
                : 'border-zinc-200 bg-zinc-50 text-zinc-500 hover:bg-zinc-100'
            }`}
          >
            <span>{tab.label}</span>
            <span className={`flex h-6 min-w-6 items-center justify-center rounded-full px-2 text-xs font-semibold ${isActive ? tab.badge : 'bg-zinc-200 text-zinc-600'}`}>
              {countByStage[tab.key] ?? 0}
            </span>
          </Link>
        );
      })}
    </div>
  </div>
);
