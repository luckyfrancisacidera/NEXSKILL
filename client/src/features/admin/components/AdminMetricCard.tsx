import { Card } from '@shared/components/Card';

interface AdminMetricCardProps {
  label: string;
  value: number;
  accent?: string;
}

export const AdminMetricCard = ({
  label,
  value,
  accent = 'border-zinc-300 bg-zinc-50 text-zinc-700',
}: AdminMetricCardProps) => (
  <Card className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
    <div className="flex items-start justify-between gap-3">
      <div>
        <p className="text-sm font-medium text-zinc-500">{label}</p>
        <p className="mt-3 text-3xl font-semibold text-zinc-950">{value.toLocaleString()}</p>
      </div>
      <span className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold ${accent}`}>
        Live
      </span>
    </div>
  </Card>
);
