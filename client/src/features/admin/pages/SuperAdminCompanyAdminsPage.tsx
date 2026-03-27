import { useNavigate, useLoaderData, useRevalidator, useSearchParams } from 'react-router-dom';
import { Card } from '@shared/components/Card';
import { usePermissions } from '@shared/hooks/usePermissions';
import { AdminCompanyAdminsTableCard } from '@features/admin/components/AdminCompanyAdminsTableCard';
import { AdminMetricCard } from '@features/admin/components/AdminMetricCard';
import { useAdminActivationAction } from '@features/admin/hooks/useAdminActivationAction';
import { adminService } from '@features/admin/service/admin.service';
import type {
  AdminCompanyAdminOverviewDto,
  SuperAdminCompanyAdminsPageDto,
} from '@features/admin/types/admin.type';

export const SuperAdminCompanyAdminsPage = () => {
  const data = useLoaderData() as SuperAdminCompanyAdminsPageDto;
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const revalidator = useRevalidator();
  const { canManageCompanies } = usePermissions();

  const buildQuery = (updates: Record<string, string>) => {
    const next = new URLSearchParams(searchParams);
    Object.entries(updates).forEach(([key, value]) => {
      next.set(key, value);
    });
    return `?${next.toString()}`;
  };

  const { pendingActionId, runAction } = useAdminActivationAction<AdminCompanyAdminOverviewDto>({
    canManage: canManageCompanies,
    getId: (admin) => admin.userId,
    isActive: (admin) => admin.isActive,
    activate: (admin) => adminService.activateCompanyAdmin(admin.userId),
    deactivate: (admin) => adminService.deactivateCompanyAdmin(admin.userId),
    copy: {
      title: (activate) => activate ? 'Activate company admin' : 'Deactivate company admin',
      message: (activate, admin) => `${activate ? 'Activate' : 'Deactivate'} ${admin.email}?`,
    },
    onCompleted: () => revalidator.revalidate(),
  });

  return (
    <div className="space-y-6">
      <section className="rounded-[28px] border border-zinc-200 dark:border-zinc-800 bg-[radial-gradient(circle_at_top_left,_rgba(15,23,42,0.06),_transparent_50%),linear-gradient(135deg,_#fafaf9,_#ffffff)] dark:bg-[radial-gradient(circle_at_top_left,_rgba(15,23,42,0.06),_transparent_50%),linear-gradient(135deg,_#19191f,_#09090b)] p-8 shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-[0.24em] text-zinc-500 dark:text-zinc-400">Super Admin</p>
        <h1 className="mt-3 text-3xl font-semibold text-zinc-950 dark:text-zinc-100">Company admin account management</h1>
        <p className="mt-3 max-w-3xl text-sm leading-6 text-zinc-600 dark:text-zinc-400">
          Review every tenant administrator in one place, keep account status aligned with company access, and handle activation changes without leaving the admin workspace.
        </p>
      </section>

      <section className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <AdminMetricCard label="Total Companies" value={data.summary.totalCompanies} accent="border-sky-200 bg-sky-50 text-sky-700 dark:border-sky-900 dark:bg-sky-900/30 dark:text-sky-400" />
        <AdminMetricCard label="Active Companies" value={data.summary.activeCompanies} accent="border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900 dark:bg-emerald-900/30 dark:text-emerald-400" />
        <Card className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-6 shadow-sm">
          <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">Company Admin Accounts</p>
          <p className="mt-3 text-3xl font-semibold text-zinc-950 dark:text-zinc-100">{data.companyAdmins.totalCount}</p>
        </Card>
      </section>

      <AdminCompanyAdminsTableCard
        companyAdmins={data.companyAdmins}
        canManageCompanies={canManageCompanies}
        pendingActionId={pendingActionId}
        onToggleCompanyAdmin={runAction}
        getPageHref={(page) => buildQuery({ page: String(page) })}
        onPageSizeChange={(nextPageSize) => navigate(buildQuery({ pageSize: nextPageSize, page: '1' }))}
      />
    </div>
  );
};
