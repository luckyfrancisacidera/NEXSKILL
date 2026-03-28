import { Card } from '@shared/components/Card';

interface AdminMetricCardProps {
  label: string;
  value: number;
  accent?: string;
}

export const AdminMetricCard = ({
  label,
  value,
  accent = 'border-zinc-300 bg-zinc-50 text-zinc-700 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300',
}: AdminMetricCardProps) => (
  <Card className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-700 dark:bg-zinc-900 sm:p-5">
    <div className="flex items-start justify-between gap-3">
      <div className="min-w-0">
        <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400 sm:text-sm">{label}</p>
        <p className="mt-3 text-2xl font-semibold text-zinc-950 dark:text-zinc-100 sm:text-3xl">{value.toLocaleString()}</p>
      </div>
      <span className={`inline-flex shrink-0 rounded-full border px-3 py-1 text-xs font-semibold dark:bg-zinc-800 ${accent}`}>
        Live
      </span>
    </div>
  </Card>
);
