import type { LoaderFunctionArgs } from "react-router-dom";
import { guardProtectedLoader } from "@app/routes/protectedLoader";
import { adminService } from "@features/admin/service/admin.service";
import type {
  CompanyAdminCandidateDetailLoaderData,
  CompanyAdminDashboardDto,
  CompanyAdminEmployeesDto,
  CompanyRequestDetailDto,
  CompanySubscriptionSummaryDto,
  SuperAdminCompanyRequestsPageDto,
  SuperAdminCompanyAdminsPageDto,
  SuperAdminDashboardDto,
  SuperAdminRecruitersPageDto,
  SuperAdminUsersPageDto,
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

// Use to preload super-admin dashboard cards and all three paginated management lists.
export const superAdminDashboardLoader = async ({ request }: LoaderFunctionArgs): Promise<SuperAdminDashboardDto> => {
  const url = new URL(request.url);
  return adminService.getSuperAdminDashboard({
    companiesPage: getPositiveNumber(url.searchParams.get("companiesPage"), 1),
    companyAdminsPage: getPositiveNumber(url.searchParams.get("companyAdminsPage"), 1),
    recruitersPage: getPositiveNumber(url.searchParams.get("recruitersPage"), 1),
    pageSize: getPositiveNumber(url.searchParams.get("pageSize"), 10),
  });
};

// Use to preload the company-admin management screen when only that table needs fresh data.
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

// Use to preload the recruiter management table inside the super-admin area.
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

// Use to preload the standalone user directory for super-admin routes.
export const superAdminUsersLoader = async ({ request }: LoaderFunctionArgs): Promise<SuperAdminUsersPageDto> => {
  const url = new URL(request.url);
  return adminService.getSuperAdminUsers({
    page: getPositiveNumber(url.searchParams.get("page"), 1),
    pageSize: getPositiveNumber(url.searchParams.get("pageSize"), 10),
  });
};

// Use to guard and preload the company-admin dashboard before the page renders.
export const companyAdminDashboardLoader = async ({ request }: LoaderFunctionArgs): Promise<CompanyAdminDashboardDto> => {
  const guard = await guardProtectedLoader({
    allowedRoles: ["companyadmin"],
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

// Use to preload the company employee table and echo back the active search filter.
export const companyAdminEmployeesLoader = async ({ request }: LoaderFunctionArgs): Promise<CompanyAdminEmployeesDto & { filters: { search: string } }> => {
  const guard = await guardProtectedLoader({
    allowedRoles: ["companyadmin"],
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

// Use to preload a specific candidate record when company admins open the detail view.
export const companyAdminCandidateDetailLoader = async ({ params }: LoaderFunctionArgs): Promise<CompanyAdminCandidateDetailLoaderData> => {
  const guard = await guardProtectedLoader({
    allowedRoles: ["companyadmin"],
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

export const superAdminCompanyRequestsLoader = async ({ request }: LoaderFunctionArgs): Promise<SuperAdminCompanyRequestsPageDto> => {
  const url = new URL(request.url);
  const status = url.searchParams.get("status") ?? "";
  const page = getPositiveNumber(url.searchParams.get("page"), 1);
  const pageSize = getPositiveNumber(url.searchParams.get("pageSize"), 10);
  const items = await adminService.getCompanyRequests(status || undefined);
  const totalCount = items.length;
  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));
  const normalizedPage = Math.min(page, totalPages);
  const start = (normalizedPage - 1) * pageSize;

  return {
    requests: {
      items: items.slice(start, start + pageSize),
      pageNumber: normalizedPage,
      pageSize,
      totalCount,
      totalPages,
    },
    filters: {
      status,
    },
  };
};

export const superAdminCompanyRequestDetailLoader = async ({ params }: LoaderFunctionArgs): Promise<CompanyRequestDetailDto> => {
  const requestId = params.requestId;
  if (!requestId) {
    throw new Response("Request not found", { status: 404 });
  }

  return adminService.getCompanyRequestDetail(requestId);
};

export const companyAdminSubscriptionLoader = async (): Promise<CompanySubscriptionSummaryDto> => {
  const guard = await guardProtectedLoader({
    allowedRoles: ["companyadmin"],
    fallback: () => ({
      planId: "",
      planName: "",
      billingCycle: null,
      status: "Unknown",
      startsAtUtc: null,
      endsAtUtc: null,
      daysRemaining: 0,
      activeJobPostsUsed: 0,
      activeJobPostsMax: null,
      screeningsUsed: 0,
      screeningsMax: null,
      remainingJobPosts: null,
      remainingScreenings: null,
      isTrial: false,
      canUpgrade: false,
      isExpired: false,
      analyticsEnabled: false,
      restrictionMessage: null,
      usageSharedNoteJobPosts: "",
      usageSharedNoteScreenings: "",
    }),
    requireCompany: true,
  });

  if (!guard.shouldLoad) {
    return guard.data;
  }

  return adminService.getCompanySubscriptionSummary();
};
