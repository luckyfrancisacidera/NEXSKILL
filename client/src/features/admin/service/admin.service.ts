import { http } from '@shared/api/http';
import type {
  AdminCompanyAccountDto,
  CompanyAdminDashboardDto,
  CreateCompanyAccountPayload,
  CreateManagedRecruiterPayload,
  SuperAdminDashboardDto,
} from '@features/admin/types/admin.type';

export const adminService = {
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

  async getCompanyAdminDashboard(params: { page: number; pageSize: number }): Promise<CompanyAdminDashboardDto> {
    const response = await http.get<CompanyAdminDashboardDto>('/api/admin/company/dashboard', {
      params,
    });
    return response.data;
  },

  async createCompanyAccount(payload: CreateCompanyAccountPayload): Promise<AdminCompanyAccountDto> {
    const response = await http.post<AdminCompanyAccountDto>('/api/admin/super/companies', payload);
    return response.data;
  },

  async activateCompany(companyId: string) {
    await http.post(`/api/admin/super/companies/${companyId}/activate`);
  },

  async deactivateCompany(companyId: string) {
    await http.post(`/api/admin/super/companies/${companyId}/deactivate`);
  },

  async activateCompanyAdmin(adminUserId: string) {
    await http.post(`/api/admin/super/company-admins/${adminUserId}/activate`);
  },

  async deactivateCompanyAdmin(adminUserId: string) {
    await http.post(`/api/admin/super/company-admins/${adminUserId}/deactivate`);
  },

  async activateRecruiterBySuperAdmin(recruiterUserId: string) {
    await http.post(`/api/admin/super/recruiters/${recruiterUserId}/activate`);
  },

  async deactivateRecruiterBySuperAdmin(recruiterUserId: string) {
    await http.post(`/api/admin/super/recruiters/${recruiterUserId}/deactivate`);
  },

  async createCompanyRecruiter(payload: CreateManagedRecruiterPayload) {
    const response = await http.post('/api/admin/company/recruiters', payload);
    return response.data;
  },

  async activateCompanyRecruiter(recruiterUserId: string) {
    await http.post(`/api/admin/company/recruiters/${recruiterUserId}/activate`);
  },

  async deactivateCompanyRecruiter(recruiterUserId: string) {
    await http.post(`/api/admin/company/recruiters/${recruiterUserId}/deactivate`);
  },
};
