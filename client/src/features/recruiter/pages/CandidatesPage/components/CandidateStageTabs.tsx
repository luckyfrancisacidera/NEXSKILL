import { useEffect, useRef } from 'react';
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
export const CandidateStageTabs = ({ countByStage, filters }: CandidateStageTabsProps) => {
  const scrollContainerRef = useRef<HTMLDivElement | null>(null);
  const activeTabRef = useRef<HTMLAnchorElement | null>(null);

  useEffect(() => {
    const container = scrollContainerRef.current;
    const activeTab = activeTabRef.current;

    if (!container || !activeTab) {
      return;
    }

    activeTab.scrollIntoView({
      behavior: 'smooth',
      block: 'nearest',
      inline: 'center',
    });
  }, [filters.stage]);

  return (
    <div className="mb-0 border-b border-zinc-200 dark:border-zinc-800">
      <div className="relative">
        <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-5 bg-linear-to-r from-white to-transparent dark:from-zinc-950 md:hidden" />
        <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-5 bg-linear-to-l from-white to-transparent dark:from-zinc-950 md:hidden" />

        <div
          ref={scrollContainerRef}
          className="no-scrollbar flex w-full snap-x snap-mandatory flex-nowrap gap-2 overflow-x-auto overflow-y-hidden px-1 pt-2 pb-px scroll-smooth whitespace-nowrap md:flex-wrap md:overflow-x-visible lg:flex-nowrap"
        >
          {stageTabs.map((tab) => {
            const isActive = filters.stage === tab.key;
            const appearance =
              tab.key === 'all'
                ? null
                : getApplicationStatusAppearance(tab.key);

            return (
              <Link
                key={tab.key}
                ref={isActive ? activeTabRef : null}
                to={`?search=${encodeURIComponent(filters.search)}&jobId=${encodeURIComponent(filters.jobId)}&department=${encodeURIComponent(filters.department)}&recommendedTopPercent=${encodeURIComponent(filters.recommendedTopPercent)}&pageSize=${encodeURIComponent(filters.pageSize)}&page=1&stage=${encodeURIComponent(tab.key)}`}
                className={`relative -mb-px inline-flex min-h-11 shrink-0 snap-start items-center gap-2 rounded-t-xl border px-3 py-2.5 text-sm font-medium whitespace-nowrap transition sm:px-4 ${
                  isActive
                    ? 'border-zinc-300 border-b-white bg-white text-zinc-950 shadow-sm dark:border-zinc-700 dark:border-b-zinc-950 dark:bg-zinc-950 dark:text-zinc-50'
                    : 'border-zinc-200 bg-zinc-50 text-zinc-500 hover:border-zinc-300 hover:bg-zinc-100 hover:text-zinc-700 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-400 dark:hover:border-zinc-700 dark:hover:bg-zinc-800 dark:hover:text-zinc-200'
                }`}
              >
                <span
                  className={`max-w-[9.5rem] truncate whitespace-nowrap ${
                    isActive ? 'text-zinc-950 dark:text-zinc-50' : ''
                  }`}
                >
                  {tab.label}
                </span>
                <span
                  className={`flex h-6 min-w-6 shrink-0 items-center justify-center rounded-full px-2 text-xs font-semibold ${
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
    </div>
  );
};
