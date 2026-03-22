import { BarChart3, Expand } from 'lucide-react';

import type { DashboardDto, DashboardGroupBy, DashboardQuickRange } from '@features/recruiter/types';
import { Card } from '@shared/components/Card';
import { DashboardAreaChart } from '@shared/components/DashboardAreaChart';
import { DashboardEmptyState } from '@shared/components/DashboardPrimitives';
import Dropdown, { type DropdownOption } from '@shared/components/Dropdown';

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
export const TrendChartCard = ({ expanded, title, groupBy, groupOptions, quickRange, quickRangeOptions, labels, datasets, onGroupByChange, onQuickRangeChange, onToggleExpanded }: TrendChartCardProps) => (
  <Card className={expanded ? 'fixed inset-4 z-40 space-y-4 overflow-auto rounded-2xl border border-zinc-200 bg-white p-4 shadow-xl dark:border-zinc-800 dark:bg-zinc-950 md:inset-6' : 'space-y-4 rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-950'}>
    <div className="flex flex-wrap items-end justify-between gap-3 border-b border-zinc-200 pb-3 dark:border-zinc-800">
      <div className="inline-flex flex-wrap rounded-lg border border-zinc-300 bg-zinc-100 p-1 dark:border-zinc-700 dark:bg-zinc-900">
        {groupOptions.map((item) => (
          <button key={item} type="button" onClick={() => onGroupByChange(item)} className={`rounded-md px-5 py-1.5 text-sm font-semibold capitalize transition ${groupBy === item ? 'bg-black text-white shadow-sm dark:bg-violet-600 dark:text-white' : 'text-zinc-600 hover:bg-zinc-200 dark:text-zinc-400 dark:hover:bg-zinc-800'}`}>
            {item}
          </button>
        ))}
      </div>

      <div className="flex flex-wrap items-end gap-2">
        <div className="min-w-[10.5rem] flex-1 sm:flex-none">
          <Dropdown label="Quick Filter" name="quickRange" value={quickRange} options={quickRangeOptions} onChange={(event) => onQuickRangeChange(event.target.value as DashboardQuickRange)} buttonClassName="h-9 rounded-md" />
        </div>
        <button type="button" className="inline-flex items-center gap-2 rounded-md border border-zinc-300 px-3 py-1.5 text-sm font-medium text-zinc-700 dark:border-zinc-700 dark:text-zinc-400 dark:hover:bg-zinc-900" onClick={onToggleExpanded}>
          <Expand size={16} /> {expanded ? 'Back to Dashboard' : 'Expand'}
        </button>
      </div>
    </div>

    <div>
      <h2 className="mb-3 text-sm font-semibold text-zinc-600 dark:text-zinc-400">{title}</h2>
      <div className={expanded ? 'h-[70vh]' : 'h-96'}>
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
  </Card>
);
