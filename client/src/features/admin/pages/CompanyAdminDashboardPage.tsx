import { useState } from 'react';
import { useLoaderData, useNavigate, useRevalidator, useSearchParams } from 'react-router-dom';
import { ApiError } from '@shared/api/http';
import { Badge } from '@shared/components/Badge';
import { Button } from '@shared/components/Button';
import { Card } from '@shared/components/Card';
import { useConfirmation } from '@shared/hooks/useConfirmation';
import { usePermissions } from '@shared/hooks/usePermissions';
import { AdminMetricCard } from '@features/admin/components/AdminMetricCard';
import { AdminTablePagination } from '@features/admin/components/AdminTablePagination';
import { CreateRecruiterModal } from '@features/admin/components/CreateRecruiterModal';
import { adminService } from '@features/admin/service/admin.service';
import type {
  AdminRecruiterOverviewDto,
  CompanyAdminDashboardDto,
  CreateManagedRecruiterPayload,
} from '@features/admin/types/admin.type';

const dateFormatter = new Intl.DateTimeFormat('en-US', {
  month: 'short',
  day: 'numeric',
  year: 'numeric',
});

const getStatusClassName = (isActive: boolean) =>
  isActive ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' : 'bg-zinc-100 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400';

export const CompanyAdminDashboardPage = () => {
  const data = useLoaderData() as CompanyAdminDashboardDto;
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const revalidator = useRevalidator();
  const confirm = useConfirmation();
  const { canManageRecruiters } = usePermissions();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [formSuccess, setFormSuccess] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [pendingUserId, setPendingUserId] = useState<string | null>(null);

  const buildQuery = (updates: Record<string, string>) => {
    const next = new URLSearchParams(searchParams);
    Object.entries(updates).forEach(([key, value]) => {
      next.set(key, value);
    });
    return `?${next.toString()}`;
  };

  const handleCreateRecruiter = async (payload: CreateManagedRecruiterPayload) => {
    setFormError(null);
    setFormSuccess(null);

    if (!canManageRecruiters) {
      setFormError('You do not have permission to manage recruiters in this company.');
      return;
    }

    setIsCreating(true);
    try {
      await adminService.createCompanyRecruiter(payload);
      setIsCreateModalOpen(false);
      setFormSuccess('Recruiter account created successfully.');
      revalidator.revalidate();
    } catch (error) {
      const message = error instanceof ApiError ? error.message : 'Could not create recruiter.';
      setFormError(message);
      throw error;
    } finally {
      setIsCreating(false);
    }
  };

  const handleRecruiterAction = async (recruiter: AdminRecruiterOverviewDto) => {
    if (!canManageRecruiters) {
      return;
    }

    const activate = !recruiter.isActive;
    const confirmed = await confirm({
      title: activate ? 'Activate recruiter' : 'Deactivate recruiter',
      message: `${activate ? 'Activate' : 'Deactivate'} recruiter ${recruiter.email}?`,
      confirmLabel: activate ? 'Activate' : 'Deactivate',
      accent: activate ? 'green' : 'red',
    });

    if (!confirmed) {
      return;
    }

    setFormError(null);
    setFormSuccess(null);
    setPendingUserId(recruiter.userId);
    try {
      if (activate) {
        await adminService.activateCompanyRecruiter(recruiter.userId);
        setFormSuccess(`Activated ${recruiter.email}.`);
      } else {
        await adminService.deactivateCompanyRecruiter(recruiter.userId);
        setFormSuccess(`Deactivated ${recruiter.email}.`);
      }
      revalidator.revalidate();
    } catch (error) {
      setFormError(error instanceof ApiError ? error.message : `Could not ${activate ? 'activate' : 'deactivate'} recruiter.`);
    } finally {
      setPendingUserId(null);
    }
  };

  return (
    <>
      <div className="space-y-6">
        <section className="rounded-[28px] border border-zinc-200 dark:border-zinc-800 bg-[linear-gradient(135deg,#ffffff,#f8fafc)] dark:bg-[linear-gradient(135deg,#09090b,#18181b)] p-8 shadow-sm">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-zinc-500 dark:text-zinc-400">Company Admin</p>
              <h1 className="mt-3 text-3xl font-semibold text-zinc-950 dark:text-zinc-100">{data.company.name}</h1>
              <p className="mt-3 max-w-3xl text-sm leading-6 text-zinc-600 dark:text-zinc-400">
                Manage recruiter access, track hiring throughput, and keep your company recruiting team in one place.
              </p>
            </div>
            <Button type="button" onClick={() => setIsCreateModalOpen(true)} disabled={!canManageRecruiters}>
              Create recruiter
            </Button>
          </div>
        </section>

        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          <AdminMetricCard label="Recruiters" value={data.summary.totalRecruiters} accent="border-sky-200 bg-sky-50 text-sky-700 dark:border-sky-900 dark:bg-sky-900/30 dark:text-sky-400" />
          <AdminMetricCard label="Active Recruiters" value={data.summary.activeRecruiters} accent="border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900 dark:bg-emerald-900/30 dark:text-emerald-400" />
          <AdminMetricCard label="Published Jobs" value={data.summary.activeJobs} accent="border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-900 dark:bg-amber-900/30 dark:text-amber-400" />
          <AdminMetricCard label="Upcoming Interviews" value={data.summary.upcomingInterviews} accent="border-violet-200 bg-violet-50 text-violet-700 dark:border-violet-900 dark:bg-violet-900/30 dark:text-violet-400" />
          <AdminMetricCard label="Offers" value={data.summary.totalOffers} accent="border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-900 dark:bg-rose-900/30 dark:text-rose-400" />
          <AdminMetricCard label="Hires" value={data.summary.totalHires} accent="border-cyan-200 bg-cyan-50 text-cyan-700 dark:border-cyan-900 dark:bg-cyan-900/30 dark:text-cyan-400" />
        </section>

        {formError ? (
          <div className="rounded-xl border border-rose-200 dark:border-rose-900 bg-rose-50 dark:bg-rose-950/40 px-4 py-3 text-sm text-rose-700 dark:text-rose-300">{formError}</div>
        ) : null}
        {formSuccess ? (
          <div className="rounded-xl border border-emerald-200 dark:border-emerald-900 bg-emerald-50 dark:bg-emerald-950/40 px-4 py-3 text-sm text-emerald-700 dark:text-emerald-300">{formSuccess}</div>
        ) : null}

        <section className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
          <Card className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-0 shadow-sm">
            <div className="flex items-center justify-between border-b border-zinc-200 dark:border-zinc-800 px-6 py-4">
              <div>
                <h2 className="text-lg font-semibold text-zinc-950 dark:text-zinc-100">Recruiter Management</h2>
                <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-200">Create recruiter accounts and monitor team activity at a glance.</p>
              </div>
              <Badge>{data.recruiters.totalCount} recruiters</Badge>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-zinc-200 dark:divide-zinc-800 text-sm">
                <thead className="bg-zinc-50 dark:bg-zinc-900 dark:text-zinc-200 text-left text-xs uppercase tracking-[0.18em] text-zinc-500">
                  <tr>
                    <th className="px-6 py-3">Recruiter</th>
                    <th className="px-6 py-3">Jobs</th>
                    <th className="px-6 py-3">Upcoming Interviews</th>
                    <th className="px-6 py-3">Hires</th>
                    <th className="px-6 py-3">Status</th>
                    <th className="px-6 py-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                  {data.recruiters.items.map((recruiter) => (
                    <tr key={recruiter.userId}>
                      <td className="px-6 py-4">
                        <div className="font-medium text-zinc-900 dark:text-zinc-100">{recruiter.email}</div>
                        <div className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">Joined {dateFormatter.format(new Date(recruiter.createdAtUtc))}</div>
                      </td>
                      <td className="px-6 py-4 text-zinc-700 dark:text-zinc-300">{recruiter.activeJobs}/{recruiter.totalJobs}</td>
                      <td className="px-6 py-4 text-zinc-700 dark:text-zinc-300">{recruiter.upcomingInterviews}</td>
                      <td className="px-6 py-4 text-zinc-700 dark:text-zinc-300">{recruiter.totalHires}</td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${getStatusClassName(recruiter.isActive)}`}>
                          {recruiter.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <Button
                          type="button"
                          variant="secondary"
                          className="min-w-28"
                          disabled={!canManageRecruiters || pendingUserId === recruiter.userId}
                          onClick={() => void handleRecruiterAction(recruiter)}
                        >
                          {pendingUserId === recruiter.userId ? 'Updating...' : recruiter.isActive ? 'Deactivate' : 'Activate'}
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <AdminTablePagination
              pageNumber={data.recruiters.pageNumber}
              totalPages={data.recruiters.totalPages}
              totalCount={data.recruiters.totalCount}
              pageSize={data.recruiters.pageSize}
              previousHref={buildQuery({ page: String(Math.max(1, data.recruiters.pageNumber - 1)) })}
              nextHref={buildQuery({ page: String(Math.min(data.recruiters.totalPages, data.recruiters.pageNumber + 1)) })}
              onPageSizeChange={(nextPageSize) => navigate(buildQuery({ page: '1', pageSize: nextPageSize }))}
            />
          </Card>

          <Card className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-zinc-950 dark:text-zinc-100">Company status</h2>
            <p className="mt-2 text-sm leading-6 text-zinc-500 dark:text-zinc-400">
              Recruiter accounts created here are automatically scoped to {data.company.name}.
            </p>
            <div className="mt-6 space-y-4 text-sm text-zinc-600 dark:text-zinc-400">
              <div>
                <div className="font-medium text-zinc-900 dark:text-zinc-100">Primary email</div>
                <div className="mt-1">{data.company.primaryEmail ?? 'No primary email set'}</div>
              </div>
              <div>
                <div className="font-medium text-zinc-900 dark:text-zinc-100">Location</div>
                <div className="mt-1">{data.company.location ?? 'Location can be added during setup'}</div>
              </div>
              <div>
                <div className="font-medium text-zinc-900 dark:text-zinc-100">Status</div>
                <div className="mt-2">
                  <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${getStatusClassName(data.company.isActive)}`}>
                    {data.company.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>
              </div>
            </div>
          </Card>
        </section>
      </div>

      <CreateRecruiterModal
        open={isCreateModalOpen}
        companyName={data.company.name}
        isSubmitting={isCreating}
        error={formError}
        onClose={() => {
          setFormError(null);
          setIsCreateModalOpen(false);
        }}
        onSubmit={handleCreateRecruiter}
      />
    </>
  );
};
