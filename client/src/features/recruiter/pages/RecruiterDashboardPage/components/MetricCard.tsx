import { ArrowDownRight, ArrowUpRight, type LucideIcon } from 'lucide-react';

import { Card } from '@shared/components/Card';

export interface MetricCardProps {
  icon: LucideIcon;
  label: string;
  value: number;
  comparisonPercent: number;
}

const formatCompactNumber = (value: number) => Intl.NumberFormat('en-US').format(value);

/**
 * Summary card used for high-level recruiter funnel metrics.
 */
export const MetricCard = ({ icon: Icon, label, value, comparisonPercent }: MetricCardProps) => {
  const positive = comparisonPercent >= 0;

  return (
    <Card className="min-w-55 flex-1 space-y-3 rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm">
      <div className="flex items-center justify-between">
        <div className="inline-flex items-center gap-2 text-sm font-medium text-zinc-700">
          <Icon size={16} className="text-zinc-500" />
          <span>{label}</span>
        </div>
        <p className={`inline-flex items-center gap-1 text-sm font-semibold ${positive ? 'text-emerald-600' : 'text-rose-600'}`}>
          {positive ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
          {Math.abs(comparisonPercent).toFixed(0)}%
        </p>
      </div>

      <p className="text-2xl font-semibold tracking-tight text-zinc-900">{formatCompactNumber(value)}</p>
    </Card>
  );
};
