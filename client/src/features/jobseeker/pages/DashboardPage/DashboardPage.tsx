import { Link, useLoaderData } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import {
  ArrowUpRight,
  BarChart3,
  Bookmark,
  BookmarkCheck,
  Briefcase,
  CalendarClock,
  FileClock,
  Sparkles,
  MapPin,
  Building2,
} from "lucide-react";

import { DashboardAreaChart } from "@shared/components/DashboardAreaChart";
import { DashboardGreeting } from "@shared/components/DashboardGreeting";
import { useAuth } from "@app/providers/AuthProvider";
import { SavedJobsEmptyState } from "@features/jobseeker/components";
import {
  DashboardEmptyState,
  DashboardListLink,
  DashboardSectionCard,
  DashboardStatCard,
} from "@shared/components/DashboardPrimitives";
import Dropdown, { type DropdownOption } from "@shared/components/Dropdown";
import { interviewStatusChipClassName } from "@shared/utils/interviewStatus";
import { jobseekerService } from "@features/jobseeker/service/jobseeker.service";
import { jobseekerInterviewService } from "@features/jobseeker/services/interview.service";
import { useDashboardData } from "@features/jobseeker/hooks";
import type { DashboardLoaderData, JobseekerInterview } from "@features/jobseeker/types";

const ranges: DropdownOption[] = [
  { label: "This Week", value: "this_week" },
  { label: "Last Week", value: "last_week" },
  { label: "This Month", value: "this_month" },
  { label: "Last Month", value: "last_month" },
  { label: "This Year", value: "this_year" },
  { label: "Last Year", value: "last_year" },
];

