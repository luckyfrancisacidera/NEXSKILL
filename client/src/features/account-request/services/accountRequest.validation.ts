import type {
  CompanyAccountRequestFormData,
  FormErrors,
} from "@features/account-request/types/accountRequest.types";

export const validateAccountRequestStep = (
  step: number,
  data: CompanyAccountRequestFormData,
): FormErrors => {
  const errors: FormErrors = {};
  const urlRegex = /^(https?:\/\/)?([\w-]+\.)+[\w-]{2,}(\/.*)?$/;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const phoneRegex = /^[+\d\s\-()]{7,20}$/;

  if (step === 1) {
    const company = data.company;
    if (!company.companyName.trim()) errors.companyName = "Company name is required.";
    if (!company.tradeName.trim()) errors.tradeName = "Business / trade name is required.";
    if (!company.industry) errors.industry = "Please select an industry.";
    if (!company.companySize) errors.companySize = "Please select company size.";
    if (!company.website.trim()) errors.website = "Website URL is required.";
    else if (!urlRegex.test(company.website)) errors.website = "Please enter a valid URL.";
    if (!company.description.trim()) errors.description = "Company description is required.";
    else if (company.description.trim().length < 30) errors.description = "Please write at least 30 characters.";
    if (!company.country) errors.country = "Please select a country.";
    if (!company.city.trim()) errors.city = "City / Province is required.";
    if (!company.address.trim()) errors.address = "Full address is required.";
  }

  if (step === 2) {
    const admin = data.admin;
    if (!admin.fullName.trim()) errors.fullName = "Full name is required.";
    if (!admin.email.trim()) errors.email = "Work email is required.";
    else if (!emailRegex.test(admin.email)) errors.email = "Please enter a valid email.";
    if (!admin.phone.trim()) errors.phone = "Phone number is required.";
    else if (!phoneRegex.test(admin.phone)) errors.phone = "Please enter a valid phone number.";
    if (!admin.position.trim()) errors.position = "Position / role is required.";
  }

  if (step === 3) {
    const docs = data.docs;
    if (!docs.businessRegNumber.trim()) errors.businessRegNumber = "Business registration number is required.";
    if (!docs.taxId.trim()) errors.taxId = "Tax ID / TIN is required.";
    if (!docs.businessPermit) errors.businessPermit = "Please upload your business permit.";
    if (!docs.certificateOfReg) errors.certificateOfReg = "Please upload your certificate of registration.";
  }

  if (step === 4) {
    if (!data.agreements.terms) errors.terms = "You must accept the Terms of Service.";
    if (!data.agreements.privacy) errors.privacy = "You must accept the Privacy Policy.";
    if (!data.agreements.dataProcessing) errors.dataProcessing = "You must consent to data processing.";
  }

  return errors;
};