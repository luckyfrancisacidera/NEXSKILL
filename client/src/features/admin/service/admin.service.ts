import { http } from '@shared/api/http';
import type {
  CompanyAdminDashboardDto,
  CreateManagedRecruiterPayload,
  SuperAdminDashboardDto,
} from '@features/admin/types/admin.type';

export const adminService = {
  async getSuperAdminDashboard(): Promise<SuperAdminDashboardDto> {
    const response = await http.get<SuperAdminDashboardDto>('/api/admin/super/dashboard');
    return response.data;
  },

  async getCompanyAdminDashboard(): Promise<CompanyAdminDashboardDto> {
    const response = await http.get<CompanyAdminDashboardDto>('/api/admin/company/dashboard');
    return response.data;
  },

  async createCompanyRecruiter(payload: CreateManagedRecruiterPayload) {
    const response = await http.post('/api/admin/company/recruiters', payload);
    return response.data;
  },

  async deactivateCompanyRecruiter(recruiterUserId: string) {
    await http.post(`/api/admin/company/recruiters/${recruiterUserId}/deactivate`);
  },
};