export const DashboardPage = () => {
  const { user } = useAuth();
  const initialData = useLoaderData() as DashboardLoaderData;
  const { data, range, updateRange } = useDashboardData(initialData);
  const [interviews, setInterviews] = useState<JobseekerInterview[]>([]);
  const [isLoadingInterviews, setIsLoadingInterviews] = useState(true);

  const firstName = user?.firstName?.trim() || "there";

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

  const hasAnalytics = data.analytics.labels.length > 0 && data.analytics.counts.length > 0;
  const hasSavedJobs = data.saved_jobs.length > 0;
  const hasRecentApplications = data.recent_applications.length > 0;

  return (
    <div className="space-y-6">
      <DashboardGreeting
        badge="Job search pulse"
        title={(
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-zinc-400" />
            <span>Hi, {firstName} ! </span>
          </div>
        )}
        subtitle="Here’s what’s happening with your job search today — track applications, interviews, and new opportunities."
        stats={[
          { label: "Applications", value: totalApplications },
          { label: "Upcoming interviews", value: upcomingInterviews.length },
        ]}
      />

      <section className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <DashboardStatCard
          label="Total Applications"
          value={totalApplications}
          helper="All application stages in your pipeline"
          icon={Briefcase}
          iconClassName="bg-indigo-100 text-indigo-600 dark:bg-indigo-950/60 dark:text-indigo-300"
        />
        <DashboardStatCard
          label="Applied"
          value={data.status.applied}
          helper="Fresh submissions waiting for updates"
          icon={FileClock}
          iconClassName="bg-sky-100 text-sky-600 dark:bg-sky-950/60 dark:text-sky-300"
        />
        <DashboardStatCard
          label="Interviews"
          value={data.status.interview}
          helper="Active interview conversations"
          icon={CalendarClock}
          iconClassName="bg-violet-100 text-violet-600 dark:bg-violet-950/60 dark:text-violet-300"
        />
        <DashboardStatCard
          label="Offers"
          value={data.status.offer}
          helper="Offer-stage applications so far"
          icon={Sparkles}
          iconClassName="bg-emerald-100 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-300"
        />
      </section>

      <section className="grid gap-6 xl:grid-cols-[minmax(0,1.8fr)_minmax(320px,1fr)]">
        <DashboardSectionCard
          title="Application Analytics"
          description="Track your applications over time with a compact timeline view."
          action={
            <div className="min-w-44">
              <Dropdown
                label=""
                name="range"
                value={range}
                options={ranges}
                className="min-w-44"
                buttonClassName="h-10 rounded-xl"
                onChange={(event) => {
                  void updateRange(event.target.value);
                }}
              />
            </div>
          }
          contentClassName="h-[360px] p-6"
        >
          {hasAnalytics ? (
            <DashboardAreaChart
              labels={data.analytics.labels}
              datasets={[
                {
                  label: "Applications",
                  data: data.analytics.counts,
                  border_color: "#6366f1",
                  background_color: "rgba(99,102,241,0.18)",
                },
              ]}
            />
          ) : (
            <DashboardEmptyState
              compact
              icon={BarChart3}
              title="No application activity yet"
              description="Application analytics will appear here once you start applying for roles."
            />
          )}
        </DashboardSectionCard>

        <DashboardSectionCard
          title="Upcoming Interviews"
          description="Your nearest interview schedule and next actions."
          action={<DashboardListLink to="/jobseeker/interviews">View all</DashboardListLink>}
        >
          {isLoadingInterviews ? (
            <div className="space-y-3">
              <div className="h-24 animate-pulse rounded-2xl bg-zinc-100 dark:bg-zinc-800" />
              <div className="h-24 animate-pulse rounded-2xl bg-zinc-100 dark:bg-zinc-800" />
            </div>
          ) : upcomingInterviews.length === 0 ? (
            <DashboardEmptyState
              compact
              icon={CalendarClock}
              title="No interview activity yet"
              description="Future active interviews will appear here as soon as recruiters schedule them."
            />
          ) : (
            <div className="space-y-3">
              {upcomingInterviews.map((interview) => {
                const scheduledAt = new Date(interview.scheduledDate);

                return (
                  <div
                    key={interview.id}
                    className="rounded-2xl border border-zinc-200 bg-zinc-50/70 p-4 transition hover:border-zinc-300 hover:bg-white dark:border-zinc-800 dark:bg-zinc-900/60 dark:hover:border-zinc-700 dark:hover:bg-zinc-900"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-zinc-400 dark:text-zinc-500">
                          Upcoming interview
                        </p>
                        <h3 className="mt-1 text-base font-semibold text-zinc-950 dark:text-zinc-100">
                          {interview.jobTitle || "Interview"}
                        </h3>
                        <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
                          {interview.companyName || interview.recruiterName || "Company"}
                        </p>
                      </div>
                      <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide ${interviewStatusChipClassName[interview.status]}`}>
                        {interview.status}
                      </span>
                    </div>

                    <div className="mt-4 space-y-1 text-sm text-zinc-600 dark:text-zinc-400">
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
                  </div>
                );
              })}
            </div>
          )}
        </DashboardSectionCard>
      </section>

      <section className="grid gap-6 xl:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)]">
        <DashboardSectionCard
          title="Saved Jobs"
          description="Compact preview of the roles you bookmarked."
          action={
            <div className="flex items-center gap-3">
              <span className="inline-flex min-h-7 min-w-7 items-center justify-center rounded-full border border-zinc-200 bg-zinc-100 px-2.5 text-xs font-semibold text-zinc-600 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-300">
                {data.saved_jobs.length}
              </span>
              <DashboardListLink to="/saved">View all</DashboardListLink>
            </div>
          }
          className="overflow-hidden"
          contentClassName="p-0"
        >
          {hasSavedJobs ? (
            <div className="max-h-[420px] overflow-y-auto px-4 py-4 [scrollbar-gutter:stable]">
              <div className="space-y-2.5 pr-1">
                {data.saved_jobs.map((item) => (
                  <div
                    key={String(item.id)}
                    className="rounded-2xl border border-zinc-200 bg-zinc-50/80 p-3.5 transition hover:border-zinc-300 hover:bg-white dark:border-zinc-800 dark:bg-zinc-900/70 dark:hover:border-zinc-700 dark:hover:bg-zinc-900"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl border border-zinc-200 bg-white text-zinc-500 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-300">
                            <BookmarkCheck className="h-4 w-4" />
                          </span>
                          <div className="min-w-0">
                            <Link
                              to={`/jobs/${String(item.id)}`}
                              className="block truncate text-sm font-semibold text-zinc-950 transition hover:text-zinc-700 dark:text-zinc-100 dark:hover:text-zinc-300"
                              title={String(item.title)}
                            >
                              {String(item.title)}
                            </Link>
                            <div className="mt-0.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-zinc-500 dark:text-zinc-400">
                              <span className="inline-flex min-w-0 items-center gap-1 truncate">
                                <Building2 className="h-3.5 w-3.5 shrink-0" />
                                <span className="truncate">{String(item.company)}</span>
                              </span>
                              <span className="inline-flex min-w-0 items-center gap-1 truncate">
                                <MapPin className="h-3.5 w-3.5 shrink-0" />
                                <span className="truncate">{String(item.location)}</span>
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="mt-3 flex flex-wrap items-center gap-2">
                          <span className="rounded-full border border-zinc-200 bg-white px-2.5 py-1 text-[11px] font-medium text-zinc-600 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-300">
                            {String(item.job_type ?? "Saved role")}
                          </span>
                        </div>
                      </div>

                      <div className="flex shrink-0 items-center gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            void jobseekerService.removeSavedJob(String(item.id)).then(() => updateRange(range));
                          }}
                          className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-zinc-200 bg-white text-zinc-500 transition hover:border-zinc-300 hover:text-zinc-800 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-400 dark:hover:border-zinc-600 dark:hover:text-zinc-100"
                          aria-label={`Remove ${String(item.title)} from saved jobs`}
                          title="Remove saved job"
                        >
                          <Bookmark className="h-4 w-4" />
                        </button>
                        <Link
                          to={`/jobs/${String(item.id)}`}
                          className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-zinc-200 bg-white text-zinc-500 transition hover:border-zinc-300 hover:text-zinc-800 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-400 dark:hover:border-zinc-600 dark:hover:text-zinc-100"
                          aria-label={`Open ${String(item.title)}`}
                          title="View job"
                        >
                          <ArrowUpRight className="h-4 w-4" />
                        </Link>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="p-4">
              <SavedJobsEmptyState
                compact
                title="No saved jobs"
                description="Saved posts will appear here."
                className="min-h-0"
              />
            </div>
          )}
        </DashboardSectionCard>

        <DashboardSectionCard title="Recent Applications" description="Your latest job activity in one place.">
          {hasRecentApplications ? (
            <div className="space-y-3">
              {data.recent_applications.slice(0, 5).map((item) => (
                <div
                  key={String(item.id)}
                  className="rounded-2xl border border-zinc-200 bg-zinc-50/70 p-4 transition hover:border-zinc-300 hover:bg-white dark:border-zinc-800 dark:bg-zinc-900/60 dark:hover:border-zinc-700 dark:hover:bg-zinc-900"
                >
                  <p className="font-semibold text-zinc-950 dark:text-zinc-100">
                    {String(item.job_title)}
                  </p>
                  <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
                    {String(item.company)} •{" "}
                    {new Date(String(item.applied_at)).toLocaleDateString()}
                  </p>
                  <span className="mt-3 inline-flex rounded-full bg-indigo-100 px-2.5 py-1 text-xs font-semibold text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300">
                    {String(item.status)}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <DashboardEmptyState
              compact
              icon={Briefcase}
              title="No recent applications yet"
              description="Once you apply for jobs, your latest submissions will appear here."
            />
          )}
        </DashboardSectionCard>
      </section>
    </div>
  );
};
