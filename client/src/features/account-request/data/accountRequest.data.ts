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
    badge: "14-Day Trial",
    description: "Try SkillSense with one active job post before upgrading.",
    tagline: "No upfront payment. Best for first-time setup.",
    supportsAnnual: false,
    variant: "trial",
    cta: "Start Free Trial",
    ctaTo: "/company-account-request",
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
    period: "/month",
    badge: null,
    description: "A solid starting point for teams hiring at a steady pace.",
    tagline: "Best for first paid hiring workflows.",
    supportsAnnual: true,
    variant: "basic",
    cta: "Choose Plan",
    ctaTo: "/company-account-request",
    features: [
      "120 resume screenings / month",
      "2 active job posts",
      "Core semantic matching + explanation",
      "Full ATS pipeline + analytics",
    ],
  },
  {
    id: "standard",
    name: "Standard",
    price: "₱1,200",
    period: "/month",
    badge: "Most Popular",
    description: "For growing teams managing multiple openings at once.",
    tagline: "Balanced capacity for active recruitment.",
    supportsAnnual: true,
    variant: "standard",
    cta: "Choose Plan",
    ctaTo: "/company-account-request",
    features: [
      "300-400 resume screenings / month",
      "10 active job posts",
      "Core semantic matching + explanation",
      "Full ATS pipeline + analytics",
    ],
  },
  {
    id: "premium",
    name: "Premium",
    price: "₱2,500",
    period: "/month",
    badge: "Best Value",
    description: "Unrestricted access for high-volume, high-intent hiring teams.",
    tagline: "For the most demanding recruitment pipelines.",
    supportsAnnual: true,
    variant: "premium",
    cta: "Get Started",
    ctaTo: "/company-account-request",
    features: [
      "Unlimited resume screenings",
      "Unlimited job posts",
      "Core semantic matching + explanation",
      "Full ATS pipeline + analytics",
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
  },
  subscription: {
    planId: "free-trial",
    billingCycle: "monthly",
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
