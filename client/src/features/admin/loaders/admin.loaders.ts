import type { LoaderFunctionArgs } from 'react-router-dom';
import { adminService } from '@features/admin/service/admin.service';
import type {
  CompanyAdminDashboardDto,
  SuperAdminDashboardDto,
} from '@features/admin/types/admin.type';

export const superAdminDashboardLoader = async (_args: LoaderFunctionArgs): Promise<SuperAdminDashboardDto> =>
  adminService.getSuperAdminDashboard();

export const companyAdminDashboardLoader = async (_args: LoaderFunctionArgs): Promise<CompanyAdminDashboardDto> =>
  adminService.getCompanyAdminDashboard();
