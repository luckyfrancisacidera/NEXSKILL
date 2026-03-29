import { useState } from "react";

import { SavedJobsEmptyState, SearchField } from "@features/jobseeker/components";
import { useSavedJobs } from "@features/jobseeker/hooks";
import { jobseekerService } from "@features/jobseeker/service/jobseeker.service";
import { Card } from "@shared/components/Card";
import { JobCard } from "@shared/components/JobCard";
import { JobListSkeleton } from "@shared/components/skeletons/JobListSkeleton";
import type { Job } from "@shared/types";

export const SavedJobsPage = () => {
  const [search, setSearch] = useState("");
  const { isLoading, load, saved } = useSavedJobs(search);

  return (
    <div className="space-y-6">
      <Card className="bg-white dark:border-zinc-800 dark:bg-zinc-950">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="space-y-1">
            <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100 sm:text-2xl">Saved Jobs</h2>
            <p className="text-sm text-zinc-500 dark:text-zinc-400">
              Revisit bookmarked roles and jump back into applications quickly.
            </p>
          </div>
          <SearchField
            ariaLabel="Search saved jobs"
            className="h-10 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 shadow-sm outline-none transition placeholder:text-zinc-500 hover:border-zinc-400 focus:border-zinc-500 focus:ring-2 focus:ring-zinc-200 md:max-w-xs dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 dark:placeholder:text-zinc-500 dark:hover:border-zinc-600 dark:focus:border-zinc-500 dark:focus:ring-zinc-800"
            placeholder="Search saved jobs"
            value={search}
            onChange={setSearch}
          />
        </div>
      </Card>

      {isLoading ? (
        <JobListSkeleton />
      ) : saved.length === 0 ? (
        <SavedJobsEmptyState />
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {saved.map((item) => {
            const job: Job = {
              id: String(item.id),
              title: String(item.title),
              company: String(item.company),
              location: String(item.location),
              salaryMin: Number(item.salary_min ?? 0),
              salaryMax: Number(item.salary_max ?? 0),
              currency: String(item.currency ?? "PHP"),
              type: String(item.job_type ?? "Full-time") as Job["type"],
              snippet: String(item.description ?? "").trim(),
            };

            return (
              <JobCard
                key={job.id}
                job={job}
                isSaved
                applyLabel="View"
                onToggleSave={(jobId, nextSavedState) =>
                  nextSavedState
                    ? jobseekerService.saveJob(jobId)
                    : jobseekerService.removeSavedJob(jobId).then(load)
                }
              />
            );
          })}
        </div>
      )}
    </div>
  );
};
