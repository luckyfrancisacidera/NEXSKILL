/* eslint-disable react-refresh/only-export-components */
import { Form, useLoaderData, type ActionFunctionArgs } from 'react-router-dom';
import { jobs } from '@features/jobseeker/data';
import { JobCard } from '@shared/components/JobCard';
import { Card } from '@shared/components/Card';
import type { ApplicationRecord } from '@shared/types';
import { readStorage, writeStorage } from '@shared/utils/storage';

const APPLIED_KEY = 'nexskill.appliedJobs';

export const jobsLoader = async () => ({ jobs });

export const applyToJobAction = async ({ request }: ActionFunctionArgs) => {
  const formData = await request.formData();
  const jobId = String(formData.get('jobId') ?? '');
  if (!jobId) return null;

  const applied = readStorage<ApplicationRecord[]>(APPLIED_KEY, []);
  if (!applied.some((entry) => entry.jobId === jobId)) {
    writeStorage(APPLIED_KEY, [{ jobId, appliedAt: new Date().toISOString(), status: 'Applied' }, ...applied]);
  }

  return { ok: true };
};

export const JobsPage = () => {
  const data = useLoaderData() as Awaited<ReturnType<typeof jobsLoader>>;

  return (
    <div className="space-y-6">
      <Card>
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-semibold text-zinc-900">Find Jobs</h2>
          <Form>
            <input
              className="rounded-lg border border-zinc-200 px-3 py-2 text-sm"
              placeholder="Filter by keyword"
              aria-label="Filter jobs"
            />
          </Form>
        </div>
      </Card>
      <div className="grid gap-4 lg:grid-cols-2">
        {data.jobs.map((job) => (
          <JobCard key={job.id} job={job} />
        ))}
      </div>
    </div>
  );
};
