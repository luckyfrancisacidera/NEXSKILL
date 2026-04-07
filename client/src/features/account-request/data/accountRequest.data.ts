import {
  Building2,
  ClipboardCheck,
  CreditCard,
  FileText,
  User,
} from "lucide-react";
import type {
  AccountRequestPlan,
  AccountRequestStepMeta,
  CompanyAccountRequestFormData,
} from "@features/account-request/types/accountRequest.types";

export const ACCOUNT_REQUEST_STEPS: AccountRequestStepMeta[] = [
  { id: 1, label: "Company Info", icon: Building2 },
  { id: 2, label: "Admin Contact", icon: User },
  { id: 3, label: "Subscription", icon: CreditCard },
  { id: 4, label: "Verification", icon: FileText },
  { id: 5, label: "Review & Submit", icon: ClipboardCheck },
];

export const ACCOUNT_REQUEST_PLANS: AccountRequestPlan[] = [
  {
    id: "free-trial",
    name: "Free Trial",
    price: "₱0",
    period: "/14 days",
    tagline: "Ideal for evaluating semantic screening on a smaller scale.",
    badge: "14-Day Trial",
    supportsAnnual: false,
    features: [
      "1 active job post",
      "Up to 25 resume screenings",
      "Semantic matching enabled",
      "Basic ATS pipeline access",
      "Analytics locked",
      "14-day access",
    ],
  },
  {
    id: "basic",
    name: "Basic",
    price: "₱500",
    priceAnnual: "₱450",
    period: "/month",
    tagline: "Great for startups hiring at steady pace",
    supportsAnnual: true,
    features: [
      "120 screenings / month",
      "2 active job posts",
      "Semantic matching + explanation",
      "Full ATS pipeline",
      "Analytics dashboard",
    ],
  },
  {
    id: "standard",
    name: "Standard",
    price: "₱1,200",
    priceAnnual: "₱1,080",
    period: "/month",
    tagline: "Best for growing teams with active pipelines",
    badge: "Most Popular",
    supportsAnnual: true,
    features: [
      "300-400 screenings / month",
      "10 active job posts",
      "Semantic matching + explanation",
      "Full ATS pipeline",
      "Analytics dashboard",
    ],
  },
  {
    id: "premium",
    name: "Premium",
    price: "₱2,500",
    priceAnnual: "₱2,250",
    period: "/month",
    tagline: "For enterprises with high-volume hiring",
    supportsAnnual: true,
    features: [
      "Unlimited screenings",
      "Unlimited job posts",
      "Semantic matching + explanation",
      "Full ATS pipeline",
      "Analytics dashboard",
    ],
  },
];

export const INDUSTRIES = [
  "Technology & Software",
  "Healthcare & Medical",
  "Finance & Banking",
  "Education & Training",
  "Retail & E-commerce",
  "Manufacturing",
  "Construction & Real Estate",
  "Marketing & Advertising",
  "Legal Services",
  "Logistics & Supply Chain",
  "Hospitality & Tourism",
  "Non-profit / NGO",
  "Other",
];

export const COMPANY_SIZES = [
  "1-10 employees",
  "11-50 employees",
  "51-200 employees",
  "201-500 employees",
  "501-1,000 employees",
  "1,000+ employees",
];

export const PAYMENT_METHODS = [
  "Credit / Debit Card",
  "GCash",
  "Maya",
  "Bank Transfer",
  "PayPal",
];

export const COUNTRIES = [
  "Philippines",
  "United States",
  "Singapore",
  "Australia",
  "United Kingdom",
  "Canada",
  "Japan",
  "Other",
];

export const INITIAL_ACCOUNT_REQUEST_FORM: CompanyAccountRequestFormData = {
  company: {
    companyName: "",
    tradeName: "",
    industry: "",
    companySize: "",
    website: "",
    description: "",
    country: "",
    city: "",
    address: "",
  },
  admin: {
    fullName: "",
    email: "",
    phone: "",
    position: "",
    password: "",
    confirmPassword: "",
  },
  subscription: {
    planId: "free-trial",
    billingCycle: "monthly",
    paymentMethod: "",
    paymentDetails: {},
  },
  docs: {
    businessRegNumber: "",
    taxId: "",
    businessPermit: null,
    certificateOfReg: null,
  },
  agreements: {
    terms: false,
    privacy: false,
    dataProcessing: false,
  },
};
