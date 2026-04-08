import { http } from "@shared/api/http";
import type {
  CompanyAdminEmailAvailabilityResult,
  CompanyAccountRequestFormData,
  CompanyAccountRequestSubmissionResult,
} from "@features/account-request/types/accountRequest.types";

export const accountRequestService = {
  async checkPrimaryAdminEmailAvailability(email: string): Promise<CompanyAdminEmailAvailabilityResult> {
    const response = await http.get<CompanyAdminEmailAvailabilityResult>("/api/company-requests/validate-admin-email", {
      params: { email },
    });
    return response.data;
  },

  async submit(data: CompanyAccountRequestFormData): Promise<CompanyAccountRequestSubmissionResult> {
    const formData = new FormData();
    formData.append("companyName", data.company.companyName);
    formData.append("businessName", data.company.tradeName);
    formData.append("industry", data.company.industry);
    formData.append("companySize", data.company.companySize);
    formData.append("websiteUrl", data.company.website);
    formData.append("description", data.company.description);
    formData.append("country", data.company.country);
    formData.append("cityProvince", data.company.city);
    formData.append("fullAddress", data.company.address);
    formData.append("primaryAdminFullName", data.admin.fullName);
    formData.append("primaryAdminEmail", data.admin.email);
    formData.append("primaryAdminPhone", data.admin.phone);
    formData.append("primaryAdminRole", data.admin.position);
    formData.append("requestedPlanId", data.subscription.planId);
    if (data.subscription.planId !== "free-trial") {
      formData.append("billingCycle", data.subscription.billingCycle);
    }

    formData.append("businessRegistrationNumber", data.docs.businessRegNumber);
    formData.append("taxId", data.docs.taxId);

    if (data.docs.businessPermit) {
      formData.append("businessPermitFile", data.docs.businessPermit);
    }

    if (data.docs.certificateOfReg) {
      formData.append("certificateOfRegistrationFile", data.docs.certificateOfReg);
    }

    const response = await http.post<CompanyAccountRequestSubmissionResult>("/api/company-requests", formData);
    return response.data;
  },
};
