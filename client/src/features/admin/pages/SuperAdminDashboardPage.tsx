import { useMemo, useState } from 'react';
import { useLoaderData, useNavigate, useRevalidator, useSearchParams } from 'react-router-dom';
import { Building2, BriefcaseBusiness, Globe2, ShieldCheck, Users } from 'lucide-react';

import { ApiError } from '@shared/api/http';
import { Avatar } from '@shared/components/Avatar';
import { Button } from '@shared/components/Button';
import { DashboardGreeting } from '@shared/components/DashboardGreeting';
import {
  DashboardEmptyState,
  DashboardPageHeader,
  DashboardRankItem,
  DashboardSectionCard,
  DashboardStatCard,
} from '@shared/components/DashboardPrimitives';
import { usePermissions } from '@shared/hooks/usePermissions';
import { AdminCompaniesTableCard } from '@features/admin/components/AdminCompaniesTableCard';
import { CreateCompanyModal } from '@features/admin/components/CreateCompanyModal';
import { useAdminActivationAction } from '@features/admin/hooks/useAdminActivationAction';
import { adminService } from '@features/admin/service/admin.service';
import type {
  AdminCompanyOverviewDto,
  CreateCompanyAccountPayload,
  SuperAdminDashboardDto,
} from '@features/admin/types/admin.type';

const getCompanyScore = (company: AdminCompanyOverviewDto) => company.activeJobs * 100 + company.recruiterCount * 10 + company.upcomingInterviews;

