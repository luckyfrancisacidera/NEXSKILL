import { Link, useLoaderData } from 'react-router-dom';
import { Card } from '@shared/components/Card';
import { BarChart, Bar, ResponsiveContainer } from 'recharts';
import { RecruiterHeader } from '@features/recruiter/components/RecruiterHeader';

export const RecruiterDashboardPage = () => {
  const data = useLoaderData() as {
    kpis: { openRoles: number; totalApplicants: number; interviewsThisWeek: number; timeToHire: string };
    stageDistribution: Array<{ day: string; applications: number }>;
    recentActivity: Array<{ id: string; at: string; message: string; ruleName: string }>;
  };

  return (
    <div className="space-y-6">
      <RecruiterHeader />
      <section className="grid gap-4 md:grid-cols-4">
        {[
          ['Open roles', data.kpis.openRoles],
          ['Total applicants', data.kpis.totalApplicants],
          ['Interviews this week', data.kpis.interviewsThisWeek],
          ['Time-to-hire', data.kpis.timeToHire],
        ].map(([label, value]) => (
          <Card key={label} className="rounded-xl border border-zinc-200 bg-white p-4 shadow-sm">
            <p className="text-sm text-zinc-500">{label}</p>
            <p className="mt-2 text-2xl font-semibold text-zinc-900">{value}</p>
          </Card>
        ))}
      </section>

      <Card className="rounded-xl border border-zinc-200 bg-white p-4 shadow-sm">
        <h2 className="mb-3 font-semibold">Applications over stages</h2>
        <div className="h-64">
          <ResponsiveContainer>
            <BarChart data={data.stageDistribution}>
              <Bar dataKey="applications" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>

      <Card className="rounded-xl border border-zinc-200 bg-white p-4 shadow-sm">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="font-semibold">Recent activity</h2>
          <div className="flex gap-2 text-sm">
            <Link className="underline" to="/recruiter/job-posts">Job Posts</Link>
            <Link className="underline" to="/recruiter/candidates">Candidates</Link>
            <Link className="underline" to="/recruiter/interviews">Interviews</Link>
          </div>
        </div>
        <ul className="space-y-2">
          {data.recentActivity.length ? data.recentActivity.map((item) => (
            <li key={item.id} className="rounded-lg border border-zinc-200 p-3 text-sm">
              <p className="font-medium text-zinc-800">{item.ruleName}</p>
              <p className="text-zinc-600">{item.message}</p>
              <p className="text-xs text-zinc-500">{new Date(item.at).toLocaleString()}</p>
            </li>
          )) : <li className="text-sm text-zinc-500">No activity yet.</li>}
        </ul>
      </Card>
    </div>
  );
};
