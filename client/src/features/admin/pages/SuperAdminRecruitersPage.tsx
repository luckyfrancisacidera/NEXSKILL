import { useNavigate, useLoaderData, useRevalidator, useSearchParams } from 'react-router-dom';
import { Card } from '@shared/components/Card';
import { DashboardPageHeader } from '@shared/components/DashboardPrimitives';
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
      <DashboardPageHeader
        eyebrow="Super Admin"
        title="Recruiter account management"
        description="Monitor recruiter account status across every company, review hiring activity, and activate or deactivate accounts from a dedicated management surface."
      />

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <AdminMetricCard label="Recruiters" value={data.summary.totalRecruiters} accent="border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-900 dark:bg-amber-900/30 dark:text-amber-400" />
        <AdminMetricCard label="Active Recruiters" value={data.summary.activeRecruiters} accent="border-violet-200 bg-violet-50 text-violet-700 dark:border-violet-900 dark:bg-violet-900/30 dark:text-violet-400" />
        <Card className="rounded-2xl border border-zinc-200 bg-white p-3.5 shadow-sm dark:border-zinc-800 dark:bg-zinc-950 sm:p-5">
          <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400 sm:text-sm">Published Jobs</p>
          <p className="mt-2 text-xl font-semibold text-zinc-950 dark:text-zinc-100 sm:mt-3 sm:text-2xl">{data.summary.activeJobs}</p>
        </Card>
      </section>

      <AdminRecruitersTableCard
        recruiters={data.recruiters}
        canManageRecruiters={canManageRecruiters}
        pendingActionId={pendingActionId}
        onToggleRecruiter={runAction}
        getPageHref={(page) => buildQuery({ page: String(page) })}
        onPageSizeChange={(nextPageSize) => navigate(buildQuery({ pageSize: nextPageSize, page: '1' }))}
      />
    </div>
  );
};
