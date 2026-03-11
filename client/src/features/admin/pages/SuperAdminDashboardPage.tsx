import { useLoaderData } from 'react-router-dom';
import { Badge } from '@shared/components/Badge';
import { Card } from '@shared/components/Card';
import { AdminMetricCard } from '@features/admin/components/AdminMetricCard';
import type { SuperAdminDashboardDto } from '@features/admin/types/admin.type';

const updatedAtFormatter = new Intl.DateTimeFormat('en-US', {
  month: 'short',
  day: 'numeric',
  year: 'numeric',
});

export const SuperAdminDashboardPage = () => {
  const data = useLoaderData() as SuperAdminDashboardDto;

  return (
    <div className="space-y-6">
      <section className="rounded-[28px] border border-zinc-200 bg-[radial-gradient(circle_at_top_left,_rgba(15,23,42,0.06),_transparent_50%),linear-gradient(135deg,_#fafaf9,_#ffffff)] p-8 shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-[0.24em] text-zinc-500">Super Admin</p>
        <h1 className="mt-3 text-3xl font-semibold text-zinc-950">Platform oversight across every company</h1>
        <p className="mt-3 max-w-3xl text-sm leading-6 text-zinc-600">
          Monitor tenant health, recruiter activity, and hiring momentum without leaving the admin workspace.
        </p>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        <AdminMetricCard label="Total Companies" value={data.summary.totalCompanies} accent="border-sky-200 bg-sky-50 text-sky-700" />
        <AdminMetricCard label="Active Companies" value={data.summary.activeCompanies} accent="border-emerald-200 bg-emerald-50 text-emerald-700" />
        <AdminMetricCard label="Recruiters" value={data.summary.totalRecruiters} accent="border-amber-200 bg-amber-50 text-amber-700" />
        <AdminMetricCard label="Active Recruiters" value={data.summary.activeRecruiters} accent="border-violet-200 bg-violet-50 text-violet-700" />
        <AdminMetricCard label="All Jobs" value={data.summary.totalJobs} accent="border-rose-200 bg-rose-50 text-rose-700" />
        <AdminMetricCard label="Published Jobs" value={data.summary.activeJobs} accent="border-cyan-200 bg-cyan-50 text-cyan-700" />
      </section>

      <Card className="rounded-2xl border border-zinc-200 bg-white p-0 shadow-sm">
        <div className="flex items-center justify-between border-b border-zinc-200 px-6 py-4">
          <div>
            <h2 className="text-lg font-semibold text-zinc-950">Company Directory</h2>
            <p className="mt-1 text-sm text-zinc-500">A live rollup of company health and upcoming interview volume.</p>
          </div>
          <Badge>{data.companies.length} tracked</Badge>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-zinc-200 text-sm">
            <thead className="bg-zinc-50 text-left text-xs uppercase tracking-[0.18em] text-zinc-500">
              <tr>
                <th className="px-6 py-3">Company</th>
                <th className="px-6 py-3">Recruiters</th>
                <th className="px-6 py-3">Published Jobs</th>
                <th className="px-6 py-3">Next 7 Days</th>
                <th className="px-6 py-3">Status</th>
                <th className="px-6 py-3">Updated</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {data.companies.map((company) => (
                <tr key={company.companyId} className="align-top">
                  <td className="px-6 py-4">
                    <div className="font-medium text-zinc-900">{company.name}</div>
                    <div className="mt-1 text-xs text-zinc-500">{company.primaryEmail ?? 'No primary email'}</div>
                  </td>
                  <td className="px-6 py-4 text-zinc-700">{company.recruiterCount}</td>
                  <td className="px-6 py-4 text-zinc-700">{company.activeJobs}</td>
                  <td className="px-6 py-4 text-zinc-700">{company.upcomingInterviews}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${company.isActive ? 'bg-emerald-50 text-emerald-700' : 'bg-zinc-100 text-zinc-500'}`}>
                      {company.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-zinc-500">{updatedAtFormatter.format(new Date(company.updatedAtUtc))}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <Card className="rounded-2xl border border-zinc-200 bg-white p-0 shadow-sm">
        <div className="flex items-center justify-between border-b border-zinc-200 px-6 py-4">
          <div>
            <h2 className="text-lg font-semibold text-zinc-950">Newest Recruiters</h2>
            <p className="mt-1 text-sm text-zinc-500">Recent recruiter accounts across all companies.</p>
          </div>
          <Badge>{data.recentRecruiters.length} shown</Badge>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-zinc-200 text-sm">
            <thead className="bg-zinc-50 text-left text-xs uppercase tracking-[0.18em] text-zinc-500">
              <tr>
                <th className="px-6 py-3">Recruiter</th>
                <th className="px-6 py-3">Company</th>
                <th className="px-6 py-3">Jobs</th>
                <th className="px-6 py-3">Upcoming Interviews</th>
                <th className="px-6 py-3">Hires</th>
                <th className="px-6 py-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {data.recentRecruiters.map((recruiter) => (
                <tr key={recruiter.userId}>
                  <td className="px-6 py-4">
                    <div className="font-medium text-zinc-900">{recruiter.email}</div>
                    <div className="mt-1 text-xs text-zinc-500">Joined {updatedAtFormatter.format(new Date(recruiter.createdAtUtc))}</div>
                  </td>
                  <td className="px-6 py-4 text-zinc-700">{recruiter.companyName}</td>
                  <td className="px-6 py-4 text-zinc-700">{recruiter.activeJobs}/{recruiter.totalJobs}</td>
                  <td className="px-6 py-4 text-zinc-700">{recruiter.upcomingInterviews}</td>
                  <td className="px-6 py-4 text-zinc-700">{recruiter.totalHires}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${recruiter.isActive ? 'bg-emerald-50 text-emerald-700' : 'bg-zinc-100 text-zinc-500'}`}>
                      {recruiter.isActive ? 'Active' : 'Deactivated'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};
