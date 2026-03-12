import { Badge } from '@shared/components/Badge';
import { Button } from '@shared/components/Button';
import { Card } from '@shared/components/Card';
import { AdminTablePagination } from '@features/admin/components/AdminTablePagination';
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
  previousHref: string;
  nextHref: string;
  onPageSizeChange: (nextPageSize: string) => void;
}

export const AdminCompaniesTableCard = ({
  companies,
  canManageCompanies,
  pendingActionId,
  onToggleCompany,
  previousHref,
  nextHref,
  onPageSizeChange,
}: AdminCompaniesTableCardProps) => (
  <Card className="rounded-2xl border border-zinc-200 bg-white p-0 shadow-sm">
    <div className="flex items-center justify-between border-b border-zinc-200 px-6 py-4">
      <div>
        <h2 className="text-lg font-semibold text-zinc-950">Company Directory</h2>
        <p className="mt-1 text-sm text-zinc-500">Paginated tenant view with account status and quick actions.</p>
      </div>
      <Badge>{companies.totalCount} total</Badge>
    </div>
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-zinc-200 text-sm">
        <thead className="bg-zinc-50 text-left text-xs uppercase tracking-[0.18em] text-zinc-500">
          <tr>
            <th className="px-6 py-3">Company</th>
            <th className="px-6 py-3">Recruiters</th>
            <th className="px-6 py-3">Published Jobs</th>
            <th className="px-6 py-3">Next 7 Days</th>
            <th className="px-6 py-3">Status</th>
            <th className="px-6 py-3">Updated</th>
            <th className="px-6 py-3 text-right">Action</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-zinc-100">
          {companies.items.map((company) => (
            <tr key={company.companyId} className="align-top">
              <td className="px-6 py-4">
                <div className="font-medium text-zinc-900">{company.name}</div>
                <div className="mt-1 text-xs text-zinc-500">{company.primaryEmail ?? 'No primary email'}</div>
              </td>
              <td className="px-6 py-4 text-zinc-700">{company.recruiterCount}</td>
              <td className="px-6 py-4 text-zinc-700">{company.activeJobs}</td>
              <td className="px-6 py-4 text-zinc-700">{company.upcomingInterviews}</td>
              <td className="px-6 py-4">
                <AdminStatusBadge isActive={company.isActive} />
              </td>
              <td className="px-6 py-4 text-zinc-500">{updatedAtFormatter.format(new Date(company.updatedAtUtc))}</td>
              <td className="px-6 py-4 text-right">
                <Button
                  type="button"
                  variant="secondary"
                  disabled={!canManageCompanies || pendingActionId === company.companyId}
                  onClick={() => void onToggleCompany(company)}
                >
                  {pendingActionId === company.companyId ? 'Updating...' : company.isActive ? 'Deactivate' : 'Activate'}
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
    <AdminTablePagination
      pageNumber={companies.pageNumber}
      totalPages={companies.totalPages}
      totalCount={companies.totalCount}
      pageSize={companies.pageSize}
      previousHref={previousHref}
      nextHref={nextHref}
      onPageSizeChange={onPageSizeChange}
    />
  </Card>
);
