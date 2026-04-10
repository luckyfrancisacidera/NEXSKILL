import { http } from '@shared/api/http';
import type {
  AdminCompanyAccountDto,
  AcceptCompanyInvitationPayload,
  CompanyAdminCandidateDetailLoaderData,
  CompanyAdminDashboardDto,
  CompanyAdminEmployeesDto,
  CompanyInvitationViewDto,
  CompanyRequestDetailDto,
  CompanyRequestListItemDto,
  CompanySubscriptionSummaryDto,
  CreateCompanyAccountPayload,
  CreateManagedRecruiterPayload,
  SuperAdminDashboardDto,
  SuperAdminUsersPageDto,
} from '@features/admin/types/admin.type';

// Handles super-admin and company-admin API calls for dashboards, account creation, and activation flows.
export const adminService = {
  // Use to fetch the super-admin dashboard summary plus the paginated company, admin, and recruiter lists.
  async getSuperAdminDashboard(params: {
    companiesPage: number;
    companyAdminsPage: number;
    recruitersPage: number;
    pageSize: number;
  }): Promise<SuperAdminDashboardDto> {
    const response = await http.get<SuperAdminDashboardDto>('/api/admin/super/dashboard', {
      params,
    });
    return response.data;
  },

  // Use to fetch the company-admin dashboard and its recruiter summary table.
  async getCompanyAdminDashboard(params: { page: number; pageSize: number }): Promise<CompanyAdminDashboardDto> {
    const response = await http.get<CompanyAdminDashboardDto>('/api/admin/company/dashboard', {
      params,
    });
    return response.data;
  },

  async getCompanyRequests(status?: string): Promise<CompanyRequestListItemDto[]> {
    const response = await http.get<CompanyRequestListItemDto[]>("/api/company-requests", {
      params: status ? { status } : undefined,
    });
    return response.data;
  },

  async getCompanyRequestDetail(requestId: string): Promise<CompanyRequestDetailDto> {
    const response = await http.get<CompanyRequestDetailDto>(`/api/company-requests/${requestId}`);
    return response.data;
  },

  async reviewCompanyRequest(requestId: string, payload: { approve: boolean; reviewNotes?: string }) {
    const response = await http.post<CompanyRequestDetailDto>(`/api/company-requests/${requestId}/review`, payload);
    return response.data;
  },

  async getCompanySubscriptionSummary(): Promise<CompanySubscriptionSummaryDto> {
    const response = await http.get<CompanySubscriptionSummaryDto>("/api/company/subscription/summary");
    return response.data;
  },

  async getInvitation(token: string): Promise<CompanyInvitationViewDto> {
    const response = await http.get<CompanyInvitationViewDto>("/api/company-requests/invitations/view", {
      params: { token },
    });
    return response.data;
  },

  async acceptInvitation(token: string, payload: AcceptCompanyInvitationPayload) {
    await http.post("/api/company-requests/invitations/accept", payload, {
      params: { token },
    });
  },

  // Use to load the super-admin user directory with the current page settings.
  async getSuperAdminUsers(params: { page: number; pageSize: number }): Promise<SuperAdminUsersPageDto> {
    const response = await http.get<SuperAdminUsersPageDto>('/api/admin/super/users', {
      params,
    });
    return response.data;
  },

  // Use to fetch the employee list that company admins manage inside their organization workspace.
  async getCompanyEmployees(params: { page: number; pageSize: number; search?: string }): Promise<CompanyAdminEmployeesDto> {
    const response = await http.get<CompanyAdminEmployeesDto>('/api/admin/company/employees', {
      params,
    });
    return response.data;
  },

  // Use to load a candidate record by submission id for the company-admin candidate detail screen.
  async getCompanyApplicantBySubmissionId(submissionId: string): Promise<CompanyAdminCandidateDetailLoaderData["candidate"]> {
    const response = await http.get<CompanyAdminCandidateDetailLoaderData["candidate"]>(`/api/admin/company/applicants/${submissionId}`);
    return response.data;
  },

  // Use to request a secure resume download link for a company-admin candidate review flow.
  async getCompanyApplicantResumeDownload(submissionId: string): Promise<{ downloadUrl: string; fileName: string }> {
    const response = await http.get<{ downloadUrl: string; fileName: string }>(`/api/admin/company/applicants/${submissionId}/resume/download`);
    return response.data;
  },

  // Handles creation of a managed company account from the super-admin workspace.
  async createCompanyAccount(payload: CreateCompanyAccountPayload): Promise<AdminCompanyAccountDto> {
    const response = await http.post<AdminCompanyAccountDto>('/api/admin/super/companies', payload);
    return response.data;
  },

  // Handles reactivating a company account that was previously disabled by a super admin.
  async activateCompany(companyId: string) {
    await http.post(`/api/admin/super/companies/${companyId}/activate`);
  },

  // Handles disabling a company account from the super-admin workspace.
  async deactivateCompany(companyId: string) {
    await http.post(`/api/admin/super/companies/${companyId}/deactivate`);
  },

  // Handles reactivating a managed company admin account.
  async activateCompanyAdmin(adminUserId: string) {
    await http.post(`/api/admin/super/company-admins/${adminUserId}/activate`);
  },

  // Handles disabling a company admin account from the super-admin workspace.
  async deactivateCompanyAdmin(adminUserId: string) {
    await http.post(`/api/admin/super/company-admins/${adminUserId}/deactivate`);
  },

  // Handles reactivating a recruiter account from the super-admin management screens.
  async activateRecruiterBySuperAdmin(recruiterUserId: string) {
    await http.post(`/api/admin/super/recruiters/${recruiterUserId}/activate`);
  },

  // Handles disabling a recruiter account from the super-admin management screens.
  async deactivateRecruiterBySuperAdmin(recruiterUserId: string) {
    await http.post(`/api/admin/super/recruiters/${recruiterUserId}/deactivate`);
  },

  // Handles reactivating a user account from the global super-admin user directory.
  async activateUser(userId: string) {
    await http.post(`/api/admin/super/users/${userId}/activate`);
  },

  // Handles disabling a user account from the global super-admin user directory.
  async deactivateUser(userId: string) {
    await http.post(`/api/admin/super/users/${userId}/deactivate`);
  },

  // Handles creation of a recruiter account by a company admin inside their own company context.
  async createCompanyRecruiter(payload: CreateManagedRecruiterPayload) {
    const response = await http.post('/api/admin/company/recruiters', payload);
    return response.data;
  },

  // Handles reactivating a recruiter managed by a company admin.
  async activateCompanyRecruiter(recruiterUserId: string) {
    await http.post(`/api/admin/company/recruiters/${recruiterUserId}/activate`);
  },

  // Handles disabling a recruiter managed by a company admin.
  async deactivateCompanyRecruiter(recruiterUserId: string) {
    await http.post(`/api/admin/company/recruiters/${recruiterUserId}/deactivate`);
  },
};
