import { Card } from '@shared/components/Card';
import { jobs } from '@features/jobseeker/data';
import { readStorage } from '@shared/utils/storage';

const SAVED_KEY = 'nexskill.savedJobs';

export const SavedJobsPage = () => {
  const savedJobs = readStorage<string[]>(SAVED_KEY, []);
  const saved = jobs.filter((job) => savedJobs.includes(job.id));

  return (
    <Card>
      <h2 className="mb-4 text-2xl font-semibold">Saved Jobs</h2>
      {saved.length ? (
        <ul className="space-y-2">
          {saved.map((job) => (
            <li key={job.id} className="rounded-lg border border-zinc-200 p-3 text-zinc-700">{job.title} · {job.company}</li>
          ))}
        </ul>
      ) : (
        <p className="text-zinc-500">No saved jobs yet.</p>
      )}
    </Card>
  );
};
