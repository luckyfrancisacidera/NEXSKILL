import {
  AlertCircle,
  Building2,
  Check,
  ClipboardCheck,
  CreditCard,
  FileText,
  User,
} from "lucide-react";
import { ACCOUNT_REQUEST_PLANS } from "@features/account-request/data/accountRequest.data";
import {
  ReviewRow,
  ReviewSection,
  SectionTitle,
} from "@features/account-request/components/AccountRequestShared";
import type {
  Agreements,
  CompanyAccountRequestFormData,
  FormErrors,
} from "@features/account-request/types/accountRequest.types";

export const ReviewSubmitStep = ({
  data,
  errors,
  onChange,
}: {
  data: CompanyAccountRequestFormData;
  errors: FormErrors;
  onChange: (field: keyof Agreements, value: boolean) => void;
}) => {
  const plan = ACCOUNT_REQUEST_PLANS.find((item) => item.id === data.subscription.planId);

  return (
    <div className="space-y-5">
      <SectionTitle
        icon={<ClipboardCheck size={18} />}
        title="Review & Submit"
        subtitle="Please review your details carefully before submitting your account request."
      />

      <ReviewSection title="Company Information" icon={<Building2 size={15} />}>
        <ReviewRow label="Company Name" value={data.company.companyName} />
        <ReviewRow label="Trade Name" value={data.company.tradeName} />
        <ReviewRow label="Industry" value={data.company.industry} />
        <ReviewRow label="Company Size" value={data.company.companySize} />
        <ReviewRow label="Website" value={data.company.website} />
        <ReviewRow label="Country" value={data.company.country} />
        <ReviewRow label="City / Province" value={data.company.city} />
        <ReviewRow label="Address" value={data.company.address} />
        <ReviewRow
          label="Description"
          value={
            data.company.description.length > 80
              ? `${data.company.description.slice(0, 80)}...`
              : data.company.description
          }
        />
      </ReviewSection>

      <ReviewSection title="Admin Contact" icon={<User size={15} />}>
        <ReviewRow label="Full Name" value={data.admin.fullName} />
        <ReviewRow label="Email" value={data.admin.email} />
        <ReviewRow label="Phone" value={data.admin.phone} />
        <ReviewRow label="Position" value={data.admin.position} />
      </ReviewSection>

      <ReviewSection title="Subscription Plan" icon={<CreditCard size={15} />}>
        <ReviewRow label="Plan" value={plan?.name ?? "-"} />
        <ReviewRow label="Price" value={plan ? `${plan.price}${plan.period}` : "-"} />
        <ReviewRow
          label="Billing Cycle"
          value={data.subscription.planId === "free-trial" ? "Trial" : data.subscription.billingCycle === "annual" ? "Annual" : "Monthly"}
        />
      </ReviewSection>

      <ReviewSection title="Verification Documents" icon={<FileText size={15} />}>
        <ReviewRow label="Reg. Number" value={data.docs.businessRegNumber} />
        <ReviewRow label="Tax ID / TIN" value={data.docs.taxId} />
        <ReviewRow label="Business Permit" value={data.docs.businessPermit?.name ?? "Not uploaded"} />
        <ReviewRow label="Certificate" value={data.docs.certificateOfReg?.name ?? "Not uploaded"} />
      </ReviewSection>

      <div className="space-y-4 rounded-xl border border-zinc-200 bg-zinc-50 p-5 dark:border-white/10 dark:bg-zinc-900">
        <p className="text-sm font-semibold text-zinc-700 dark:text-zinc-100">Legal Agreements</p>
        {[
          {
            key: "terms" as keyof Agreements,
            label: "I have read and agree to the ",
            link: "Terms of Service",
            error: errors.terms,
          },
          {
            key: "privacy" as keyof Agreements,
            label: "I have read and agree to the ",
            link: "Privacy Policy",
            error: errors.privacy,
          },
          {
            key: "dataProcessing" as keyof Agreements,
            label: "I consent to the ",
            link: "Data Processing Agreement",
            error: errors.dataProcessing,
          },
        ].map((agreement) => (
          <div key={agreement.key}>
            <label className="group flex cursor-pointer items-start gap-3">
              <div
                onClick={() => onChange(agreement.key, !data.agreements[agreement.key])}
                className={`mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-md border-2 transition-all ${
                  data.agreements[agreement.key]
                    ? "border-zinc-800 bg-zinc-800 dark:border-zinc-100 dark:bg-zinc-100"
                    : "border-zinc-300 bg-white group-hover:border-zinc-500 dark:border-white/10 dark:bg-zinc-950"
                } ${agreement.error ? "border-red-400" : ""}`}
              >
                {data.agreements[agreement.key] ? (
                  <Check size={11} className="text-white dark:text-zinc-900" strokeWidth={3} />
                ) : null}
              </div>
              <span className="text-sm leading-snug text-zinc-600 dark:text-zinc-300">
                {agreement.label}
                <button type="button" className="font-semibold text-zinc-800 underline underline-offset-2 hover:text-zinc-600 dark:text-zinc-100 dark:hover:text-zinc-300">
                  {agreement.link}
                </button>
                .
              </span>
            </label>
            {agreement.error ? (
              <div className="ml-8 mt-1.5 flex items-center gap-1.5">
                <AlertCircle size={12} className="text-red-500" />
                <p className="text-xs text-red-500">{agreement.error}</p>
              </div>
            ) : null}
          </div>
        ))}
      </div>
    </div>
  );
};
