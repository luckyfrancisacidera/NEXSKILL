export interface Paged<T> {
  items: T[];
  pageNumber: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
}

export interface SuperAdminDashboardDto {
  summary: {
    totalCompanies: number;
    activeCompanies: number;
    totalRecruiters: number;
    activeRecruiters: number;
    totalJobs: number;
    activeJobs: number;
  };
  companies: Paged<AdminCompanyOverviewDto>;
  companyAdmins: Paged<AdminCompanyAdminOverviewDto>;
  recruiters: Paged<AdminRecruiterOverviewDto>;
}

export interface SuperAdminCompanyAdminsPageDto {
  summary: SuperAdminDashboardDto['summary'];
  companyAdmins: Paged<AdminCompanyAdminOverviewDto>;
}

export interface SuperAdminRecruitersPageDto {
  summary: SuperAdminDashboardDto['summary'];
  recruiters: Paged<AdminRecruiterOverviewDto>;
}

export interface SuperAdminUsersPageDto {
  summary: SuperAdminDashboardDto['summary'];
  users: Paged<AdminUserOverviewDto>;
}

export interface CompanyAdminDashboardDto {
  company: {
    id: string;
    name: string;
    primaryEmail?: string | null;
    location?: string | null;
    isActive: boolean;
  };
  summary: {
    totalRecruiters: number;
    activeRecruiters: number;
    activeJobs: number;
    upcomingInterviews: number;
    totalOffers: number;
    totalHires: number;
  };
  recruiters: Paged<AdminRecruiterOverviewDto>;
}

export interface CompanyRequestListItemDto {
  id: string;
  companyName: string;
  primaryAdminEmail: string;
  requestedPlanId: string;
  requestedPlanName?: string | null;
  billingCycle?: string | null;
  status: string;
  submittedAtUtc: string;
}

export interface SuperAdminCompanyRequestsPageDto {
  requests: Paged<CompanyRequestListItemDto>;
  filters: {
    status: string;
  };
}

export interface CompanyRequestDocumentDto {
  id: string;
  documentType: string;
  originalFileName: string;
  contentType: string;
  canInlinePreview: boolean;
}

export interface CompanyRequestDetailDto {
  id: string;
  companyName: string;
  businessName: string;
  industry: string;
  companySize: string;
  websiteUrl?: string | null;
  description: string;
  country: string;
  cityProvince: string;
  fullAddress: string;
  primaryAdminFullName: string;
  primaryAdminEmail: string;
  primaryAdminPhone: string;
  primaryAdminRole: string;
  requestedPlanId: string;
  requestedPlanName: string;
  billingCycle?: string | null;
  status: string;
  reviewNotes?: string | null;
  submittedAtUtc: string;
  reviewedAtUtc?: string | null;
  documents: CompanyRequestDocumentDto[];
}

export interface CompanySubscriptionSummaryDto {
  planId: string;
  planName: string;
  billingCycle?: string | null;
  status: string;
  startsAtUtc?: string | null;
  endsAtUtc?: string | null;
  daysRemaining: number;
  activeJobPostsUsed: number;
  activeJobPostsMax?: number | null;
  screeningsUsed: number;
  screeningsMax?: number | null;
  remainingJobPosts?: number | null;
  remainingScreenings?: number | null;
  isTrial: boolean;
  canUpgrade: boolean;
  isExpired: boolean;
  analyticsEnabled: boolean;
  restrictionMessage?: string | null;
  usageSharedNoteJobPosts: string;
  usageSharedNoteScreenings: string;
}

export interface CompanyInvitationViewDto {
  companyName: string;
  businessName?: string | null;
  industry?: string | null;
  companySize?: string | null;
  fullAddress?: string | null;
  primaryAdminFullName: string;
  primaryAdminEmail: string;
  role: string;
  planId: string;
  planName: string;
  billingLabel: string;
  reviewNotes?: string | null;
  isTrial: boolean;
  expiresAtUtc: string;
  isExpired: boolean;
  isAccepted: boolean;
  email: string;
}

export interface CompanyEmployeeDto {
  resume_submission_id: string;
  job_id: string;
  jobseeker_user_id?: string;
  hired_by_recruiter_id?: string;
  accepted_offer_id?: string;
  employee_name: string;
  employee_email: string;
  recruiter_name: string;
  recruiter_email?: string | null;
  job_title: string;
  department: string;
  offer_title?: string | null;
  offer_salary_text?: string | null;
  hire_date_utc: string;
}

export interface CompanyAdminEmployeesDto {
  items: CompanyEmployeeDto[];
  pageNumber: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
}

export interface CompanyAdminCandidateDetailLoaderData {
  candidate: import("@features/recruiter/types").ApplicantDetailDto;
}

export interface AdminCompanyOverviewDto {
  companyId: string;
  name: string;
  primaryEmail?: string | null;
  isActive: boolean;
  recruiterCount: number;
  activeJobs: number;
  upcomingInterviews: number;
  updatedAtUtc: string;
}

export interface AdminCompanyAdminOverviewDto {
  userId: string;
  companyId: string;
  companyName: string;
  email: string;
  isActive: boolean;
  createdAtUtc: string;
}

export interface AdminRecruiterOverviewDto {
  profileId: string;
  userId: string;
  companyId: string;
  companyName: string;
  email: string;
  isActive: boolean;
  createdAtUtc: string;
  totalJobs: number;
  activeJobs: number;
  upcomingInterviews: number;
  totalHires: number;
}

export interface AdminUserOverviewDto {
  userId: string;
  name: string;
  email: string;
  role: string;
  isActive: boolean;
  applicationCount: number;
  joinedAtUtc: string;
}

export interface CreateManagedRecruiterPayload {
  email: string;
  password: string;
}

export interface CreateCompanyAccountPayload {
  name: string;
  primaryEmail?: string;
  location?: string;
  adminEmail: string;
  adminPassword: string;
}

export interface AdminCompanyAccountDto {
  company: AdminCompanyOverviewDto;
  companyAdmin: AdminCompanyAdminOverviewDto;
}
