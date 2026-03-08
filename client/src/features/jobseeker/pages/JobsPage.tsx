/* eslint-disable react-refresh/only-export-components */
import { Link, useLoaderData, useSearchParams, type LoaderFunctionArgs } from 'react-router-dom';
import { Card } from '@shared/components/Card';
import { JobCard } from '@shared/components/JobCard';
import type { Job, JobType } from '@shared/types';
import { jobseekerService } from '@features/jobseeker/service/jobseeker.service';

export const jobsLoader = async ({ request }: LoaderFunctionArgs) => {
  const url = new URL(request.url);
  const pageNumber = Number(url.searchParams.get('page') ?? '1');
  const pageSize = Number(url.searchParams.get('pageSize') ?? '10');
  const search = url.searchParams.get('search') ?? undefined;
  return jobseekerService.getPublicJobs({ pageNumber, pageSize, search });
};

const toJobType = (employmentType?: string): JobType => {
  if (!employmentType) return 'Contract';
  if (employmentType.toLowerCase().includes('part')) return 'Part-time';
  if (employmentType.toLowerCase().includes('contract')) return 'Contract';
  if (employmentType.toLowerCase().includes('remote')) return 'Remote';
  return 'Full-time';
};

export const JobsPage = () => {
  const data = useLoaderData() as Awaited<ReturnType<typeof jobsLoader>>;
  const [params] = useSearchParams();

  return (
    <div className="space-y-6">
      <Card>
        <form className="flex items-center justify-between gap-2">
          <h2 className="text-2xl font-semibold text-zinc-900">Find Jobs</h2>
          <input name="search" defaultValue={params.get('search') ?? ''} className="h-11 w-full max-w-xs rounded-xl border border-zinc-300 bg-white px-3.5 text-sm text-zinc-700 shadow-sm outline-none transition placeholder:text-zinc-400 hover:border-zinc-400 focus:border-violet-500 focus:ring-4 focus:ring-violet-100" placeholder="Search" aria-label="Filter jobs" />
        </form>
      </Card>
      <div className="grid gap-4 lg:grid-cols-2">
        {data.items.map((job) => {
          const cardJob: Job = {
            id: job.id,
            title: job.title,
            company: job.company_name ?? 'Company',
            salaryMin: job.salary_min_per_annum ?? 0,
            salaryMax: job.salary_max_per_annum ?? 0,
            currency : job.currency,
            location: job.location,
            type: toJobType(job.employment_type),
            snippet: job.description,
          };

          return <JobCard key={job.id} job={cardJob} onToggleSave={(jobId, nextSavedState) => (nextSavedState ? jobseekerService.saveJob(jobId) : jobseekerService.removeSavedJob(jobId))} />;
        })}
      </div>
      <div className="flex items-center justify-between">
        <span className="text-sm">Page {data.pageNumber} of {data.totalPages}</span>
        <div className="flex gap-2">
          <Link to={`/jobs?page=${Math.max(1, data.pageNumber - 1)}&pageSize=${data.pageSize}&search=${params.get('search') ?? ''}`} className="rounded border border-zinc-300 px-3 py-1">Prev</Link>
          <Link to={`/jobs?page=${Math.min(data.totalPages, data.pageNumber + 1)}&pageSize=${data.pageSize}&search=${params.get('search') ?? ''}`} className="rounded border border-zinc-300 px-3 py-1">Next</Link>
        </div>
      </div>
    </div>
  );
};