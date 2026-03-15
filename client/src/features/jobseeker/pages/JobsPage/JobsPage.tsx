import { Link, useLoaderData, useSearchParams } from "react-router-dom";
import { Card } from "@shared/components/Card";
import { JobCard } from "@shared/components/JobCard";
import type { Job, JobType } from "@shared/types";
import { SearchField } from "@features/jobseeker/components";
import { jobseekerService } from "@features/jobseeker/service/jobseeker.service";
import type { JobsLoaderData } from "@features/jobseeker/types";

const toJobType = (employmentType?: string): JobType => {
  if (!employmentType) return "Contract";
  if (employmentType.toLowerCase().includes("part")) return "Part-time";
  if (employmentType.toLowerCase().includes("contract")) return "Contract";
  if (employmentType.toLowerCase().includes("remote")) return "Remote";
  return "Full-time";
};

export const JobsPage = () => {
  const data = useLoaderData() as JobsLoaderData;
  const [params] = useSearchParams();

  return (
    <div className="space-y-6">
      <Card>
        <form className="flex items-center justify-between gap-2">
          <h2 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-100">Find Jobs</h2>
          <SearchField
            ariaLabel="Filter jobs"
            className="h-11 w-full max-w-xs rounded-xl border border-zinc-300 bg-white px-3.5 text-sm text-zinc-700 shadow-sm outline-none transition placeholder:text-zinc-400 hover:border-zinc-400 focus:border-violet-500 focus:ring-4 focus:ring-violet-100 dark:bg-zinc-800 dark:border-zinc-600 dark:text-zinc-100 dark:placeholder:text-zinc-500 dark:hover:border-zinc-500 dark:focus:ring-violet-900"
            defaultValue={params.get("search") ?? ""}
            placeholder="Search"
          />
        </form>
      </Card>
      <div className="grid gap-4 lg:grid-cols-2">
        {data.items.map((job) => {
          const cardJob: Job = {
            id: job.id,
            title: job.title,
            company: job.company_name ?? "Company",
            salaryMin: job.salary_min_per_annum ?? 0,
            salaryMax: job.salary_max_per_annum ?? 0,
            currency: job.currency,
            location: job.location,
            type: toJobType(job.employment_type),
            snippet: job.description,
          };

          return (
            <JobCard
              key={job.id}
              job={cardJob}
              onToggleSave={(jobId, nextSavedState) =>
                nextSavedState
                  ? jobseekerService.saveJob(jobId)
                  : jobseekerService.removeSavedJob(jobId)
              }
            />
          );
        })}
      </div>
      <div className="flex items-center justify-between">
        <span className="text-sm text-zinc-600 dark:text-zinc-400">
          Page {data.pageNumber} of {data.totalPages}
        </span>
        <div className="flex gap-2">
          <Link
            to={`/jobs?page=${Math.max(1, data.pageNumber - 1)}&pageSize=${data.pageSize}&search=${params.get("search") ?? ""}`}
            className="rounded border border-zinc-300 px-3 py-1 text-zinc-700 transition hover:bg-zinc-100 dark:border-zinc-600 dark:text-zinc-300 dark:hover:bg-zinc-800"
          >
            Prev
          </Link>
          <Link
            to={`/jobs?page=${Math.min(data.totalPages, data.pageNumber + 1)}&pageSize=${data.pageSize}&search=${params.get("search") ?? ""}`}
            className="rounded border border-zinc-300 px-3 py-1 text-zinc-700 transition hover:bg-zinc-100 dark:border-zinc-600 dark:text-zinc-300 dark:hover:bg-zinc-800"
          >
            Next
          </Link>
        </div>
      </div>
    </div>
  );
};
