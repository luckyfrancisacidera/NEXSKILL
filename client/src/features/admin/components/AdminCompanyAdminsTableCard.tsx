import { Badge } from '@shared/components/Badge';
import { Button } from '@shared/components/Button';
import { Card } from '@shared/components/Card';
import { AdminTablePagination } from '@features/admin/components/AdminTablePagination';
import { AdminStatusBadge } from '@features/admin/components/AdminStatusBadge';
import type { AdminCompanyAdminOverviewDto, Paged } from '@features/admin/types/admin.type';

const createdAtFormatter = new Intl.DateTimeFormat('en-US', {
  month: 'short',
  day: 'numeric',
  year: 'numeric',
});

interface AdminCompanyAdminsTableCardProps {
  companyAdmins: Paged<AdminCompanyAdminOverviewDto>;
  canManageCompanies: boolean;
  pendingActionId: string | null;
  onToggleCompanyAdmin: (admin: AdminCompanyAdminOverviewDto) => Promise<void>;
  previousHref: string;
  nextHref: string;
  onPageSizeChange: (nextPageSize: string) => void;
}

export const AdminCompanyAdminsTableCard = ({
  companyAdmins,
  canManageCompanies,
  pendingActionId,
  onToggleCompanyAdmin,
  previousHref,
  nextHref,
  onPageSizeChange,
}: AdminCompanyAdminsTableCardProps) => (
  <Card className="rounded-2xl border border-zinc-200 bg-white p-0 shadow-sm">
    <div className="flex items-center justify-between border-b border-zinc-200 px-6 py-4">
      <div>
        <h2 className="text-lg font-semibold text-zinc-950">Company Admin Accounts</h2>
        <p className="mt-1 text-sm text-zinc-500">Activate or deactivate tenant administrators.</p>
      </div>
      <Badge>{companyAdmins.totalCount} total</Badge>
    </div>
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-zinc-200 text-sm">
        <thead className="bg-zinc-50 text-left text-xs uppercase tracking-[0.18em] text-zinc-500">
          <tr>
            <th className="px-6 py-3">Admin</th>
            <th className="px-6 py-3">Company</th>
            <th className="px-6 py-3">Joined</th>
            <th className="px-6 py-3">Status</th>
            <th className="px-6 py-3 text-right">Action</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-zinc-100">
          {companyAdmins.items.map((admin) => (
            <tr key={admin.userId}>
              <td className="px-6 py-4 font-medium text-zinc-900">{admin.email}</td>
              <td className="px-6 py-4 text-zinc-700">{admin.companyName}</td>
              <td className="px-6 py-4 text-zinc-500">{createdAtFormatter.format(new Date(admin.createdAtUtc))}</td>
              <td className="px-6 py-4">
                <AdminStatusBadge isActive={admin.isActive} />
              </td>
              <td className="px-6 py-4 text-right">
                <Button
                  type="button"
                  variant="secondary"
                  disabled={!canManageCompanies || pendingActionId === admin.userId}
                  onClick={() => void onToggleCompanyAdmin(admin)}
                >
                  {pendingActionId === admin.userId ? 'Updating...' : admin.isActive ? 'Deactivate' : 'Activate'}
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
    <AdminTablePagination
      pageNumber={companyAdmins.pageNumber}
      totalPages={companyAdmins.totalPages}
      totalCount={companyAdmins.totalCount}
      pageSize={companyAdmins.pageSize}
      previousHref={previousHref}
      nextHref={nextHref}
      onPageSizeChange={onPageSizeChange}
    />
  </Card>
);
