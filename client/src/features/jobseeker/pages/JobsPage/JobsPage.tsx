import { useEffect, useState } from "react";
import { Link, useLoaderData, useSearchParams } from "react-router-dom";
import { Card } from "@shared/components/Card";
import { JobCard } from "@shared/components/JobCard";
import type { Job, JobType } from "@shared/types";
import { SearchField } from "@features/jobseeker/components";
import { jobseekerService } from "@features/jobseeker/service/jobseeker.service";
import type { JobsLoaderData } from "@features/jobseeker/types";
import { stripRichText } from "@shared/utils/richText";

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
  const [savedJobIds, setSavedJobIds] = useState<Set<string>>(
    () => new Set(data.items.filter((job) => job.is_saved).map((job) => String(job.id))),
  );

  useEffect(() => {
    setSavedJobIds(new Set(data.items.filter((job) => job.is_saved).map((job) => String(job.id))));
  }, [data.items]);

  return (
    <div className="space-y-6">
      <Card className="overflow-hidden rounded-[28px] border border-zinc-200 bg-white p-0 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
        <div className="border-b border-zinc-200 bg-[radial-gradient(circle_at_top_right,_rgba(63,63,70,0.16),_transparent_35%),linear-gradient(135deg,#fafafa_0%,#f4f4f5_100%)] px-5 py-6 dark:border-zinc-800 dark:bg-[radial-gradient(circle_at_top_right,_rgba(161,161,170,0.10),_transparent_35%),linear-gradient(135deg,#09090b_0%,#18181b_100%)]">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-100">Find Jobs</h2>
              <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
                Browse open roles with a compact overview, then jump into the details when something fits.
              </p>
            </div>
            <SearchField
              ariaLabel="Filter jobs"
              className="h-11 w-full rounded-xl border border-zinc-300 bg-white px-3.5 text-sm text-zinc-700 shadow-sm outline-none transition placeholder:text-zinc-400 hover:border-zinc-400 focus:border-zinc-500 focus:ring-4 focus:ring-zinc-100 md:max-w-xs dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 dark:placeholder:text-zinc-500 dark:hover:border-zinc-600 dark:focus:ring-zinc-800"
              defaultValue={params.get("search") ?? ""}
              placeholder="Search roles, companies, skills"
            />
          </div>
        </div>
        <div className="px-5 py-3 text-sm text-zinc-500 dark:text-zinc-400">
          {data.totalCount} open roles available
        </div>
      </Card>
      {data.items.length === 0 ? (
        <Card className="rounded-[24px] border border-dashed border-zinc-300 bg-white px-6 py-12 text-center shadow-sm dark:border-zinc-700 dark:bg-zinc-950">
          <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">No matching jobs found</h3>
          <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
            Try a broader search term to see more published roles.
          </p>
        </Card>
      ) : (
        <div className="grid gap-3 lg:grid-cols-2 xl:grid-cols-3">
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
            snippet: stripRichText(job.description),
          };

          return (
            <JobCard
              key={job.id}
              job={cardJob}
              isSaved={savedJobIds.has(String(job.id))}
              onToggleSave={async (jobId, nextSavedState) => {
                setSavedJobIds((current) => {
                  const next = new Set(current);
                  if (nextSavedState) {
                    next.add(String(jobId));
                  } else {
                    next.delete(String(jobId));
                  }
                  return next;
                });

                try {
                  if (nextSavedState) {
                    await jobseekerService.saveJob(jobId);
                  } else {
                    await jobseekerService.removeSavedJob(jobId);
                  }
                } catch (error) {
                  setSavedJobIds((current) => {
                    const next = new Set(current);
                    if (nextSavedState) {
                      next.delete(String(jobId));
                    } else {
                      next.add(String(jobId));
                    }
                    return next;
                  });
                  throw error;
                }
              }}
            />
          );
          })}
        </div>
      )}
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
