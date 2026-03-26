import type { JobTrendPoint } from '@features/recruiter/types';
import { Card } from '@shared/components/Card';
import { DashboardAreaChart } from '@shared/components/DashboardAreaChart';

export interface ApplicantsTrendCardProps {
  trend: JobTrendPoint[];
}

/**
 * Wraps the applicant trend chart so chart setup stays out of the main page component.
 */
export const ApplicantsTrendCard = ({ trend }: ApplicantsTrendCardProps) => (
  <Card>
    <h3 className="mb-2 font-semibold">Applicants trend</h3>
    {trend.length ? (
      <div className="h-50">
        <DashboardAreaChart
          labels={trend.map((item) => item.day)}
          datasets={[
            {
              label: 'Applications',
              data: trend.map((item) => item.applications),
              border_color: '#525252',
              background_color: 'rgba(82,82,82,0.2)',
            },
          ]}
        />
      </div>
    ) : (
      <div className="rounded-xl border border-dashed border-zinc-300 bg-zinc-50 px-4 py-6 text-sm text-zinc-500">
        No applicant trend data is available for this job yet.
      </div>
    )}
  </Card>
);