export const SuperAdminDashboardPage = () => {
  const data = useLoaderData() as SuperAdminDashboardDto;
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const revalidator = useRevalidator();
  const { canManageCompanies } = usePermissions();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);
  const [isCreatingCompany, setIsCreatingCompany] = useState(false);

  const topCompanies = useMemo(
    () => [...data.companies.items].sort((left, right) => getCompanyScore(right) - getCompanyScore(left)).slice(0, 5),
    [data.companies.items],
  );

  const topRecruiters = useMemo(
    () =>
      [...data.recruiters.items]
        .sort((left, right) => (right.totalHires * 100 + right.activeJobs * 10) - (left.totalHires * 100 + left.activeJobs * 10))
        .slice(0, 5),
    [data.recruiters.items],
  );

  const { pendingActionId, runAction } = useAdminActivationAction<AdminCompanyOverviewDto>({
    canManage: canManageCompanies,
    getId: (company) => company.companyId,
    isActive: (company) => company.isActive,
    activate: (company) => adminService.activateCompany(company.companyId),
    deactivate: (company) => adminService.deactivateCompany(company.companyId),
    copy: {
      title: (activate) => activate ? 'Activate company' : 'Deactivate company',
      message: (activate, company) => `${activate ? 'Activate' : 'Deactivate'} ${company.name}?`,
    },
    onCompleted: () => revalidator.revalidate(),
  });

  const buildQuery = (updates: Record<string, string>) => {
    const next = new URLSearchParams(searchParams);
    Object.entries(updates).forEach(([key, value]) => {
      next.set(key, value);
    });
    return `?${next.toString()}`;
  };

  const updatePageSize = (nextPageSize: string, pageKey: string) => {
    navigate(buildQuery({ pageSize: nextPageSize, [pageKey]: '1' }));
  };

  const handleCreateCompany = async (payload: CreateCompanyAccountPayload) => {
    setCreateError(null);
    setIsCreatingCompany(true);

    try {
      await adminService.createCompanyAccount(payload);
      setIsCreateModalOpen(false);
      revalidator.revalidate();
    } catch (error) {
      setCreateError(error instanceof ApiError ? error.message : 'Could not create company account.');
      throw error;
    } finally {
      setIsCreatingCompany(false);
    }
  };

  return (
    <>
      <div className="space-y-6">
        <DashboardPageHeader
          eyebrow="Super Admin"
          title="Platform oversight across every company"
          description="Monitor tenant health, discover leading companies and recruiters, and jump into management workflows without losing the global picture."
          actions={
            <>
              <Button type="button" variant="secondary" onClick={() => navigate('/admin/super/company-admins')}>
                Manage company admins
              </Button>
              <Button type="button" variant="secondary" onClick={() => navigate('/admin/super/recruiters')}>
                Manage recruiters
              </Button>
              <Button type="button" onClick={() => setIsCreateModalOpen(true)} disabled={!canManageCompanies}>
                Create company account
              </Button>
            </>
          }
        />

        <DashboardGreeting
          badge="Platform health"
          subtitle="Here's what's happening today across tenant activity, recruiter coverage, and company performance."
          stats={[
            { label: 'Companies', value: data.summary.totalCompanies },
            { label: 'Active jobs', value: data.summary.activeJobs },
          ]}
        />

        <section className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <DashboardStatCard
            label="Total Companies"
            value={data.summary.totalCompanies}
            helper="All tenants on the platform"
            icon={Globe2}
            iconClassName="bg-sky-100 text-sky-700 dark:bg-sky-950/60 dark:text-sky-300"
          />
          <DashboardStatCard
            label="Active Companies"
            value={data.summary.activeCompanies}
            helper="Companies currently enabled"
            icon={ShieldCheck}
            iconClassName="bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300"
          />
          <DashboardStatCard
            label="Recruiters"
            value={data.summary.totalRecruiters}
            helper="Recruiter accounts across all companies"
            icon={Users}
            iconClassName="bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300"
          />
          <DashboardStatCard
            label="Published Jobs"
            value={data.summary.activeJobs}
            helper="Currently active jobs on the platform"
            icon={BriefcaseBusiness}
            iconClassName="bg-violet-100 text-violet-700 dark:bg-violet-950/60 dark:text-violet-300"
          />
        </section>

        <section className="grid gap-6 xl:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)]">
          <DashboardSectionCard
            title="Top Companies"
            description="Ranked with the best available metrics from the current dashboard response."
          >
            {topCompanies.length > 0 ? (
              <div className="space-y-3">
                {topCompanies.map((company, index) => (
                  <DashboardRankItem
                    key={company.companyId}
                    rank={index + 1}
                    title={company.name}
                    subtitle={company.primaryEmail ?? 'No primary email set'}
                    meta={[
                      `${company.recruiterCount} recruiters`,
                      `${company.activeJobs} active jobs`,
                      `${company.upcomingInterviews} interviews`,
                    ]}
                  />
                ))}
              </div>
            ) : (
              <DashboardEmptyState
                compact
                icon={Building2}
                title="No company performance data yet"
                description="Top companies will appear here once tenants start posting jobs and generating hiring activity."
              />
            )}
          </DashboardSectionCard>

          <DashboardSectionCard
            title="Top Recruiters"
            description="Ranked from hires and active jobs across the current super admin dashboard feed."
          >
            {topRecruiters.length > 0 ? (
              <div className="space-y-3">
                {topRecruiters.map((recruiter, index) => (
                  <DashboardRankItem
                    key={recruiter.userId}
                    rank={index + 1}
                    avatar={<Avatar name={recruiter.email} />}
                    title={recruiter.email}
                    subtitle={recruiter.companyName}
                    meta={[
                      `${recruiter.totalHires} hires`,
                      `${recruiter.activeJobs}/${recruiter.totalJobs} jobs`,
                    ]}
                  />
                ))}
              </div>
            ) : (
              <DashboardEmptyState
                compact
                icon={Users}
                title="No recruiter activity yet"
                description="Top recruiters will appear here once recruiter records and hiring activity are available."
              />
            )}
          </DashboardSectionCard>
        </section>

        <AdminCompaniesTableCard
          companies={data.companies}
          canManageCompanies={canManageCompanies}
          pendingActionId={pendingActionId}
          onToggleCompany={runAction}
          getPageHref={(page) => buildQuery({ companiesPage: String(page) })}
          onPageSizeChange={(nextPageSize) => updatePageSize(nextPageSize, 'companiesPage')}
        />

        <section className="grid gap-6 md:grid-cols-2">
          <DashboardSectionCard title="Recruiter Coverage" description="Platform-wide recruiter totals for quick health checks.">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-2xl border border-zinc-200 bg-zinc-50/70 p-4 dark:border-zinc-800 dark:bg-zinc-900/60">
                <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">Total recruiters</p>
                <p className="mt-2 text-3xl font-semibold text-zinc-950 dark:text-zinc-100">{data.summary.totalRecruiters}</p>
              </div>
              <div className="rounded-2xl border border-zinc-200 bg-zinc-50/70 p-4 dark:border-zinc-800 dark:bg-zinc-900/60">
                <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">Active recruiters</p>
                <p className="mt-2 text-3xl font-semibold text-zinc-950 dark:text-zinc-100">{data.summary.activeRecruiters}</p>
              </div>
            </div>
          </DashboardSectionCard>

          <DashboardSectionCard title="Job Coverage" description="High-level platform volume for active and historical jobs.">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-2xl border border-zinc-200 bg-zinc-50/70 p-4 dark:border-zinc-800 dark:bg-zinc-900/60">
                <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">All jobs</p>
                <p className="mt-2 text-3xl font-semibold text-zinc-950 dark:text-zinc-100">{data.summary.totalJobs}</p>
              </div>
              <div className="rounded-2xl border border-zinc-200 bg-zinc-50/70 p-4 dark:border-zinc-800 dark:bg-zinc-900/60">
                <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">Published jobs</p>
                <p className="mt-2 text-3xl font-semibold text-zinc-950 dark:text-zinc-100">{data.summary.activeJobs}</p>
              </div>
            </div>
          </DashboardSectionCard>
        </section>
      </div>

      <CreateCompanyModal
        open={isCreateModalOpen}
        isSubmitting={isCreatingCompany}
        error={createError}
        onClose={() => {
          setCreateError(null);
          setIsCreateModalOpen(false);
        }}
        onSubmit={handleCreateCompany}
      />
    </>
  );
};
