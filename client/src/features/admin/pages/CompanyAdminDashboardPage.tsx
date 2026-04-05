import { useMemo, useState } from 'react';
import { useLoaderData, useNavigate, useRevalidator, useSearchParams } from 'react-router-dom';
import { BadgeCheck, BriefcaseBusiness, Building2, Trophy, Users } from 'lucide-react';

import { ApiError } from '@shared/api/http';
import { Avatar } from '@shared/components/data-display/Avatar';
import { Badge } from '@shared/components/data-display/Badge';
import { Button } from '@shared/components/actions/Button';
import { Card } from '@shared/components/data-display/Card';
import { DashboardGreeting } from '@shared/components/layout/DashboardGreeting';
import {
  DashboardEmptyState,
  DashboardPageHeader,
  DashboardRankItem,
  DashboardSectionCard,
  DashboardStatCard,
} from '@shared/components/layout/DashboardPrimitives';
import { DataTable } from '@shared/components/data-display/data-table/DataTable';
import { IdentityCell } from '@shared/components/data-display/data-table/IdentityCell';
import { TablePagination } from '@shared/components/data-display/data-table/TablePagination';
import { TablePageSizeControl } from '@shared/components/data-display/data-table/TablePageSizeControl';
import type { DataTableColumn } from '@shared/components/data-display/data-table/table-types';
import { useConfirmation } from '@shared/hooks/useConfirmation';
import { usePermissions } from '@shared/hooks/usePermissions';
import { CreateRecruiterModal } from '@features/admin/components/CreateRecruiterModal';
import { adminService } from '@features/admin/service/admin.service';
import type {
  AdminRecruiterOverviewDto,
  CompanyAdminDashboardDto,
  CreateManagedRecruiterPayload,
} from '@features/admin/types/admin.type';

const dateFormatter = new Intl.DateTimeFormat('en-US', {
  month: 'short',
  day: 'numeric',
  year: 'numeric',
});

const getStatusClassName = (isActive: boolean) =>
  isActive ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' : 'bg-zinc-100 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400';

const getRecruiterScore = (recruiter: AdminRecruiterOverviewDto) =>
  recruiter.totalHires * 100 + recruiter.activeJobs * 10 + recruiter.upcomingInterviews;
const getEmailDisplayName = (email: string) =>
  email
    .split('@')[0]
    .replace(/[._-]+/g, ' ')
    .replace(/\b\w/g, (value) => value.toUpperCase());

