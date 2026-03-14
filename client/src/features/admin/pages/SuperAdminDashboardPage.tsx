import { useState } from 'react';
import { useLoaderData, useNavigate, useRevalidator, useSearchParams } from 'react-router-dom';
import { ApiError } from '@shared/api/http';
import { Button } from '@shared/components/Button';
import { usePermissions } from '@shared/hooks/usePermissions';
import { AdminCompaniesTableCard } from '@features/admin/components/AdminCompaniesTableCard';
import { AdminMetricCard } from '@features/admin/components/AdminMetricCard';
import { CreateCompanyModal } from '@features/admin/components/CreateCompanyModal';
import { useAdminActivationAction } from '@features/admin/hooks/useAdminActivationAction';
import { adminService } from '@features/admin/service/admin.service';
import type {
  AdminCompanyOverviewDto,
  CreateCompanyAccountPayload,
  SuperAdminDashboardDto,
} from '@features/admin/types/admin.type';

export const SuperAdminDashboardPage = () => {
  const data = useLoaderData() as SuperAdminDashboardDto;
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const revalidator = useRevalidator();
  const { canManageCompanies } = usePermissions();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);
  const [isCreatingCompany, setIsCreatingCompany] = useState(false);

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
      <div className="space-y-6 ">
        <section className=" rounded-[28px] border dark:border-[#19191f] border-zinc-200 bg-[radial-gradient(circle_at_top_left,_rgba(15,23,42,0.06),_transparent_50%),linear-gradient(135deg,_#fafaf9,_#ffffff)] dark:bg-[radial-gradient(circle_at_top_left,_rgba(15,23,42,0.06),_transparent_50%),linear-gradient(135deg,_#19191f,_#09090b)] p-8 shadow-sm">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div >
              <p className="text-sm text-zinc-500 font-semibold dark:text-zinc-400 uppercase tracking-[0.24em] ">Super Admin</p>
              <h1 className="mt-3 text-3xl font-semibold  text-zinc-950 dark:text-zinc-100">Platform oversight across every company</h1>
              <p className="mt-3 max-w-3xl text-sm leading-6 text-zinc-600 dark:text-zinc-400">
                Monitor tenant health, provision new company tenants, and jump into dedicated admin account management screens when you need to act.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Button type="button" variant="secondary" onClick={() => navigate('/admin/super/company-admins')}>
                Manage company admins
              </Button>
              <Button type="button" variant="secondary" onClick={() => navigate('/admin/super/recruiters')}>
                Manage recruiters
              </Button>
              <Button type="button" onClick={() => setIsCreateModalOpen(true)} disabled={!canManageCompanies}>
                Create company account
              </Button>
            </div>
          </div>
        </section>

        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3 ">
          <AdminMetricCard label="Total Companies" value={data.summary.totalCompanies} accent="border-sky-200 bg-sky-50 text-sky-700" />
          <AdminMetricCard label="Active Companies" value={data.summary.activeCompanies} accent="border-emerald-200 bg-emerald-50 text-emerald-700" />
          <AdminMetricCard label="Recruiters" value={data.summary.totalRecruiters} accent="border-amber-200 bg-amber-50 text-amber-700" />
          <AdminMetricCard label="Active Recruiters" value={data.summary.activeRecruiters} accent="border-violet-200 bg-violet-50 text-violet-700" />
          <AdminMetricCard label="All Jobs" value={data.summary.totalJobs} accent="border-rose-200 bg-rose-50 text-rose-700" />
          <AdminMetricCard label="Published Jobs" value={data.summary.activeJobs} accent="border-cyan-200 bg-cyan-50 text-cyan-700" />
        </section>

        <AdminCompaniesTableCard
          companies={data.companies}
          canManageCompanies={canManageCompanies}
          pendingActionId={pendingActionId}
          onToggleCompany={runAction}
          previousHref={buildQuery({ companiesPage: String(Math.max(1, data.companies.pageNumber - 1)) })}
          nextHref={buildQuery({ companiesPage: String(Math.min(data.companies.totalPages, data.companies.pageNumber + 1)) })}
          onPageSizeChange={(nextPageSize) => updatePageSize(nextPageSize, 'companiesPage')}
        />
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
