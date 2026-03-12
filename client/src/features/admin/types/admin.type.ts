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
