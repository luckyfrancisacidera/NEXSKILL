import { useEffect } from 'react';
import { ArrowLeft, BarChart3, Expand } from 'lucide-react';

import type { DashboardDto, DashboardGroupBy, DashboardQuickRange } from '@features/recruiter/types';
import { Card } from '@shared/components/data-display/Card';
import { DashboardAreaChart } from '@shared/components/data-display/DashboardAreaChart';
import { DashboardEmptyState } from '@shared/components/layout/DashboardPrimitives';
import Dropdown, { type DropdownOption } from '@shared/components/form/Dropdown';

export interface TrendChartCardProps {
  expanded: boolean;
  title: string;
  groupBy: DashboardGroupBy;
  groupOptions: DashboardGroupBy[];
  quickRange: DashboardQuickRange;
  quickRangeOptions: DropdownOption[];
  labels: string[];
  datasets: DashboardDto['trends']['datasets'];
  onGroupByChange: (value: DashboardGroupBy) => void;
  onQuickRangeChange: (value: DashboardQuickRange) => void;
  onToggleExpanded: () => void;
}

/**
 * Trend chart container for recruiter dashboard analytics.
 */
export const TrendChartCard = ({
  expanded,
  title,
  groupBy,
  groupOptions,
  quickRange,
  quickRangeOptions,
  labels,
  datasets,
  onGroupByChange,
  onQuickRangeChange,
  onToggleExpanded,
}: TrendChartCardProps) => {
  useEffect(() => {
    if (!expanded) {
      return;
    }

    const previousOverflow = document.body.style.overflow;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onToggleExpanded();
      }
    };

    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', onKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [expanded, onToggleExpanded]);

  const controls = (
    <>
      <div className="w-full overflow-x-auto pb-1 sm:w-auto sm:overflow-visible sm:pb-0">
        <div className="inline-flex min-w-max rounded-lg border border-zinc-300 bg-zinc-100 p-1 dark:border-zinc-700 dark:bg-zinc-900">
          {groupOptions.map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => onGroupByChange(item)}
              className={`rounded-md px-2.5 py-1.5 text-[11px] font-semibold capitalize transition sm:px-3 sm:text-sm ${
                groupBy === item
                  ? 'bg-black text-white shadow-sm dark:bg-zinc-100 dark:text-zinc-900'
                  : 'text-zinc-600 hover:bg-zinc-200 dark:text-zinc-400 dark:hover:bg-zinc-800'
              }`}
            >
              {item}
            </button>
          ))}
        </div>
      </div>

      <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:flex-wrap sm:items-end">
        <div className="min-w-0 flex-1 sm:min-w-[11rem] sm:flex-none">
          <Dropdown
            label="Quick Filter"
            name="quickRange"
            value={quickRange}
            options={quickRangeOptions}
            onChange={(event) => onQuickRangeChange(event.target.value as DashboardQuickRange)}
            buttonClassName="h-9 rounded-md sm:h-10"
          />
        </div>
        <button
          type="button"
          className="inline-flex items-center justify-center gap-2 rounded-md border border-zinc-300 px-2.5 py-1.5 text-xs font-medium text-zinc-700 dark:border-zinc-700 dark:text-zinc-400 dark:hover:bg-zinc-900 sm:px-3 sm:py-2 sm:text-sm"
          onClick={onToggleExpanded}
        >
          {expanded ? <ArrowLeft size={14} /> : <Expand size={14} />}
          {expanded ? 'Back to Dashboard' : 'Expand'}
        </button>
      </div>
    </>
  );

  const chartContent = (
    <div className="min-h-0">
      <h2 className="mb-2 text-xs font-semibold text-zinc-600 dark:text-zinc-400 sm:text-sm">{title}</h2>
      <div className={expanded ? 'h-full min-h-[300px]' : 'h-[260px] sm:h-[320px]'}>
        {labels.length > 0 && datasets.length > 0 ? (
          <DashboardAreaChart labels={labels} datasets={datasets} />
        ) : (
          <DashboardEmptyState
            compact
            icon={BarChart3}
            title="No recruiter activity yet"
            description="Trend data will appear here as soon as your job posts begin receiving candidate activity."
          />
        )}
      </div>
    </div>
  );

  return (
    <>
      <Card className="space-y-3 rounded-2xl border border-zinc-200 bg-white p-3.5 shadow-sm dark:border-zinc-800 dark:bg-zinc-950 sm:p-4">
        <div className="flex flex-col gap-3 border-b border-zinc-200 pb-3 dark:border-zinc-800 sm:flex-row sm:flex-wrap sm:items-end sm:justify-between">
          {controls}
        </div>
        {chartContent}
      </Card>

      {expanded ? (
        <div className="fixed inset-0 z-50 bg-zinc-950/55 backdrop-blur-sm">
          <div className="flex h-full w-full p-3 sm:p-4 lg:p-6">
            <Card className="flex h-full w-full flex-col rounded-[24px] border border-zinc-200 bg-white p-4 shadow-2xl dark:border-zinc-800 dark:bg-zinc-950 sm:p-5 lg:p-6">
              <div className="flex flex-col gap-3 border-b border-zinc-200 pb-4 dark:border-zinc-800 sm:flex-row sm:flex-wrap sm:items-end sm:justify-between">
                {controls}
              </div>
              <div className="flex-1 min-h-0 pt-4">
                {chartContent}
              </div>
            </Card>
          </div>
        </div>
      ) : null}
    </>
  );
};

