import { useState } from 'react';
import type { FormEvent } from 'react';
import { useLoaderData, useRevalidator } from 'react-router-dom';
import { ApiError } from '@shared/api/http';
import { Badge } from '@shared/components/Badge';
import { Button } from '@shared/components/Button';
import { Card } from '@shared/components/Card';
import { AdminMetricCard } from '@features/admin/components/AdminMetricCard';
import { adminService } from '@features/admin/service/admin.service';
import type { AdminRecruiterOverviewDto, CompanyAdminDashboardDto } from '@features/admin/types/admin.type';
import { useConfirmation } from '@shared/hooks/useConfirmation';
import { usePermissions } from '@shared/hooks/usePermissions';

const dateFormatter = new Intl.DateTimeFormat('en-US', {
  month: 'short',
  day: 'numeric',
  year: 'numeric',
});

const inputClassName = 'mt-2 w-full rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm text-zinc-900 outline-none transition focus:border-zinc-400 focus:bg-white';

export const CompanyAdminDashboardPage = () => {
  const data = useLoaderData() as CompanyAdminDashboardDto;
  const revalidator = useRevalidator();
  const confirm = useConfirmation();
  const { canManageRecruiters } = usePermissions();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [formError, setFormError] = useState<string | null>(null);
  const [formSuccess, setFormSuccess] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [deactivatingUserId, setDeactivatingUserId] = useState<string | null>(null);

  const handleCreateRecruiter = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFormError(null);
    setFormSuccess(null);

    if (!canManageRecruiters) {
      setFormError('You do not have permission to manage recruiters in this company.');
      return;
    }

    if (!email.trim() || !password.trim()) {
      setFormError('Email and password are required.');
      return;
    }

    setIsCreating(true);
    try {
      await adminService.createCompanyRecruiter({
        email: email.trim(),
        password: password.trim(),
      });
      setEmail('');
      setPassword('');
      setFormSuccess('Recruiter account created successfully.');
      revalidator.revalidate();
    } catch (error) {
      setFormError(error instanceof ApiError ? error.message : 'Could not create recruiter.');
    } finally {
      setIsCreating(false);
    }
  };

  const handleDeactivateRecruiter = async (recruiter: AdminRecruiterOverviewDto) => {
    if (!recruiter.isActive || !canManageRecruiters) {
      return;
    }

    const confirmed = await confirm({
      title: 'Deactivate recruiter',
      message: `Deactivate recruiter ${recruiter.email}? They will immediately lose access.`,
      confirmLabel: 'Deactivate',
      accent: 'red',
    });
    if (!confirmed) {
      return;
    }

    setFormError(null);
    setFormSuccess(null);
    setDeactivatingUserId(recruiter.userId);
    try {
      await adminService.deactivateCompanyRecruiter(recruiter.userId);
      setFormSuccess(`Deactivated ${recruiter.email}.`);
      revalidator.revalidate();
    } catch (error) {
      setFormError(error instanceof ApiError ? error.message : 'Could not deactivate recruiter.');
    } finally {
      setDeactivatingUserId(null);
    }
  };

  return (
    <div className="space-y-6">
      <section className="rounded-[28px] border border-zinc-200 bg-[linear-gradient(135deg,#ffffff,#f8fafc)] p-8 shadow-sm">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-zinc-500">Company Admin</p>
            <h1 className="mt-3 text-3xl font-semibold text-zinc-950">{data.company.name}</h1>
            <p className="mt-3 max-w-3xl text-sm leading-6 text-zinc-600">
              Manage recruiter access, track hiring throughput, and keep your company recruiting team in one place.
            </p>
          </div>
          <div className="rounded-2xl border border-zinc-200 bg-white px-4 py-3 text-sm text-zinc-600 shadow-sm">
            <div className="font-medium text-zinc-900">{data.company.primaryEmail ?? 'No primary email set'}</div>
            <div className="mt-1">{data.company.location ?? 'Location can be added during setup'}</div>
          </div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        <AdminMetricCard label="Recruiters" value={data.summary.totalRecruiters} accent="border-sky-200 bg-sky-50 text-sky-700" />
        <AdminMetricCard label="Active Recruiters" value={data.summary.activeRecruiters} accent="border-emerald-200 bg-emerald-50 text-emerald-700" />
        <AdminMetricCard label="Published Jobs" value={data.summary.activeJobs} accent="border-amber-200 bg-amber-50 text-amber-700" />
        <AdminMetricCard label="Upcoming Interviews" value={data.summary.upcomingInterviews} accent="border-violet-200 bg-violet-50 text-violet-700" />
        <AdminMetricCard label="Offers" value={data.summary.totalOffers} accent="border-rose-200 bg-rose-50 text-rose-700" />
        <AdminMetricCard label="Hires" value={data.summary.totalHires} accent="border-cyan-200 bg-cyan-50 text-cyan-700" />
      </section>

      <section className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
        <Card className="rounded-2xl border border-zinc-200 bg-white p-0 shadow-sm">
          <div className="flex items-center justify-between border-b border-zinc-200 px-6 py-4">
            <div>
              <h2 className="text-lg font-semibold text-zinc-950">Recruiter Management</h2>
              <p className="mt-1 text-sm text-zinc-500">Create recruiter accounts and monitor team activity at a glance.</p>
            </div>
            <Badge>{data.recruiters.length} recruiters</Badge>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-zinc-200 text-sm">
              <thead className="bg-zinc-50 text-left text-xs uppercase tracking-[0.18em] text-zinc-500">
                <tr>
                  <th className="px-6 py-3">Recruiter</th>
                  <th className="px-6 py-3">Jobs</th>
                  <th className="px-6 py-3">Upcoming Interviews</th>
                  <th className="px-6 py-3">Hires</th>
                  <th className="px-6 py-3">Status</th>
                  <th className="px-6 py-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100">
                {data.recruiters.map((recruiter) => (
                  <tr key={recruiter.userId}>
                    <td className="px-6 py-4">
                      <div className="font-medium text-zinc-900">{recruiter.email}</div>
                      <div className="mt-1 text-xs text-zinc-500">Joined {dateFormatter.format(new Date(recruiter.createdAtUtc))}</div>
                    </td>
                    <td className="px-6 py-4 text-zinc-700">{recruiter.activeJobs}/{recruiter.totalJobs}</td>
                    <td className="px-6 py-4 text-zinc-700">{recruiter.upcomingInterviews}</td>
                    <td className="px-6 py-4 text-zinc-700">{recruiter.totalHires}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${recruiter.isActive ? 'bg-emerald-50 text-emerald-700' : 'bg-zinc-100 text-zinc-500'}`}>
                        {recruiter.isActive ? 'Active' : 'Deactivated'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Button
                        type="button"
                        variant="secondary"
                        className="min-w-28"
                        disabled={!canManageRecruiters || !recruiter.isActive || deactivatingUserId === recruiter.userId}
                        onClick={() => handleDeactivateRecruiter(recruiter)}
                      >
                        {deactivatingUserId === recruiter.userId ? 'Deactivating...' : recruiter.isActive ? 'Deactivate' : 'Inactive'}
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        <Card className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-zinc-950">Create Recruiter</h2>
          <p className="mt-2 text-sm leading-6 text-zinc-500">
            New recruiters are automatically linked to {data.company.name} and will be prompted to finish setup on first sign-in.
          </p>

          <form className="mt-6 space-y-4" onSubmit={handleCreateRecruiter}>
            <label className="block text-sm font-medium text-zinc-700">
              Recruiter email
              <input
                type="email"
                className={inputClassName}
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="recruiter@company.com"
                autoComplete="email"
              />
            </label>

            <label className="block text-sm font-medium text-zinc-700">
              Temporary password
              <input
                type="password"
                className={inputClassName}
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="Minimum 8 characters"
                autoComplete="new-password"
              />
            </label>

            {formError ? (
              <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{formError}</div>
            ) : null}
            {formSuccess ? (
              <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{formSuccess}</div>
            ) : null}

            <Button type="submit" className="w-full" disabled={isCreating || !canManageRecruiters}>
              {isCreating ? 'Creating recruiter...' : 'Create recruiter'}
            </Button>
          </form>
        </Card>
      </section>
    </div>
  );
};
