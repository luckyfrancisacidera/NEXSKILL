import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';

import type { CandidateFilters } from '@features/recruiter/types';
import { getApplicationStatusAppearance } from '@shared/utils/applicationStatus';
import { cn } from '@shared/utils/cn';

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

type ActiveIndicatorStyle = {
  width: number;
  x: number;
} | null;

/**
 * Top navigation tabs for the candidate pipeline stages.
 */
export const CandidateStageTabs = ({ countByStage, filters }: CandidateStageTabsProps) => {
  const scrollContainerRef = useRef<HTMLDivElement | null>(null);
  const tabsTrackRef = useRef<HTMLDivElement | null>(null);
  const activeTabRef = useRef<HTMLAnchorElement | null>(null);
  const tabRefs = useRef<Record<string, HTMLAnchorElement | null>>({});
  const [activeIndicatorStyle, setActiveIndicatorStyle] = useState<ActiveIndicatorStyle>(null);

  const updateActiveIndicator = () => {
    const activeTab = tabRefs.current[filters.stage];
    const track = tabsTrackRef.current;

    if (!activeTab || !track) {
      setActiveIndicatorStyle(null);
      return false;
    }

    const tabRect = activeTab.getBoundingClientRect();
    const trackRect = track.getBoundingClientRect();
    const nextStyle = {
      width: tabRect.width,
      x: tabRect.left - trackRect.left,
    };

    let didUpdate = false;
    setActiveIndicatorStyle((current) => {
      if (current?.width === nextStyle.width && current.x === nextStyle.x) {
        return current;
      }

      didUpdate = true;
      return nextStyle;
    });

    return didUpdate;
  };

  useLayoutEffect(() => {
    updateActiveIndicator();
  }, [countByStage, filters.stage]);

  useEffect(() => {
    const container = scrollContainerRef.current;
    const activeTab = activeTabRef.current;

    if (!container || !activeTab) {
      return;
    }

    const targetScrollLeft =
      activeTab.offsetLeft - (container.clientWidth - activeTab.offsetWidth) / 2;

    container.scrollTo({
      left: Math.max(0, targetScrollLeft),
      behavior: 'smooth',
    });
  }, [filters.stage]);

  useEffect(() => {
    const track = tabsTrackRef.current;
    const activeTab = tabRefs.current[filters.stage];

    if (!track || !activeTab) {
      return;
    }

    let rafId = 0;
    const scheduleIndicatorUpdate = () => {
      cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(() => {
        updateActiveIndicator();
      });
    };

    const resizeObserver = new ResizeObserver(() => {
      scheduleIndicatorUpdate();
    });

    resizeObserver.observe(track);
    resizeObserver.observe(activeTab);
    scheduleIndicatorUpdate();
    window.addEventListener('resize', scheduleIndicatorUpdate);

    return () => {
      cancelAnimationFrame(rafId);
      resizeObserver.disconnect();
      window.removeEventListener('resize', scheduleIndicatorUpdate);
    };
  }, [countByStage, filters.stage]);

  return (
    <div className="mb-0 min-w-0 max-w-full">
      <div className="min-w-0 max-w-full overflow-x-hidden">
        <div
          ref={scrollContainerRef}
          className="no-scrollbar w-full min-w-0 max-w-full overflow-x-auto overflow-y-hidden px-1 py-1 scroll-smooth"
        >
          <div
            ref={tabsTrackRef}
            className="relative inline-flex min-w-full snap-x snap-mandatory flex-nowrap gap-2 overflow-hidden rounded-full p-1 whitespace-nowrap"
          >
            <span
              aria-hidden="true"
              className={cn(
                'pointer-events-none absolute inset-y-1 left-0 rounded-full border border-zinc-200 bg-white shadow-sm transition-[transform,width] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] will-change-transform dark:border-zinc-700 dark:bg-zinc-100',
                activeIndicatorStyle ? 'opacity-100' : 'opacity-0',
              )}
              style={
                activeIndicatorStyle
                  ? {
                      width: `${activeIndicatorStyle.width}px`,
                      transform: `translateX(${activeIndicatorStyle.x}px)`,
                    }
                  : undefined
              }
            />

            {stageTabs.map((tab) => {
              const isActive = filters.stage === tab.key;
              const appearance =
                tab.key === 'all'
                  ? null
                  : getApplicationStatusAppearance(tab.key);

              return (
                <Link
                  key={tab.key}
                  ref={(element) => {
                    tabRefs.current[tab.key] = element;
                    if (isActive) {
                      activeTabRef.current = element;
                    }
                  }}
                to={`?search=${encodeURIComponent(filters.search)}&jobId=${encodeURIComponent(filters.jobId)}&department=${encodeURIComponent(filters.department)}&pageSize=${encodeURIComponent(filters.pageSize)}&page=1&stage=${encodeURIComponent(tab.key)}`}
                  className={cn(
                    'relative z-10 inline-flex min-h-11 min-w-[7rem] shrink-0 snap-start items-center justify-center gap-2 rounded-full border border-transparent px-3 py-2.5 text-sm font-medium whitespace-nowrap text-zinc-500 outline-none transition-colors sm:min-w-[7.5rem] sm:px-4',
                    isActive
                      ? 'text-zinc-950 dark:text-zinc-950'
                      : 'hover:bg-zinc-200/70 hover:text-zinc-700 focus-visible:text-zinc-700 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-200 dark:focus-visible:text-zinc-200',
                    'focus-visible:ring-2 focus-visible:ring-zinc-400 focus-visible:ring-inset dark:focus-visible:ring-zinc-600',
                  )}
                >
                  <span className="max-w-[9.5rem] truncate whitespace-nowrap">
                    {tab.label}
                  </span>
                  <span
                    className={cn(
                      'flex h-6 min-w-6 shrink-0 items-center justify-center rounded-full px-2 text-xs font-semibold transition-colors',
                      isActive
                        ? appearance?.accentClassName ?? 'bg-slate-100 text-slate-700 dark:bg-slate-900/60 dark:text-slate-300'
                        : 'bg-zinc-200 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400',
                    )}
                  >
                    {countByStage[tab.key] ?? 0}
                  </span>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
