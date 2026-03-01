import { MapPin } from 'lucide-react';
import { useFetcher } from 'react-router-dom';
import type { Job } from '@shared/types';
import { Badge } from '@shared/components/Badge';
import { Button } from '@shared/components/Button';
import { Card } from '@shared/components/Card';
import { formatSalary } from '@shared/utils/format';

interface JobCardProps {
  job: Job;
}

export const JobCard = ({ job }: JobCardProps) => {
  const fetcher = useFetcher();

  return (
    <Card className="space-y-4 p-4">
      <div className="flex items-start justify-between">
        <div>
          <h3 className="text-lg font-semibold text-zinc-900">{job.title}</h3>
          <p className="text-sm text-zinc-500">{job.company}</p>
        </div>
        <span className="rounded-md bg-zinc-100 px-2 py-1 text-xs text-zinc-600">{job.type}</span>
      </div>
      <p className="text-sm font-medium text-zinc-800">{formatSalary(job.salaryMin, job.salaryMax)}</p>
      <p className="flex items-center gap-1 text-sm text-zinc-500">
        <MapPin className="h-4 w-4" /> {job.location}
      </p>
      <p className="text-sm text-zinc-600">{job.snippet}</p>
      <div className="flex items-center justify-between">
        <Badge>{job.type}</Badge>
        <fetcher.Form method="post" action="/jobs/apply">
          <input type="hidden" name="jobId" value={job.id} />
          <Button
            type="submit"
            disabled={fetcher.state !== 'idle'}
          >
            {fetcher.state === 'idle' ? 'Apply' : 'Applying...'}
          </Button>
        </fetcher.Form>
      </div>
    </Card>
  );
};