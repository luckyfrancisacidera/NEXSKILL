import { useState } from "react";
import { Card } from "@shared/components/Card";
import { JobCard } from "@shared/components/JobCard";
import type { Job } from "@shared/types";
import { SearchField } from "@features/jobseeker/components";
import { useSavedJobs } from "@features/jobseeker/hooks";
import { jobseekerService } from "@features/jobseeker/service/jobseeker.service";

export const SavedJobsPage = () => {
  const [search, setSearch] = useState("");
  const { load, saved } = useSavedJobs(search);

  return (
    <div className="space-y-4">
      <Card className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-100">Saved Jobs</h2>
        <SearchField
          ariaLabel="Search saved jobs"
          className="h-11 w-full rounded-xl border border-zinc-300 bg-white px-3.5 text-sm text-zinc-700 shadow-sm outline-none transition placeholder:text-zinc-400 hover:border-zinc-400 focus:border-violet-500 focus:ring-4 focus:ring-violet-100 md:max-w-xs dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-100 dark:placeholder:text-zinc-500 dark:hover:border-zinc-500 dark:focus:ring-violet-900"
          placeholder="Search saved jobs"
          value={search}
          onChange={setSearch}
        />
      </Card>
      {saved.length === 0 ? (
        <Card>
          <p className="text-zinc-500 dark:text-zinc-400">No saved jobs yet.</p>
        </Card>
      ) : (
        <div className="grid gap-3 lg:grid-cols-2 xl:grid-cols-3">
          {saved.map((item) => {
            const job: Job = {
              id: String(item.id),
              title: String(item.title),
              company: String(item.company),
              location: String(item.location),
              salaryMin: Number(item.salary_min ?? 0),
              salaryMax: Number(item.salary_max ?? 0),
              currency: String(item.currency ?? "PHP"),
              type: "Full-time",
              snippet: String(item.job_type ?? ""),
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
