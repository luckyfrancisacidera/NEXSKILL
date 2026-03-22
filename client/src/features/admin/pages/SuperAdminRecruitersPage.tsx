import { useNavigate, useLoaderData, useRevalidator, useSearchParams } from 'react-router-dom';
import { Card } from '@shared/components/Card';
import { usePermissions } from '@shared/hooks/usePermissions';
import { AdminMetricCard } from '@features/admin/components/AdminMetricCard';
import { AdminRecruitersTableCard } from '@features/admin/components/AdminRecruitersTableCard';
import { useAdminActivationAction } from '@features/admin/hooks/useAdminActivationAction';
import { adminService } from '@features/admin/service/admin.service';
import type {
  AdminRecruiterOverviewDto,
  SuperAdminRecruitersPageDto,
} from '@features/admin/types/admin.type';

export const SuperAdminRecruitersPage = () => {
  const data = useLoaderData() as SuperAdminRecruitersPageDto;
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const revalidator = useRevalidator();
  const { canManageRecruiters } = usePermissions();

  const buildQuery = (updates: Record<string, string>) => {
    const next = new URLSearchParams(searchParams);
    Object.entries(updates).forEach(([key, value]) => {
      next.set(key, value);
    });
    return `?${next.toString()}`;
  };

  const { pendingActionId, runAction } = useAdminActivationAction<AdminRecruiterOverviewDto>({
    canManage: canManageRecruiters,
    getId: (recruiter) => recruiter.userId,
    isActive: (recruiter) => recruiter.isActive,
    activate: (recruiter) => adminService.activateRecruiterBySuperAdmin(recruiter.userId),
    deactivate: (recruiter) => adminService.deactivateRecruiterBySuperAdmin(recruiter.userId),
    copy: {
      title: (activate) => activate ? 'Activate recruiter' : 'Deactivate recruiter',
      message: (activate, recruiter) => `${activate ? 'Activate' : 'Deactivate'} ${recruiter.email}?`,
    },
    onCompleted: () => revalidator.revalidate(),
  });

  return (
    <div className="space-y-6">
      <section className="rounded-[28px] border border-zinc-200 dark:border-zinc-800 bg-[radial-gradient(circle_at_top_left,_rgba(15,23,42,0.06),_transparent_50%),linear-gradient(135deg,_#fafaf9,_#ffffff)] dark:bg-[radial-gradient(circle_at_top_left,_rgba(15,23,42,0.06),_transparent_50%),linear-gradient(135deg,_#19191f,_#09090b)] p-8 shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-[0.24em] text-zinc-500 dark:text-zinc-400">Super Admin</p>
        <h1 className="mt-3 text-3xl font-semibold text-zinc-950 dark:text-zinc-100">Recruiter account management</h1>
        <p className="mt-3 max-w-3xl text-sm leading-6 text-zinc-600 dark:text-zinc-400">
          Monitor recruiter account status across every company, review hiring activity, and activate or deactivate accounts from a dedicated management surface.
        </p>
      </section>

      <section className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <AdminMetricCard label="Recruiters" value={data.summary.totalRecruiters} accent="border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-900 dark:bg-amber-900/30 dark:text-amber-400" />
        <AdminMetricCard label="Active Recruiters" value={data.summary.activeRecruiters} accent="border-violet-200 bg-violet-50 text-violet-700 dark:border-violet-900 dark:bg-violet-900/30 dark:text-violet-400" />
        <Card className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-6 shadow-sm">
          <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">Published Jobs</p>
          <p className="mt-3 text-3xl font-semibold text-zinc-950 dark:text-zinc-100">{data.summary.activeJobs}</p>
        </Card>
      </section>

      <AdminRecruitersTableCard
        recruiters={data.recruiters}
        canManageRecruiters={canManageRecruiters}
        pendingActionId={pendingActionId}
        onToggleRecruiter={runAction}
        previousHref={buildQuery({ page: String(Math.max(1, data.recruiters.pageNumber - 1)) })}
        nextHref={buildQuery({ page: String(Math.min(data.recruiters.totalPages, data.recruiters.pageNumber + 1)) })}
        onPageSizeChange={(nextPageSize) => navigate(buildQuery({ pageSize: nextPageSize, page: '1' }))}
      />
    </div>
  );
};
