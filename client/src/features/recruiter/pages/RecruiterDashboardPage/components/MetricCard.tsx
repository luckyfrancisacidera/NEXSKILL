import { ArrowDownRight, ArrowUpRight, type LucideIcon } from 'lucide-react';

import { Card } from '@shared/components/data-display/Card';

export interface MetricCardProps {
  icon: LucideIcon;
  label: string;
  value: number;
  comparisonPercent: number;
  valueDisplay?: string;
}

const formatCompactNumber = (value: number) => Intl.NumberFormat('en-US').format(value);

/**
 * Summary card used for high-level recruiter funnel metrics.
 */
export const MetricCard = ({ icon: Icon, label, value, comparisonPercent, valueDisplay }: MetricCardProps) => {
  const positive = comparisonPercent >= 0;

  return (
    <Card className="h-full space-y-2.5 rounded-[22px] border border-zinc-200 bg-white p-3.5 shadow-sm dark:border-zinc-800 dark:bg-zinc-950 sm:p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="inline-flex min-w-0 items-center gap-2 text-[11px] font-medium text-zinc-700 dark:text-zinc-400 sm:text-sm">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-zinc-100 text-zinc-600 dark:bg-zinc-900 dark:text-zinc-300 sm:h-9 sm:w-9">
            <Icon size={14} />
          </div>
          <span className="truncate">{label}</span>
        </div>
        <p className={`inline-flex shrink-0 items-center gap-1 text-[11px] font-semibold sm:text-sm ${positive ? 'text-emerald-600' : 'text-rose-600'}`}>
          {positive ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
          {Math.abs(comparisonPercent).toFixed(0)}%
        </p>
      </div>

      <p className="text-xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-100 sm:text-2xl">{valueDisplay ?? formatCompactNumber(value)}</p>
      <p className="text-[11px] text-zinc-500 dark:text-zinc-400 sm:text-xs">Compared with the previous matched period</p>
    </Card>
  );
};

