import { Badge } from '@shared/components/Badge';
import { Button } from '@shared/components/Button';
import { DataTable } from '@shared/components/ui/data-table/DataTable';
import { IdentityCell } from '@shared/components/ui/data-table/IdentityCell';
import { TablePagination } from '@shared/components/ui/data-table/TablePagination';
import { AdminStatusBadge } from '@features/admin/components/AdminStatusBadge';
import type { AdminRecruiterOverviewDto, Paged } from '@features/admin/types/admin.type';

interface AdminRecruitersTableCardProps {
  recruiters: Paged<AdminRecruiterOverviewDto>;
  canManageRecruiters: boolean;
  pendingActionId: string | null;
  onToggleRecruiter: (recruiter: AdminRecruiterOverviewDto) => Promise<void>;
  getPageHref: (page: number) => string;
  onPageSizeChange: (nextPageSize: string) => void;
}

export const AdminRecruitersTableCard = ({
  recruiters,
  canManageRecruiters,
  pendingActionId,
  onToggleRecruiter,
  getPageHref,
  onPageSizeChange,
}: AdminRecruitersTableCardProps) => (
  <section className="min-w-0 border-y border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950">
    <div className="flex flex-col gap-3 border-b border-zinc-200 px-4 py-4 dark:border-zinc-800 sm:flex-row sm:items-center sm:justify-between sm:px-6">
      <div>
        <h2 className="text-lg font-semibold text-zinc-950 dark:text-zinc-100">Recruiter Accounts</h2>
        <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-200">Paginated recruiter roster across all companies.</p>
      </div>
      <Badge>{recruiters.totalCount} total</Badge>
    </div>
    <DataTable
      data={recruiters.items}
      getRowKey={(recruiter) => recruiter.userId}
      surfaceClassName="border-0"
      columns={[
        {
          id: 'recruiter',
          header: 'Recruiter',
          cell: (recruiter) => <IdentityCell name={recruiter.email} email={recruiter.companyName} />,
          accessor: (recruiter) => recruiter.email,
          sortable: true,
          sortType: 'string',
          widthClassName: 'min-w-[260px]',
        },
        {
          id: 'jobs',
          header: 'Jobs',
          cell: (recruiter) => `${recruiter.activeJobs}/${recruiter.totalJobs}`,
          accessor: (recruiter) => recruiter.activeJobs,
          sortable: true,
          sortType: 'number',
        },
        {
          id: 'upcoming-interviews',
          header: 'Upcoming Interviews',
          cell: (recruiter) => recruiter.upcomingInterviews,
          accessor: (recruiter) => recruiter.upcomingInterviews,
          sortable: true,
          sortType: 'number',
        },
        {
          id: 'hires',
          header: 'Hires',
          cell: (recruiter) => recruiter.totalHires,
          accessor: (recruiter) => recruiter.totalHires,
          sortable: true,
          sortType: 'number',
        },
        {
          id: 'status',
          header: 'Status',
          cell: (recruiter) => <AdminStatusBadge isActive={recruiter.isActive} />,
          accessor: (recruiter) => (recruiter.isActive ? 'Active' : 'Inactive'),
          sortable: true,
          sortType: 'string',
        },
        {
          id: 'action',
          header: 'Action',
          align: 'right',
          cell: (recruiter) => (
            <Button
              type="button"
              variant="secondary"
              disabled={!canManageRecruiters || pendingActionId === recruiter.userId}
              onClick={() => void onToggleRecruiter(recruiter)}
            >
              {pendingActionId === recruiter.userId ? 'Updating...' : recruiter.isActive ? 'Deactivate' : 'Activate'}
            </Button>
          ),
          cellClassName: 'w-[140px]',
        },
      ]}
    />
    <TablePagination
      page={recruiters.pageNumber}
      totalPages={recruiters.totalPages}
      totalCount={recruiters.totalCount}
      pageSize={recruiters.pageSize}
      getPageHref={getPageHref}
      onPageSizeChange={(pageSize) => onPageSizeChange(String(pageSize))}
      itemLabel="recruiters"
      className="px-4 sm:px-6"
    />
  </section>
);
