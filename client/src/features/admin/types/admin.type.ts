export interface SuperAdminDashboardDto {
  summary: {
    totalCompanies: number;
    activeCompanies: number;
    totalRecruiters: number;
    activeRecruiters: number;
    totalJobs: number;
    activeJobs: number;
  };
  companies: AdminCompanyOverviewDto[];
  recentRecruiters: AdminRecruiterOverviewDto[];
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
  recruiters: AdminRecruiterOverviewDto[];
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
