import { Badge } from '@shared/components/Badge';
import { Button } from '@shared/components/Button';
import { Card } from '@shared/components/Card';
import { AdminTablePagination } from '@features/admin/components/AdminTablePagination';
import { AdminStatusBadge } from '@features/admin/components/AdminStatusBadge';
import type { AdminRecruiterOverviewDto, Paged } from '@features/admin/types/admin.type';

const createdAtFormatter = new Intl.DateTimeFormat('en-US', {
  month: 'short',
  day: 'numeric',
  year: 'numeric',
});

interface AdminRecruitersTableCardProps {
  recruiters: Paged<AdminRecruiterOverviewDto>;
  canManageRecruiters: boolean;
  pendingActionId: string | null;
  onToggleRecruiter: (recruiter: AdminRecruiterOverviewDto) => Promise<void>;
  previousHref: string;
  nextHref: string;
  onPageSizeChange: (nextPageSize: string) => void;
}

export const AdminRecruitersTableCard = ({
  recruiters,
  canManageRecruiters,
  pendingActionId,
  onToggleRecruiter,
  previousHref,
  nextHref,
  onPageSizeChange,
}: AdminRecruitersTableCardProps) => (
  <Card className="rounded-2xl border border-zinc-200 bg-white p-0 shadow-sm">
    <div className="flex items-center justify-between border-b border-zinc-200 px-6 py-4">
      <div>
        <h2 className="text-lg font-semibold text-zinc-950">Recruiter Accounts</h2>
        <p className="mt-1 text-sm text-zinc-500">Paginated recruiter roster across all companies.</p>
      </div>
      <Badge>{recruiters.totalCount} total</Badge>
    </div>
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-zinc-200 text-sm">
        <thead className="bg-zinc-50 text-left text-xs uppercase tracking-[0.18em] text-zinc-500">
          <tr>
            <th className="px-6 py-3">Recruiter</th>
            <th className="px-6 py-3">Company</th>
            <th className="px-6 py-3">Jobs</th>
            <th className="px-6 py-3">Upcoming Interviews</th>
            <th className="px-6 py-3">Hires</th>
            <th className="px-6 py-3">Status</th>
            <th className="px-6 py-3 text-right">Action</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-zinc-100">
          {recruiters.items.map((recruiter) => (
            <tr key={recruiter.userId}>
              <td className="px-6 py-4">
                <div className="font-medium text-zinc-900">{recruiter.email}</div>
                <div className="mt-1 text-xs text-zinc-500">Joined {createdAtFormatter.format(new Date(recruiter.createdAtUtc))}</div>
              </td>
              <td className="px-6 py-4 text-zinc-700">{recruiter.companyName}</td>
              <td className="px-6 py-4 text-zinc-700">{recruiter.activeJobs}/{recruiter.totalJobs}</td>
              <td className="px-6 py-4 text-zinc-700">{recruiter.upcomingInterviews}</td>
              <td className="px-6 py-4 text-zinc-700">{recruiter.totalHires}</td>
              <td className="px-6 py-4">
                <AdminStatusBadge isActive={recruiter.isActive} />
              </td>
              <td className="px-6 py-4 text-right">
                <Button
                  type="button"
                  variant="secondary"
                  disabled={!canManageRecruiters || pendingActionId === recruiter.userId}
                  onClick={() => void onToggleRecruiter(recruiter)}
                >
                  {pendingActionId === recruiter.userId ? 'Updating...' : recruiter.isActive ? 'Deactivate' : 'Activate'}
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
    <AdminTablePagination
      pageNumber={recruiters.pageNumber}
      totalPages={recruiters.totalPages}
      totalCount={recruiters.totalCount}
      pageSize={recruiters.pageSize}
      previousHref={previousHref}
      nextHref={nextHref}
      onPageSizeChange={onPageSizeChange}
    />
  </Card>
);
