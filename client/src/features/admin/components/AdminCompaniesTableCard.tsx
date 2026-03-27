import { Badge } from '@shared/components/Badge';
import { Button } from '@shared/components/Button';
import { DataTable } from '@shared/components/ui/data-table/DataTable';
import { IdentityCell } from '@shared/components/ui/data-table/IdentityCell';
import { TablePagination } from '@shared/components/ui/data-table/TablePagination';
import { AdminStatusBadge } from '@features/admin/components/AdminStatusBadge';
import type { AdminCompanyOverviewDto, Paged } from '@features/admin/types/admin.type';

const updatedAtFormatter = new Intl.DateTimeFormat('en-US', {
  month: 'short',
  day: 'numeric',
  year: 'numeric',
});

interface AdminCompaniesTableCardProps {
  companies: Paged<AdminCompanyOverviewDto>;
  canManageCompanies: boolean;
  pendingActionId: string | null;
  onToggleCompany: (company: AdminCompanyOverviewDto) => Promise<void>;
  getPageHref: (page: number) => string;
  onPageSizeChange: (nextPageSize: string) => void;
}

export const AdminCompaniesTableCard = ({
  companies,
  canManageCompanies,
  pendingActionId,
  onToggleCompany,
  getPageHref,
  onPageSizeChange,
}: AdminCompaniesTableCardProps) => (
  <section className="border-y border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950">
    <div className="flex items-center justify-between border-b border-zinc-200 dark:border-zinc-800 px-6 py-4">
      <div>
        <h2 className="text-lg font-semibold text-zinc-950 dark:text-zinc-100">Company Directory</h2>
        <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-200">Paginated tenant view with account status and quick actions.</p>
      </div>
      <Badge>{companies.totalCount} total</Badge>
    </div>
    <DataTable
      data={companies.items}
      getRowKey={(company) => company.companyId}
      surfaceClassName="border-0"
      columns={[
        {
          id: 'company',
          header: 'Company',
          cell: (company) => <IdentityCell name={company.name} email={company.primaryEmail} />,
          accessor: (company) => company.name,
          sortable: true,
          sortType: 'string',
          widthClassName: 'min-w-[260px]',
        },
        {
          id: 'recruiters',
          header: 'Recruiters',
          cell: (company) => company.recruiterCount,
          accessor: (company) => company.recruiterCount,
          sortable: true,
          sortType: 'number',
        },
        {
          id: 'published-jobs',
          header: 'Published Jobs',
          cell: (company) => company.activeJobs,
          accessor: (company) => company.activeJobs,
          sortable: true,
          sortType: 'number',
        },
        {
          id: 'next-7-days',
          header: 'Next 7 Days',
          cell: (company) => company.upcomingInterviews,
          accessor: (company) => company.upcomingInterviews,
          sortable: true,
          sortType: 'number',
        },
        {
          id: 'status',
          header: 'Status',
          cell: (company) => <AdminStatusBadge isActive={company.isActive} />,
          accessor: (company) => (company.isActive ? 'Active' : 'Inactive'),
          sortable: true,
          sortType: 'string',
        },
        {
          id: 'updated',
          header: 'Updated',
          cell: (company) => updatedAtFormatter.format(new Date(company.updatedAtUtc)),
          accessor: (company) => new Date(company.updatedAtUtc),
          sortable: true,
          sortType: 'date',
        },
        {
          id: 'action',
          header: 'Action',
          align: 'right',
          cell: (company) => (
            <Button
              type="button"
              variant="secondary"
              disabled={!canManageCompanies || pendingActionId === company.companyId}
              onClick={() => void onToggleCompany(company)}
            >
              {pendingActionId === company.companyId ? 'Updating...' : company.isActive ? 'Deactivate' : 'Activate'}
            </Button>
          ),
          cellClassName: 'w-[140px]',
        },
      ]}
    />
    <TablePagination
      page={companies.pageNumber}
      totalPages={companies.totalPages}
      totalCount={companies.totalCount}
      pageSize={companies.pageSize}
      getPageHref={getPageHref}
      onPageSizeChange={(pageSize) => onPageSizeChange(String(pageSize))}
      itemLabel="companies"
      className="px-6"
    />
  </section>
);
