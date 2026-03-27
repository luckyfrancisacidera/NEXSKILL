import type { LoaderFunctionArgs } from "react-router-dom";
import { guardProtectedLoader } from "@app/routes/protectedLoader";
import { adminService } from "@features/admin/service/admin.service";
import type {
  CompanyAdminCandidateDetailLoaderData,
  CompanyAdminDashboardDto,
  CompanyAdminEmployeesDto,
  SuperAdminCompanyAdminsPageDto,
  SuperAdminDashboardDto,
  SuperAdminRecruitersPageDto,
} from "@features/admin/types/admin.type";

const getPositiveNumber = (value: string | null, fallback: number) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
};

const createEmptyCompanyAdminDashboard = (): CompanyAdminDashboardDto => ({
  company: {
    id: "",
    name: "Company",
    primaryEmail: null,
    location: null,
    isActive: true,
  },
  summary: {
    totalRecruiters: 0,
    activeRecruiters: 0,
    activeJobs: 0,
    upcomingInterviews: 0,
    totalOffers: 0,
    totalHires: 0,
  },
  recruiters: {
    items: [],
    pageNumber: 1,
    pageSize: 10,
    totalCount: 0,
    totalPages: 1,
  },
});

export const superAdminDashboardLoader = async ({ request }: LoaderFunctionArgs): Promise<SuperAdminDashboardDto> => {
  const url = new URL(request.url);
  return adminService.getSuperAdminDashboard({
    companiesPage: getPositiveNumber(url.searchParams.get("companiesPage"), 1),
    companyAdminsPage: getPositiveNumber(url.searchParams.get("companyAdminsPage"), 1),
    recruitersPage: getPositiveNumber(url.searchParams.get("recruitersPage"), 1),
    pageSize: getPositiveNumber(url.searchParams.get("pageSize"), 10),
  });
};

export const superAdminCompanyAdminsLoader = async ({ request }: LoaderFunctionArgs): Promise<SuperAdminCompanyAdminsPageDto> => {
  const url = new URL(request.url);
  const data = await adminService.getSuperAdminDashboard({
    companiesPage: 1,
    companyAdminsPage: getPositiveNumber(url.searchParams.get("page"), 1),
    recruitersPage: 1,
    pageSize: getPositiveNumber(url.searchParams.get("pageSize"), 10),
  });

  return {
    summary: data.summary,
    companyAdmins: data.companyAdmins,
  };
};

export const superAdminRecruitersLoader = async ({ request }: LoaderFunctionArgs): Promise<SuperAdminRecruitersPageDto> => {
  const url = new URL(request.url);
  const data = await adminService.getSuperAdminDashboard({
    companiesPage: 1,
    companyAdminsPage: 1,
    recruitersPage: getPositiveNumber(url.searchParams.get("page"), 1),
    pageSize: getPositiveNumber(url.searchParams.get("pageSize"), 10),
  });

  return {
    summary: data.summary,
    recruiters: data.recruiters,
  };
};

export const companyAdminDashboardLoader = async ({ request }: LoaderFunctionArgs): Promise<CompanyAdminDashboardDto> => {
  const guard = await guardProtectedLoader({
    allowedRoles: ["companyAdmin"],
    fallback: createEmptyCompanyAdminDashboard,
    requireCompany: true,
  });

  if (!guard.shouldLoad) {
    return guard.data;
  }

  const url = new URL(request.url);
  return adminService.getCompanyAdminDashboard({
    page: getPositiveNumber(url.searchParams.get("page"), 1),
    pageSize: getPositiveNumber(url.searchParams.get("pageSize"), 10),
  });
};

export const companyAdminEmployeesLoader = async ({ request }: LoaderFunctionArgs): Promise<CompanyAdminEmployeesDto & { filters: { search: string } }> => {
  const guard = await guardProtectedLoader({
    allowedRoles: ["companyAdmin"],
    fallback: () => ({
      items: [],
      pageNumber: 1,
      pageSize: 10,
      totalCount: 0,
      totalPages: 1,
      filters: { search: "" },
    }),
    requireCompany: true,
  });

  if (!guard.shouldLoad) {
    return guard.data;
  }

  const url = new URL(request.url);
  const search = url.searchParams.get("search") ?? "";
  const data = await adminService.getCompanyEmployees({
    search: search || undefined,
    page: getPositiveNumber(url.searchParams.get("page"), 1),
    pageSize: getPositiveNumber(url.searchParams.get("pageSize"), 10),
  });

  return {
    ...data,
    filters: {
      search,
    },
  };
};

export const companyAdminCandidateDetailLoader = async ({ params }: LoaderFunctionArgs): Promise<CompanyAdminCandidateDetailLoaderData> => {
  const guard = await guardProtectedLoader({
    allowedRoles: ["companyAdmin"],
    fallback: () => ({ candidate: null as never }),
    requireCompany: true,
  });

  if (!guard.shouldLoad) {
    return guard.data;
  }

  const submissionId = params.candidateId;
  if (!submissionId) {
    throw new Response("Candidate not found", { status: 404 });
  }

  const candidate = await adminService.getCompanyApplicantBySubmissionId(submissionId);
  return { candidate };
};
