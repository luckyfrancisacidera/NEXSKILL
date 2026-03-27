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
    <Card className="h-full space-y-3 rounded-3xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
      <div className="flex items-center justify-between">
        <div className="inline-flex min-w-0 items-center gap-2 text-sm font-medium text-zinc-700 dark:text-zinc-400">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-zinc-100 text-zinc-600 dark:bg-zinc-900 dark:text-zinc-300">
            <Icon size={16} />
          </div>
          <span className="truncate">{label}</span>
        </div>
        <p className={`inline-flex items-center gap-1 text-sm font-semibold ${positive ? 'text-emerald-600' : 'text-rose-600'}`}>
          {positive ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
          {Math.abs(comparisonPercent).toFixed(0)}%
        </p>
      </div>

      <p className="text-3xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-100">{valueDisplay ?? formatCompactNumber(value)}</p>
      <p className="text-xs text-zinc-500 dark:text-zinc-400">Compared with the previous matched period</p>
    </Card>
  );
};
