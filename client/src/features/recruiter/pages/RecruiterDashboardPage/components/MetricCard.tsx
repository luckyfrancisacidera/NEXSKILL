import { ArrowDownRight, ArrowUpRight, type LucideIcon } from 'lucide-react';

import { Card } from '@shared/components/Card';

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
    <Card className="h-full space-y-3 rounded-3xl border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-950 sm:p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="inline-flex min-w-0 items-center gap-2 text-xs font-medium text-zinc-700 dark:text-zinc-400 sm:text-sm">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl bg-zinc-100 text-zinc-600 dark:bg-zinc-900 dark:text-zinc-300 sm:h-10 sm:w-10">
            <Icon size={16} />
          </div>
          <span className="truncate">{label}</span>
        </div>
        <p className={`inline-flex shrink-0 items-center gap-1 text-xs font-semibold sm:text-sm ${positive ? 'text-emerald-600' : 'text-rose-600'}`}>
          {positive ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
          {Math.abs(comparisonPercent).toFixed(0)}%
        </p>
      </div>

      <p className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-100 sm:text-3xl">{valueDisplay ?? formatCompactNumber(value)}</p>
      <p className="text-xs text-zinc-500 dark:text-zinc-400">Compared with the previous matched period</p>
    </Card>
  );
};
