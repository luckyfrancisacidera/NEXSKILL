import { Badge } from '@shared/components/Badge';
import { Button } from '@shared/components/Button';
import { DataTable } from '@shared/components/ui/data-table/DataTable';
import { IdentityCell } from '@shared/components/ui/data-table/IdentityCell';
import { TablePagination } from '@shared/components/ui/data-table/TablePagination';
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
  getPageHref: (page: number) => string;
  onPageSizeChange: (nextPageSize: string) => void;
}

export const AdminCompanyAdminsTableCard = ({
  companyAdmins,
  canManageCompanies,
  pendingActionId,
  onToggleCompanyAdmin,
  getPageHref,
  onPageSizeChange,
}: AdminCompanyAdminsTableCardProps) => (
  <section className="border-y border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950">
    <div className="flex items-center justify-between border-b border-zinc-200 dark:border-zinc-800 px-6 py-4">
      <div>
        <h2 className="text-lg font-semibold text-zinc-950 dark:text-zinc-100">Company Admin Accounts</h2>
        <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-200">Activate or deactivate tenant administrators.</p>
      </div>
      <Badge>{companyAdmins.totalCount} total</Badge>
    </div>
    <DataTable
      data={companyAdmins.items}
      getRowKey={(admin) => admin.userId}
      surfaceClassName="border-0"
      columns={[
        {
          id: 'admin',
          header: 'Admin',
          cell: (admin) => <IdentityCell name={admin.email} email={admin.companyName} />,
          accessor: (admin) => admin.email,
          sortable: true,
          sortType: 'string',
          widthClassName: 'min-w-[240px]',
        },
        {
          id: 'joined',
          header: 'Joined',
          cell: (admin) => createdAtFormatter.format(new Date(admin.createdAtUtc)),
          accessor: (admin) => new Date(admin.createdAtUtc),
          sortable: true,
          sortType: 'date',
        },
        {
          id: 'status',
          header: 'Status',
          cell: (admin) => <AdminStatusBadge isActive={admin.isActive} />,
          accessor: (admin) => (admin.isActive ? 'Active' : 'Inactive'),
          sortable: true,
          sortType: 'string',
        },
        {
          id: 'action',
          header: 'Action',
          align: 'right',
          cell: (admin) => (
            <Button
              type="button"
              variant="secondary"
              disabled={!canManageCompanies || pendingActionId === admin.userId}
              onClick={() => void onToggleCompanyAdmin(admin)}
            >
              {pendingActionId === admin.userId ? 'Updating...' : admin.isActive ? 'Deactivate' : 'Activate'}
            </Button>
          ),
          cellClassName: 'w-[140px]',
        },
      ]}
    />
    <TablePagination
      page={companyAdmins.pageNumber}
      totalPages={companyAdmins.totalPages}
      totalCount={companyAdmins.totalCount}
      pageSize={companyAdmins.pageSize}
      getPageHref={getPageHref}
      onPageSizeChange={(pageSize) => onPageSizeChange(String(pageSize))}
      itemLabel="admins"
      className="px-6"
    />
  </section>
);
