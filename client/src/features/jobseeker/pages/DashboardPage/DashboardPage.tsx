import { Link, useLoaderData } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import {
  BarChart3,
  Bookmark,
  Briefcase,
  CalendarClock,
  Search,
} from "lucide-react";
import { Card } from "@shared/components/Card";
import { DashboardAreaChart } from "@shared/components/DashboardAreaChart";
import Dropdown, { type DropdownOption } from "@shared/components/Dropdown";
import { JobCard } from "@shared/components/JobCard";
import { Progress } from "@shared/components/Progress";
import type { Job } from "@shared/types";
import { jobseekerService } from "@features/jobseeker/service/jobseeker.service";
import { jobseekerInterviewService } from "@features/jobseeker/services/interview.service";
import { useDashboardData } from "@features/jobseeker/hooks";
import type { DashboardLoaderData, JobseekerInterview } from "@features/jobseeker/types";
import { interviewStatusChipClassName } from "@shared/utils/interviewStatus";

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
  const [interviews, setInterviews] = useState<JobseekerInterview[]>([]);
  const [isLoadingInterviews, setIsLoadingInterviews] = useState(true);

  const totalApplications = Object.values(data.status).reduce(
    (sum, value) => sum + Number(value),
    0,
  );

  useEffect(() => {
    let cancelled = false;

    const loadUpcomingInterviews = async () => {
      try {
        setIsLoadingInterviews(true);
        const result = await jobseekerInterviewService.getJobseekerInterviews();
        if (!cancelled) {
          setInterviews(result);
        }
      } finally {
        if (!cancelled) {
          setIsLoadingInterviews(false);
        }
      }
    };

    void loadUpcomingInterviews();

    return () => {
      cancelled = true;
    };
  }, []);

  const upcomingInterviews = useMemo(() => {
    const now = Date.now();
    return interviews
      .filter((interview) => {
        const scheduledAt = new Date(interview.scheduledDate).getTime();
        return (
          !interview.isArchived &&
          scheduledAt > now &&
          interview.status !== "Declined" &&
          interview.status !== "Cancelled"
        );
      })
      .sort(
        (left, right) =>
          new Date(left.scheduledDate).getTime() -
          new Date(right.scheduledDate).getTime(),
      )
      .slice(0, 4);
  }, [interviews]);

  return (
    <div className="space-y-6">
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="flex items-center justify-between p-5">
          <div>
            <p className="text-sm text-zinc-500 dark:text-zinc-400">Total Applications</p>
            <h3 className="text-3xl font-bold text-zinc-900 dark:text-zinc-100">
              {totalApplications}
            </h3>
            <p className="mt-1 text-xs text-zinc-400 dark:text-zinc-500">
              All application statuses
            </p>
          </div>

          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-indigo-100 dark:bg-indigo-900/30">
            <Briefcase className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
          </div>
        </Card>

        {Object.entries(data.status).map(([label, value]) => (
          <Card key={label} className="flex items-center justify-between p-5">
            <div>
              <p className="text-sm capitalize text-zinc-500 dark:text-zinc-400">{label}</p>
              <h3 className="text-3xl font-bold text-zinc-900 dark:text-zinc-100">{value}</h3>
              <div className="mt-2">
                <Progress value={Math.min(100, Number(value) * 15)} />
              </div>
            </div>

            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-zinc-100 dark:bg-zinc-800">
              <BarChart3 className="h-6 w-6 text-zinc-600 dark:text-zinc-400" />
            </div>
          </Card>
        ))}
      </div>

      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100">
            Upcoming Interviews
          </h2>
          <Link
            to="/jobseeker/interviews"
            className="text-sm font-medium text-zinc-600 transition hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-200"
          >
            View all
          </Link>
        </div>

        {isLoadingInterviews ? (
          <Card className="grid gap-3 lg:grid-cols-2">
            <div className="h-24 animate-pulse rounded-xl bg-zinc-100 dark:bg-zinc-800" />
            <div className="h-24 animate-pulse rounded-xl bg-zinc-100 dark:bg-zinc-800" />
          </Card>
        ) : upcomingInterviews.length === 0 ? (
          <Card className="flex flex-col items-center justify-center py-10 text-center">
            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-zinc-100 dark:bg-zinc-800">
              <CalendarClock className="h-6 w-6 text-zinc-500 dark:text-zinc-400" />
            </div>
            <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
              No upcoming interviews
            </h3>
            <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
              Future active interviews will appear here as soon as recruiters schedule them.
            </p>
          </Card>
        ) : (
          <div className="grid gap-4 lg:grid-cols-2">
            {upcomingInterviews.map((interview) => {
              const scheduledAt = new Date(interview.scheduledDate);

              return (
                <Card key={interview.id} className="space-y-3 p-5">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-xs uppercase tracking-wide text-zinc-400 dark:text-zinc-500">
                        Upcoming interview
                      </p>
                      <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
                        {interview.jobTitle || "Interview"}
                      </h3>
                      <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
                        {interview.companyName || interview.recruiterName || "Company"}
                      </p>
                    </div>
                    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${interviewStatusChipClassName[interview.status]}`}>
                      {interview.status}
                    </span>
                  </div>

                  <div className="space-y-1 text-sm text-zinc-600 dark:text-zinc-400">
                    <p>
                      {scheduledAt.toLocaleDateString(undefined, {
                        weekday: "short",
                        month: "short",
                        day: "numeric",
                      })}{" "}
                      at{" "}
                      {scheduledAt.toLocaleTimeString(undefined, {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                    <p>Type: {interview.meetingLink ? "Virtual" : "Onsite"}</p>
                    {interview.meetingLink ? (
                      <a
                        href={interview.meetingLink}
                        target="_blank"
                        rel="noreferrer"
                        className="font-medium text-violet-600 transition hover:text-violet-700 dark:text-violet-400 dark:hover:text-violet-300"
                      >
                        Open meeting link
                      </a>
                    ) : interview.location ? (
                      <p>Location: {interview.location}</p>
                    ) : null}
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </section>

      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100">Saved Jobs</h2>
          <span className="text-sm text-zinc-500 dark:text-zinc-400">
            {data.saved_jobs.length} jobs
          </span>
        </div>

        {data.saved_jobs.length === 0 ? (
          <Card className="flex flex-col items-center justify-center py-12 text-center">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-zinc-100 dark:bg-zinc-800">
              <Bookmark className="h-7 w-7 text-zinc-500 dark:text-zinc-400" />
            </div>

            <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
              No saved jobs yet
            </h3>

            <p className="mb-4 mt-1 text-sm text-zinc-500 dark:text-zinc-400">
              Start exploring jobs and save the ones you're interested in.
            </p>

            <Link
              to="/jobs"
              className="flex items-center gap-2 rounded-lg bg-zinc-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-zinc-700 dark:bg-zinc-700 dark:hover:bg-zinc-600"
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
              <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
                Application Analytics
              </h3>

              <p className="text-sm text-zinc-500 dark:text-zinc-400">
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
          <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
            Recent Applications
          </h3>

          <ul className="space-y-3">
            {data.recent_applications.map((item) => (
              <li
                key={String(item.id)}
                className="rounded-lg border border-zinc-200 p-3 transition hover:bg-zinc-50 dark:border-zinc-700 dark:hover:bg-zinc-800"
              >
                <p className="font-semibold text-zinc-900 dark:text-zinc-100">
                  {String(item.job_title)}
                </p>

                <p className="text-sm text-zinc-500 dark:text-zinc-400">
                  {String(item.company)} •{" "}
                  {new Date(String(item.applied_at)).toLocaleDateString()}
                </p>

                <span className="mt-2 inline-block rounded bg-indigo-100 px-2 py-1 text-xs font-medium text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400">
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
