import { Expand } from 'lucide-react';

import type { DashboardDto, DashboardGroupBy, DashboardQuickRange } from '@features/recruiter/types';
import { Card } from '@shared/components/Card';
import { DashboardAreaChart } from '@shared/components/DashboardAreaChart';
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
  <Card className={expanded ? 'fixed inset-4 z-40 space-y-4 overflow-auto rounded-2xl border border-zinc-200 bg-white p-4 shadow-xl md:inset-6' : 'space-y-4 rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm'}>
    <div className="flex flex-wrap items-end justify-between gap-3 border-b border-zinc-200 pb-3">
      <div className="inline-flex rounded-lg border border-zinc-300 bg-zinc-100 p-1">
        {groupOptions.map((item) => (
          <button key={item} type="button" onClick={() => onGroupByChange(item)} className={`rounded-md px-5 py-1.5 text-sm font-semibold capitalize transition ${groupBy === item ? 'bg-black text-white shadow-sm' : 'text-zinc-600 hover:bg-zinc-200'}`}>
            {item}
          </button>
        ))}
      </div>

      <div className="flex items-end gap-2">
        <div className="min-w-42.5">
          <Dropdown label="Quick Filter" name="quickRange" value={quickRange} options={quickRangeOptions} onChange={(event) => onQuickRangeChange(event.target.value as DashboardQuickRange)} buttonClassName="h-9 rounded-md" />
        </div>
        <button type="button" className="inline-flex items-center gap-2 rounded-md border border-zinc-300 px-3 py-1.5 text-sm font-medium text-zinc-700" onClick={onToggleExpanded}>
          <Expand size={16} /> {expanded ? 'Back to Dashboard' : 'Expand'}
        </button>
      </div>
    </div>

    <div>
      <h2 className="mb-3 text-sm font-semibold text-zinc-600">{title}</h2>
      <div className={expanded ? 'h-[70vh]' : 'h-96'}>
        <DashboardAreaChart labels={labels} datasets={datasets} />
      </div>
    </div>
  </Card>
);