export const CompanyAdminDashboardPage = () => {
  const data = useLoaderData() as CompanyAdminDashboardDto;
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const revalidator = useRevalidator();
  const confirm = useConfirmation();
  const { canManageRecruiters } = usePermissions();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [formSuccess, setFormSuccess] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [pendingUserId, setPendingUserId] = useState<string | null>(null);

  const topRecruiters = useMemo(
    () => [...data.recruiters.items].sort((left, right) => getRecruiterScore(right) - getRecruiterScore(left)).slice(0, 5),
    [data.recruiters.items],
  );

  const buildQuery = (updates: Record<string, string>) => {
    const next = new URLSearchParams(searchParams);
    Object.entries(updates).forEach(([key, value]) => {
      next.set(key, value);
    });
    return `?${next.toString()}`;
  };

  const handleCreateRecruiter = async (payload: CreateManagedRecruiterPayload) => {
    setFormError(null);
    setFormSuccess(null);

    if (!canManageRecruiters) {
      setFormError('You do not have permission to manage recruiters in this company.');
      return;
    }

    setIsCreating(true);
    try {
      await adminService.createCompanyRecruiter(payload);
      setIsCreateModalOpen(false);
      setFormSuccess('Recruiter account created successfully.');
      revalidator.revalidate();
    } catch (error) {
      const message = error instanceof ApiError ? error.message : 'Could not create recruiter.';
      setFormError(message);
      throw error;
    } finally {
      setIsCreating(false);
    }
  };

  const handleRecruiterAction = async (recruiter: AdminRecruiterOverviewDto) => {
    if (!canManageRecruiters) {
      return;
    }

    const activate = !recruiter.isActive;
    const confirmed = await confirm({
      title: activate ? 'Activate recruiter' : 'Deactivate recruiter',
      message: `${activate ? 'Activate' : 'Deactivate'} recruiter ${recruiter.email}?`,
      confirmLabel: activate ? 'Activate' : 'Deactivate',
      accent: activate ? 'green' : 'red',
    });

    if (!confirmed) {
      return;
    }

    setFormError(null);
    setFormSuccess(null);
    setPendingUserId(recruiter.userId);
    try {
      if (activate) {
        await adminService.activateCompanyRecruiter(recruiter.userId);
        setFormSuccess(`Activated ${recruiter.email}.`);
      } else {
        await adminService.deactivateCompanyRecruiter(recruiter.userId);
        setFormSuccess(`Deactivated ${recruiter.email}.`);
      }
      revalidator.revalidate();
    } catch (error) {
      setFormError(error instanceof ApiError ? error.message : `Could not ${activate ? 'activate' : 'deactivate'} recruiter.`);
    } finally {
      setPendingUserId(null);
    }
  };

  const recruiterColumns: Array<DataTableColumn<AdminRecruiterOverviewDto>> = [
    {
      id: 'recruiter',
      header: 'Recruiter',
      cell: (recruiter) => (
        <IdentityCell
          name={recruiter.email}
          email={`Joined ${dateFormatter.format(new Date(recruiter.createdAtUtc))}`}
        />
      ),
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
      cell: (recruiter) => (
        <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${getStatusClassName(recruiter.isActive)}`}>
          {recruiter.isActive ? 'Active' : 'Inactive'}
        </span>
      ),
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
          className="min-w-28"
          disabled={!canManageRecruiters}
          loading={pendingUserId === recruiter.userId}
          loadingText="Updating"
          onClick={() => void handleRecruiterAction(recruiter)}
        >
          {recruiter.isActive ? 'Deactivate' : 'Activate'}
        </Button>
      ),
      cellClassName: 'w-[140px]',
    },
  ];

  return (
    <>
      <div className="space-y-5 sm:space-y-6">
        <DashboardPageHeader
          eyebrow="Company Admin"
          title={data.company.name}
          description="Monitor recruiter health, hiring throughput, and team performance from a cleaner company-wide dashboard."
          actions={
            <Button type="button" onClick={() => setIsCreateModalOpen(true)} disabled={!canManageRecruiters}>
              Create recruiter
            </Button>
          }
        />

        <DashboardGreeting
          badge="Company snapshot"
          subtitle={`Here's what's happening today across ${data.company.name}, from recruiter activity to hiring momentum.`}
          stats={[
            { label: 'Recruiters', value: data.summary.totalRecruiters },
            { label: 'Hires', value: data.summary.totalHires },
          ]}
        />

        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <DashboardStatCard
            label="Recruiters"
            value={data.summary.totalRecruiters}
            helper="All recruiter accounts in this company"
            icon={Users}
            iconClassName="bg-sky-100 text-sky-700 dark:bg-sky-950/60 dark:text-sky-300"
          />
          <DashboardStatCard
            label="Active Recruiters"
            value={data.summary.activeRecruiters}
            helper="Recruiters currently active and able to work"
            icon={BadgeCheck}
            iconClassName="bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300"
          />
          <DashboardStatCard
            label="Published Jobs"
            value={data.summary.activeJobs}
            helper="Open jobs contributing to company visibility"
            icon={BriefcaseBusiness}
            iconClassName="bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300"
          />
          <DashboardStatCard
            label="Hires"
            value={data.summary.totalHires}
            helper="Confirmed hires attributed to your recruiters"
            icon={Trophy}
            iconClassName="bg-violet-100 text-violet-700 dark:bg-violet-950/60 dark:text-violet-300"
          />
        </section>

        {formError ? (
          <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700 dark:border-rose-900 dark:bg-rose-950/40 dark:text-rose-300">{formError}</div>
        ) : null}
        {formSuccess ? (
          <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-300">{formSuccess}</div>
        ) : null}

        <section className="grid gap-6 xl:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)]">
          <DashboardSectionCard
            title="Top Recruiters"
            description="Ranked from the current dashboard payload using hires, active jobs, and upcoming interviews."
          >
            {topRecruiters.length > 0 ? (
              <div className="space-y-3">
                {topRecruiters.map((recruiter, index) => (
                  <DashboardRankItem
                    key={recruiter.userId}
                    rank={index + 1}
                    avatar={<Avatar name={recruiter.email} email={recruiter.email} className="h-9 w-9 sm:h-10 sm:w-10" />}
                    title={getEmailDisplayName(recruiter.email)}
                    subtitle={recruiter.email}
                    meta={[
                      `Joined ${dateFormatter.format(new Date(recruiter.createdAtUtc))}`,
                      `${recruiter.totalHires} hires`,
                      `${recruiter.activeJobs}/${recruiter.totalJobs} jobs`,
                      `${recruiter.upcomingInterviews} interviews`,
                    ]}
                  />
                ))}
              </div>
            ) : (
              <DashboardEmptyState
                compact
                icon={Users}
                title="No recruiter activity yet"
                description="Recruiter rankings will appear here once the company has recruiter records and hiring activity."
              />
            )}
          </DashboardSectionCard>

          <DashboardSectionCard
            title="Top Recruited Job Posts"
            description="Performance insights for the company admin."
          >
            <DashboardEmptyState
              compact
              icon={Building2}
              title="No top job posts yet"
              description="The current company admin dashboard response does not expose job-post ranking data yet, so this section stays gracefully empty until that feed is available."
            />
          </DashboardSectionCard>
        </section>

        <section className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_320px] xl:gap-6">
          <Card className="border-y border-zinc-200 bg-white p-0 shadow-none dark:border-zinc-800 dark:bg-zinc-950">
            <div className="flex flex-wrap items-start justify-between gap-3 border-b border-zinc-200 px-4 py-4 dark:border-zinc-800 sm:px-6">
              <div className="min-w-0 flex-1">
                <h2 className="text-lg font-semibold text-zinc-950 dark:text-zinc-100">Recruiter Management</h2>
                <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">Create recruiter accounts and monitor team activity at a glance.</p>
              </div>
              <div className="ml-auto flex w-full flex-wrap items-center justify-between gap-2 sm:w-auto sm:justify-end">
                <Badge>{data.recruiters.totalCount} recruiters</Badge>
                <TablePageSizeControl
                  value={data.recruiters.pageSize}
                  onChange={(pageSize) => navigate(buildQuery({ page: '1', pageSize: String(pageSize) }))}
                />
              </div>
            </div>
            <DataTable
              data={data.recruiters.items}
              columns={recruiterColumns}
              getRowKey={(recruiter) => recruiter.userId}
              surfaceClassName="border-0"
            />
            <TablePagination
              page={data.recruiters.pageNumber}
              totalPages={data.recruiters.totalPages}
              totalCount={data.recruiters.totalCount}
              pageSize={data.recruiters.pageSize}
              getPageHref={(page) => buildQuery({ page: String(page) })}
              itemLabel="recruiters"
              className="px-4 sm:px-6"
              showPageSizeSelector={false}
            />
          </Card>

          <DashboardSectionCard title="Company Status" description="Core company setup details for the current admin context.">
            <div className="space-y-4 text-sm text-zinc-600 dark:text-zinc-400">
              <div>
                <div className="font-medium text-zinc-900 dark:text-zinc-100">Primary email</div>
                <div className="mt-1">{data.company.primaryEmail ?? 'No primary email set'}</div>
              </div>
              <div>
                <div className="font-medium text-zinc-900 dark:text-zinc-100">Location</div>
                <div className="mt-1">{data.company.location ?? 'Location can be added during setup'}</div>
              </div>
              <div>
                <div className="font-medium text-zinc-900 dark:text-zinc-100">Status</div>
                <div className="mt-2">
                  <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${getStatusClassName(data.company.isActive)}`}>
                    {data.company.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>
              </div>
              <div>
                <div className="font-medium text-zinc-900 dark:text-zinc-100">Offers in progress</div>
                <div className="mt-1">{data.summary.totalOffers}</div>
              </div>
            </div>
          </DashboardSectionCard>
        </section>
      </div>

      <CreateRecruiterModal
        open={isCreateModalOpen}
        companyName={data.company.name}
        isSubmitting={isCreating}
        error={formError}
        onClose={() => {
          setFormError(null);
          setIsCreateModalOpen(false);
        }}
        onSubmit={handleCreateRecruiter}
      />
    </>
  );
};

