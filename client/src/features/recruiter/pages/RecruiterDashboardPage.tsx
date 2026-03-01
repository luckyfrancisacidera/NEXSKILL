import { Link, useLoaderData } from 'react-router-dom';
import { Card } from '@shared/components/Card';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer } from 'recharts';
import { RecruiterHeader } from '@features/recruiter/components/RecruiterHeader';

export const RecruiterDashboardPage = () => {
  const data = useLoaderData() as {
    jobs_posted_over_time: Array<{ date: string; count: number }>;
    applications_over_time: Array<{ date: string; count: number }>;
    top_jobs_by_applications: Array<{ job_id: string; title: string; applications: number }>;
    recommended_count: number;
    shortlisted_count: number;
  };

  return (
    <div className="space-y-6">
      <RecruiterHeader />
      <section className="grid gap-4 md:grid-cols-2">
        <Card><p className="text-sm text-zinc-500">Recommended</p><p className="mt-2 text-2xl font-semibold">{data.recommended_count}</p></Card>
        <Card><p className="text-sm text-zinc-500">Shortlisted</p><p className="mt-2 text-2xl font-semibold">{data.shortlisted_count}</p></Card>
      </section>

      <Card>
        <h2 className="mb-3 font-semibold">Jobs posted over time</h2>
        <div className="h-64"><ResponsiveContainer><BarChart data={data.jobs_posted_over_time.map((x) => ({ day: x.date, applications: x.count }))}><XAxis dataKey="day" /><YAxis /><Bar dataKey="applications" /></BarChart></ResponsiveContainer></div>
      </Card>

      <Card>
        <h2 className="mb-3 font-semibold">Applications over time</h2>
        <div className="h-64"><ResponsiveContainer><BarChart data={data.applications_over_time.map((x) => ({ day: x.date, applications: x.count }))}><XAxis dataKey="day" /><YAxis /><Bar dataKey="applications" /></BarChart></ResponsiveContainer></div>
      </Card>

      <Card>
        <h2 className="mb-3 font-semibold">Top jobs by applications</h2>
        <div className="h-64"><ResponsiveContainer><BarChart data={data.top_jobs_by_applications.map((x) => ({ day: x.title, applications: x.applications }))}><XAxis dataKey="day" /><YAxis /><Bar dataKey="applications" /></BarChart></ResponsiveContainer></div>
        <div className="mt-2 text-sm"><Link className="underline" to="/recruiter/job-posts">Job Posts</Link></div>
      </Card>
    </div>
  );
};
