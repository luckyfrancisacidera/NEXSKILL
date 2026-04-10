import type { LucideIcon } from "lucide-react";

export interface CompanyInfo {
  companyName: string;
  tradeName: string;
  industry: string;
  companySize: string;
  website: string;
  description: string;
  country: string;
  city: string;
  address: string;
}

export interface AdminContact {
  fullName: string;
  email: string;
  phone: string;
  position: string;
}

export interface VerificationDocs {
  businessRegNumber: string;
  taxId: string;
  businessPermit: File | null;
  certificateOfReg: File | null;
}

export interface Agreements {
  terms: boolean;
  privacy: boolean;
  dataProcessing: boolean;
}

export interface CompanyAccountRequestFormData {
  company: CompanyInfo;
  admin: AdminContact;
  docs: VerificationDocs;
  agreements: Agreements;
}

export type FormErrors = Record<string, string>;

export interface AccountRequestStepMeta {
  id: number;
  label: string;
  icon: LucideIcon;
}

export interface AccountRequestPlan {
  id: string;
  name: string;
  price: string;
  period: string;
  description: string;
  tagline: string;
  badge?: string | null;
  supportsAnnual: boolean;
  features: string[];
  variant: string;
  cta: string;
  ctaTo: string;
}

export interface CompanyAccountRequestSubmissionResult {
  requestId: string;
  status: string;
}

export interface CompanyAdminEmailAvailabilityResult {
  email: string;
  isAvailable: boolean;
  message?: string | null;
}
export interface CardDetails {
  cardName: string;
  cardNumber: string;
  cardExpiry: string;
  cardCvv: string;
}
export interface WalletDetails {
  phone: string;
  accountName: string;
}
export interface BankDetails {
  accountName: string;
  bankName: string;
  accountNumber: string;
  referenceNumber: string;
}
export interface PaypalDetails {
  email: string;
}

export interface PaymentDetails {
  card?: Partial<CardDetails>;
  gcash?: Partial<WalletDetails>;
  maya?: Partial<WalletDetails>;
  bank?: Partial<BankDetails>;
  paypal?: Partial<PaypalDetails>;
}

export interface SubscriptionPlanForm {
  planId: string;
  billingCycle: "monthly" | "annual";
  paymentMethod: string;
  paymentDetails: PaymentDetails;
}
