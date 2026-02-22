/* eslint-disable react-refresh/only-export-components */
import { useLoaderData } from "react-router-dom";
import {
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Bar } from "@shared/vendor/Bar";
import { Card } from "@shared/components/Card";
import { JobCard } from "@shared/components/JobCard";
import { Progress } from "@shared/components/Progress";
import {
  jobs,
  profileChecklist,
  weeklyAnalytics,
} from "@features/jobseeker/data";
import { readStorage } from "@shared/utils/storage";
import type { ApplicationRecord } from "@shared/types";

const APPLIED_KEY = "nexskill.appliedJobs";

export const dashboardLoader = async () => {
  const appliedJobs = readStorage<ApplicationRecord[]>(APPLIED_KEY, []);

  return {
    recommendations: jobs.slice(0, 4),
    status: {
      applied: appliedJobs.length,
      interview: Math.min(3, Math.floor(appliedJobs.length / 2)),
      offer: Math.min(2, Math.floor(appliedJobs.length / 4)),
    },
    profileCompletion: 75,
    profileChecklist,
    analytics: weeklyAnalytics,
  };
};

export const DashboardPage = () => {
  const data = useLoaderData() as Awaited<ReturnType<typeof dashboardLoader>>;
  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-3">
        {Object.entries(data.status).map(([label, value]) => (
          <Card key={label} className="space-y-2 bg-zinc-900 text-zinc-600">
            <p className="text-sm capitalize text-zinc-900">{label}</p>
            <p className="text-3xl font-semibold">{value}</p>
            <Progress value={Math.min(100, value * 15)} />
          </Card>
        ))}
      </div>

      <div className="grid gap-6 xl:grid-cols-[2fr_1fr]">
        <section className="space-y-4">
          <h2 className="text-2xl font-semibold text-zinc-900">
            Recommended Jobs
          </h2>
          <div className="grid gap-4 lg:grid-cols-2">
            {data.recommendations.map((job) => (
              <JobCard key={job.id} job={job} />
            ))}
          </div>
        </section>

        <div className="space-y-4">
          <Card className="space-y-3">
            <h3 className="text-lg font-semibold">Profile completion</h3>
            <p className="text-3xl font-semibold">{data.profileCompletion}%</p>
            <Progress value={data.profileCompletion} />
            <ul className="space-y-1 text-sm text-zinc-500">
              {data.profileChecklist.map((item) => (
                <li key={item}>• {item}</li>
              ))}
            </ul>
          </Card>
          <Card className="h-72">
            <h3 className="mb-4 text-lg font-semibold">
              Applications this week
            </h3>
            <ResponsiveContainer width="100%" height="85%">
              <BarChart
                data={
                  data.analytics as unknown as Array<
                    Record<string, string | number>
                  >
                }
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#e4e4e7" />
                <XAxis dataKey="day" />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Bar
                  dataKey="applications"
                  fill="#18181b"
                  radius={[6, 6, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </div>
      </div>
    </div>
  );
};
