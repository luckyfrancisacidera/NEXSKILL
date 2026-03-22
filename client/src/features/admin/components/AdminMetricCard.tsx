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
  <Card className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-700 dark:bg-zinc-900">
    <div className="flex items-start justify-between gap-3">
      <div className="min-w-0">
        <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">{label}</p>
        <p className="mt-3 text-3xl font-semibold text-zinc-950 dark:text-zinc-100">{value.toLocaleString()}</p>
      </div>
      <span className={`inline-flex rounded-full border px-3 dark:bg-zinc-800 py-1 text-xs font-semibold ${accent}`}>
        Live
      </span>
    </div>
  </Card>
);
