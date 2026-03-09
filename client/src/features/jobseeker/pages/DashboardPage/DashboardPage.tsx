import { Link, useLoaderData } from "react-router-dom";
import {
  BarChart3,
  Bookmark,
  Briefcase,
  Search,
} from "lucide-react";
import { Card } from "@shared/components/Card";
import { DashboardAreaChart } from "@shared/components/DashboardAreaChart";
import Dropdown, { type DropdownOption } from "@shared/components/Dropdown";
import { JobCard } from "@shared/components/JobCard";
import { Progress } from "@shared/components/Progress";
import type { Job } from "@shared/types";
import { jobseekerService } from "@features/jobseeker/service/jobseeker.service";
import { useDashboardData } from "@features/jobseeker/hooks";
import type { DashboardLoaderData } from "@features/jobseeker/types";

const ranges: DropdownOption[] = [
  { label: "This Week", value: "this_week" },
  { label: "Last Week", value: "last_week" },
  { label: "This Month", value: "this_month" },
  { label: "Last Month", value: "last_month" },
  { label: "This Year", value: "this_year" },
  { label: "Last Year", value: "last_year" },
];

export const DashboardPage = () => {
  const initialData = useLoaderData() as DashboardLoaderData;
  const { data, range, updateRange } = useDashboardData(initialData);

  const totalApplications = Object.values(data.status).reduce(
    (sum, value) => sum + Number(value),
    0,
  );

  return (
    <div className="space-y-6">
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="flex items-center justify-between p-5">
          <div>
            <p className="text-sm text-zinc-500">Total Applications</p>
            <h3 className="text-3xl font-bold text-zinc-900">
              {totalApplications}
            </h3>
            <p className="mt-1 text-xs text-zinc-400">
              All application statuses
            </p>
          </div>

          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-indigo-100">
            <Briefcase className="h-6 w-6 text-indigo-600" />
          </div>
        </Card>

        {Object.entries(data.status).map(([label, value]) => (
          <Card key={label} className="flex items-center justify-between p-5">
            <div>
              <p className="text-sm capitalize text-zinc-500">{label}</p>
              <h3 className="text-3xl font-bold text-zinc-900">{value}</h3>
              <div className="mt-2">
                <Progress value={Math.min(100, Number(value) * 15)} />
              </div>
            </div>

            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-zinc-100">
              <BarChart3 className="h-6 w-6 text-zinc-600" />
            </div>
          </Card>
        ))}
      </div>

      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-zinc-900">Saved Jobs</h2>
          <span className="text-sm text-zinc-500">
            {data.saved_jobs.length} jobs
          </span>
        </div>

        {data.saved_jobs.length === 0 ? (
          <Card className="flex flex-col items-center justify-center py-12 text-center">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-zinc-100">
              <Bookmark className="h-7 w-7 text-zinc-500" />
            </div>

            <h3 className="text-lg font-semibold text-zinc-900">
              No saved jobs yet
            </h3>

            <p className="mb-4 mt-1 text-sm text-zinc-500">
              Start exploring jobs and save the ones you're interested in.
            </p>

            <Link
              to="/jobs"
              className="flex items-center gap-2 rounded-lg bg-zinc-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-zinc-700"
            >
              <Search className="h-4 w-4" />
              Find Jobs
            </Link>
          </Card>
        ) : (
          <div className="grid gap-4 lg:grid-cols-2">
            {data.saved_jobs.map((item) => {
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
                  onToggleSave={(jobId, nextSavedState) =>
                    nextSavedState
                      ? jobseekerService.saveJob(jobId)
                      : jobseekerService
                          .removeSavedJob(jobId)
                          .then(() => updateRange(range))
                  }
                />
              );
            })}
          </div>
        )}
      </section>

      <div className="grid gap-6 xl:grid-cols-[2fr_1fr]">
        <Card className="h-80 p-6">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-zinc-900">
                Application Analytics
              </h3>

              <p className="text-sm text-zinc-500">
                Track your job applications
              </p>
            </div>

            <Dropdown
              label=""
              name="range"
              value={range}
              options={ranges}
              className="min-w-44"
              buttonClassName="h-10"
              onChange={(event) => {
                void updateRange(event.target.value);
              }}
            />
          </div>

          <div className="h-[85%]">
            <DashboardAreaChart
              labels={data.analytics.labels}
              datasets={[
                {
                  label: "Applications",
                  data: data.analytics.counts,
                  border_color: "#696cff",
                  background_color: "rgba(105,108,255,0.18)",
                },
              ]}
            />
          </div>
        </Card>

        <Card className="space-y-4 p-6">
          <h3 className="text-lg font-semibold text-zinc-900">
            Recent Applications
          </h3>

          <ul className="space-y-3">
            {data.recent_applications.map((item) => (
              <li
                key={String(item.id)}
                className="rounded-lg border border-zinc-200 p-3 transition hover:bg-zinc-50"
              >
                <p className="font-semibold text-zinc-900">
                  {String(item.job_title)}
                </p>

                <p className="text-sm text-zinc-500">
                  {String(item.company)} •{" "}
                  {new Date(String(item.applied_at)).toLocaleDateString()}
                </p>

                <span className="mt-2 inline-block rounded bg-indigo-100 px-2 py-1 text-xs font-medium text-indigo-600">
                  {String(item.status)}
                </span>
              </li>
            ))}
          </ul>
        </Card>
      </div>
    </div>
  );
};
