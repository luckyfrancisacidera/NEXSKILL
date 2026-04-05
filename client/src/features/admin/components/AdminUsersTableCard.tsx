import { Badge } from '@shared/components/data-display/Badge';
import { Button } from '@shared/components/actions/Button';
import { DataTable } from '@shared/components/data-display/data-table/DataTable';
import { IdentityCell } from '@shared/components/data-display/data-table/IdentityCell';
import { TablePagination } from '@shared/components/data-display/data-table/TablePagination';
import { TablePageSizeControl } from '@shared/components/data-display/data-table/TablePageSizeControl';
import { AdminStatusBadge } from '@features/admin/components/AdminStatusBadge';
import type { AdminUserOverviewDto, Paged } from '@features/admin/types/admin.type';

const joinedAtFormatter = new Intl.DateTimeFormat('en-US', {
  month: 'short',
  day: 'numeric',
  year: 'numeric',
});

interface AdminUsersTableCardProps {
  users: Paged<AdminUserOverviewDto>;
  canManageUsers: boolean;
  currentUserId?: string;
  pendingActionId: string | null;
  onToggleUser: (user: AdminUserOverviewDto) => Promise<void>;
  getPageHref: (page: number) => string;
  onPageSizeChange: (nextPageSize: string) => void;
}

export const AdminUsersTableCard = ({
  users,
  canManageUsers,
  currentUserId,
  pendingActionId,
  onToggleUser,
  getPageHref,
  onPageSizeChange,
}: AdminUsersTableCardProps) => {
  const visibleUsers = users.items.filter((user) => user.role === 'JobSeeker');

  return (
    <section className="min-w-0 border-y border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950">
      <div className="flex flex-wrap items-start justify-between gap-3 border-b border-zinc-200 px-3 py-3 dark:border-zinc-800 sm:px-5">
        <div className="min-w-0 flex-1">
          <h2 className="text-base font-semibold text-zinc-950 dark:text-zinc-100 sm:text-lg">User Directory</h2>
          <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400 sm:text-sm">Platform-wide accounts with application volume and direct status controls.</p>
        </div>
        <div className="ml-auto flex w-full flex-wrap items-center justify-between gap-2 sm:w-auto sm:justify-end">
          <Badge>{users.totalCount} total</Badge>
          <TablePageSizeControl value={users.pageSize} onChange={(pageSize) => onPageSizeChange(String(pageSize))} />
        </div>
      </div>
      <DataTable
        data={visibleUsers}
        getRowKey={(user) => user.userId}
        surfaceClassName="border-0"
        emptyState={
          <div className="px-4 py-10 text-center text-sm text-zinc-500 dark:text-zinc-400">
            No users found.
          </div>
        }
        columns={[
          {
            id: 'user',
            header: 'User',
            cell: (user) => (
              <IdentityCell
                name={user.name}
                email={user.email}
                nameClassName="text-[12px] font-semibold sm:text-[13px]"
                emailClassName="text-[11px] text-zinc-500 dark:text-zinc-400 sm:text-[12px]"
              />
            ),
            accessor: (user) => user.name,
            sortable: true,
            sortType: 'string',
            widthClassName: 'min-w-[220px] sm:min-w-[250px]',
          },
          {
            id: 'applications',
            header: 'Applications',
            cell: (user) => user.applicationCount,
            accessor: (user) => user.applicationCount,
            sortable: true,
            sortType: 'number',
            cellClassName: 'whitespace-nowrap',
          },
          {
            id: 'joined',
            header: 'Joined',
            cell: (user) => joinedAtFormatter.format(new Date(user.joinedAtUtc)),
            accessor: (user) => new Date(user.joinedAtUtc),
            sortable: true,
            sortType: 'date',
            cellClassName: 'whitespace-nowrap',
          },
          {
            id: 'status',
            header: 'Status',
            cell: (user) => <AdminStatusBadge isActive={user.isActive} />,
            accessor: (user) => (user.isActive ? 'Active' : 'Inactive'),
            sortable: true,
            sortType: 'string',
          },
          {
            id: 'action',
            header: 'Action',
            align: 'right',
            cell: (user) => {
              const isProtectedUser = user.role === 'Admin' || user.role === 'SuperAdmin' || currentUserId === user.userId;
              return (
                <Button
                  type="button"
                  variant="secondary"
                  disabled={!canManageUsers || isProtectedUser || pendingActionId === user.userId}
                  className="min-w-[92px] text-xs sm:min-w-[108px] sm:text-sm"
                  onClick={() => void onToggleUser(user)}
                  title={isProtectedUser ? 'This account is protected from direct deactivation.' : undefined}
                >
                  {pendingActionId === user.userId ? 'Updating...' : user.isActive ? 'Deactivate' : 'Activate'}
                </Button>
              );
            },
            cellClassName: 'w-[112px] sm:w-[132px]',
          },
        ]}
      />
      <TablePagination
        page={users.pageNumber}
        totalPages={users.totalPages}
        totalCount={users.totalCount}
        pageSize={users.pageSize}
        getPageHref={getPageHref}
        itemLabel="users"
        className="px-3 sm:px-5"
        showPageSizeSelector={false}
      />
    </section>
  );
};

