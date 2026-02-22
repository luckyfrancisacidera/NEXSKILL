import { useLoaderData } from 'react-router-dom';
import { Card } from '@shared/components/Card';
import { jobs } from '@features/jobseeker/data';
import { readStorage } from '@shared/utils/storage';
import type { ApplicationRecord } from '@shared/types';

const APPLIED_KEY = 'nexskill.appliedJobs';

// eslint-disable-next-line react-refresh/only-export-components
export const applicationsLoader = async () => {
  const applied = readStorage<ApplicationRecord[]>(APPLIED_KEY, []);
  return {
    applications: applied.map((entry) => ({
      ...entry,
      job: jobs.find((job) => job.id === entry.jobId),
    })),
  };
};

export const ApplicationsPage = () => {
  const data = useLoaderData() as Awaited<ReturnType<typeof applicationsLoader>>;
  return (
    <Card>
      <h2 className="mb-4 text-2xl font-semibold">Applications</h2>
      {data.applications.length === 0 ? (
        <p className="text-zinc-500">No applications yet. Apply to a role from Find Jobs.</p>
      ) : (
        <ul className="space-y-3">
          {data.applications.map((item) => (
            <li key={item.jobId} className="rounded-lg border border-zinc-200 p-3">
              <p className="font-medium text-zinc-900">{item.job?.title ?? 'Unknown role'}</p>
              <p className="text-sm text-zinc-500">{item.job?.company} · {item.status}</p>
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
};
