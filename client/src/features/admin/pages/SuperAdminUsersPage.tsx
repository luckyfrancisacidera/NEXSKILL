import { useLoaderData, useNavigate, useRevalidator, useSearchParams } from 'react-router-dom';

import { useAuth } from '@app/providers/AuthProvider';
import { Card } from '@shared/components/Card';
import { DashboardPageHeader } from '@shared/components/DashboardPrimitives';
import { usePermissions } from '@shared/hooks/usePermissions';
import { AdminMetricCard } from '@features/admin/components/AdminMetricCard';
import { AdminUsersTableCard } from '@features/admin/components/AdminUsersTableCard';
import { useAdminActivationAction } from '@features/admin/hooks/useAdminActivationAction';
import { adminService } from '@features/admin/service/admin.service';
import type { AdminUserOverviewDto, SuperAdminUsersPageDto } from '@features/admin/types/admin.type';

export const SuperAdminUsersPage = () => {
  const data = useLoaderData() as SuperAdminUsersPageDto;
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const revalidator = useRevalidator();
  const { user } = useAuth();
  const { isSuperAdmin } = usePermissions();
  const activeUsers = data.users.items.filter((item) => item.isActive).length;

  const buildQuery = (updates: Record<string, string>) => {
    const next = new URLSearchParams(searchParams);
    Object.entries(updates).forEach(([key, value]) => {
      next.set(key, value);
    });
    return `?${next.toString()}`;
  };

  const { pendingActionId, runAction } = useAdminActivationAction<AdminUserOverviewDto>({
    canManage: isSuperAdmin,
    getId: (item) => item.userId,
    isActive: (item) => item.isActive,
    activate: (item) => adminService.activateUser(item.userId),
    deactivate: (item) => adminService.deactivateUser(item.userId),
    copy: {
      title: (activate) => activate ? 'Activate user' : 'Deactivate user',
      message: (activate, item) => `${activate ? 'Activate' : 'Deactivate'} ${item.email}?`,
    },
    onCompleted: () => revalidator.revalidate(),
  });

  return (
    <div className="space-y-5 sm:space-y-6">
      <DashboardPageHeader
        eyebrow="Super Admin"
        title="User account management"
        description="Review every platform account in one place, watch application volume, and deactivate access without leaving the super admin workspace."
      />

      <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <AdminMetricCard label="Users on page" value={data.users.items.length} accent="border-sky-200 bg-sky-50 text-sky-700 dark:border-sky-900 dark:bg-sky-900/30 dark:text-sky-400" />
        <AdminMetricCard label="Active on page" value={activeUsers} accent="border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900 dark:bg-emerald-900/30 dark:text-emerald-400" />
        <Card className="rounded-2xl border border-zinc-200 bg-white p-3.5 shadow-sm dark:border-zinc-800 dark:bg-zinc-950 sm:p-5">
          <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400 sm:text-sm">Total users</p>
          <p className="mt-2 text-xl font-semibold text-zinc-950 dark:text-zinc-100 sm:mt-3 sm:text-2xl">{data.users.totalCount.toLocaleString()}</p>
        </Card>
      </section>

      <AdminUsersTableCard
        users={data.users}
        canManageUsers={isSuperAdmin}
        currentUserId={user?.userId}
        pendingActionId={pendingActionId}
        onToggleUser={runAction}
        getPageHref={(page) => buildQuery({ page: String(page) })}
        onPageSizeChange={(nextPageSize) => navigate(buildQuery({ page: '1', pageSize: nextPageSize }))}
      />
    </div>
  );
};
