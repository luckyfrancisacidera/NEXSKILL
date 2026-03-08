/* eslint-disable react-refresh/only-export-components */
import { useState } from "react";
import { useLoaderData } from "react-router-dom";
import { DashboardAreaChart } from "@shared/components/DashboardAreaChart";
import { Card } from "@shared/components/Card";
import { JobCard } from "@shared/components/JobCard";
import { Progress } from "@shared/components/Progress";
import type { Job } from "@shared/types";
import { jobseekerService } from "@features/jobseeker/service/jobseeker.service";

const ranges = [
  { label: 'This Week', value: 'this_week' },
  { label: 'Last Week', value: 'last_week' },
  { label: 'This Month', value: 'this_month' },
  { label: 'Last Month', value: 'last_month' },
  { label: 'This Year', value: 'this_year' },
  { label: 'Last Year', value: 'last_year' },
];

export const dashboardLoader = async () => jobseekerService.getDashboard('this_week');

export const DashboardPage = () => {
  const initial = useLoaderData() as Awaited<ReturnType<typeof dashboardLoader>>;
  const [data, setData] = useState(initial);
  const [range, setRange] = useState('this_week');

  const updateRange = async (value: string) => {
    setRange(value);
    setData(await jobseekerService.getDashboard(value));
  };

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-3">
        {Object.entries(data.status).map(([label, value]) => (
          <Card key={label} className="space-y-2 bg-zinc-900 text-zinc-600">
            <p className="text-sm capitalize text-zinc-900">{label}</p>
            <p className="text-3xl font-semibold">{value}</p>
            <Progress value={Math.min(100, Number(value) * 15)} />
          </Card>
        ))}
      </div>

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold text-zinc-900">Saved Jobs</h2>
        <div className="grid gap-4 lg:grid-cols-2">
          {data.saved_jobs.map((item) => {
            const job: Job = {
              id: String(item.id), title: String(item.title), company: String(item.company), location: String(item.location),
              salaryMin: Number(item.salary_min ?? 0), salaryMax: Number(item.salary_max ?? 0), currency: String(item.currency ?? 'PHP'), type: 'Full-time', snippet: String(item.job_type ?? '')
            };
            return <JobCard key={job.id} job={job} isSaved onToggleSave={() => { void jobseekerService.removeSavedJob(job.id).then(() => updateRange(range)); }} />;
          })}
        </div>
      </section>

      <div className="grid gap-6 xl:grid-cols-[2fr_1fr]">
        <Card className="h-80">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
            <h3 className="text-lg font-semibold">Recent Applications</h3>
            <select value={range} onChange={(e) => { void updateRange(e.target.value); }} className="rounded border border-zinc-300 px-2 py-1 text-sm max-w-full">
              {ranges.map((x) => <option key={x.value} value={x.value}>{x.label}</option>)}
            </select>
          </div>
          <div className="h-[85%]">
            <DashboardAreaChart labels={data.analytics.labels} datasets={[{ label: 'Applications', data: data.analytics.counts, border_color: '#18181b', background_color: 'rgba(24,24,27,0.15)' }]} />
          </div>
        </Card>

        <Card className="space-y-3">
          <h3 className="text-lg font-semibold">Recent application list</h3>
          <ul className="space-y-2">
            {data.recent_applications.map((item) => (
              <li key={String(item.id)} className="rounded border border-zinc-200 p-2 text-sm">
                <p className="font-medium">{String(item.job_title)}</p>
                <p className="text-zinc-500">{String(item.company)} • {new Date(String(item.applied_at)).toLocaleDateString()}</p>
                <p className="text-zinc-700">{String(item.status)}</p>
              </li>
            ))}
          </ul>
        </Card>
      </div>
    </div>
  );
};
