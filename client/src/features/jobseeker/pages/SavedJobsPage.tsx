import { useEffect, useState } from 'react';
import { Card } from '@shared/components/Card';
import { JobCard } from '@shared/components/JobCard';
import type { Job } from '@shared/types';
import { jobseekerService } from '@features/jobseeker/service/jobseeker.service';

export const SavedJobsPage = () => {
  const [search, setSearch] = useState('');
  const [saved, setSaved] = useState<Array<Record<string, unknown>>>([]);

  const load = async () => setSaved(await jobseekerService.getSavedJobs(search));
  useEffect(() => { void load(); }, [search]);

  return (
    <div className="space-y-4">
      <Card className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-2xl font-semibold">Saved Jobs</h2>
        <input value={search} onChange={(e) => setSearch(e.target.value)} className="rounded border border-zinc-200 px-3 py-2 text-sm" placeholder="Search saved jobs" />
      </Card>
      {saved.length === 0 ? <Card><p className="text-zinc-500">No saved jobs yet.</p></Card> : (
        <div className="grid gap-4 lg:grid-cols-2">
          {saved.map((item) => {
            const job: Job = {
              id: String(item.id),
              title: String(item.title),
              company: String(item.company),
              location: String(item.location),
              salaryMin: Number(item.salary_min ?? 0),
              salaryMax: Number(item.salary_max ?? 0),
              currency: String(item.currency ?? 'PHP'),
              type: 'Full-time',
              snippet: String(item.job_type ?? ''),
            };
            return <JobCard key={job.id} job={job} isSaved onToggleSave={() => { void jobseekerService.removeSavedJob(job.id).then(load); }} applyLabel='View' />;
          })}
        </div>
      )}
    </div>
  );
};
