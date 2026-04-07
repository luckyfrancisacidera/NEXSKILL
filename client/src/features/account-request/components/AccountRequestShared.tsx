import { Check } from "lucide-react";
import type { ReactNode } from "react";

export const SectionTitle = ({
  icon,
  title,
  subtitle,
}: {
  icon: ReactNode;
  title: string;
  subtitle: string;
}) => (
  <div className="flex items-start gap-3 border-b border-zinc-100 pb-2 dark:border-white/10">
    <div className="mt-0.5 flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl bg-zinc-100 text-zinc-600 dark:bg-white/10 dark:text-zinc-200">
      {icon}
    </div>
    <div>
      <h2 className="text-base font-semibold text-zinc-800 dark:text-zinc-100">{title}</h2>
      <p className="mt-0.5 text-sm text-zinc-400 dark:text-zinc-500">{subtitle}</p>
    </div>
  </div>
);

export const ReviewRow = ({
  label,
  value,
}: {
  label: string;
  value: string;
}) => (
  <div className="flex flex-col gap-0.5 border-b border-zinc-100 py-2.5 last:border-0 dark:border-white/10 sm:flex-row sm:items-start sm:gap-4">
    <span className="text-xs font-medium text-zinc-400 dark:text-zinc-500 sm:w-44 sm:flex-shrink-0">{label}</span>
    <span className="text-sm font-medium text-zinc-700 dark:text-zinc-100">
      {value || <span className="text-xs italic text-zinc-300 dark:text-zinc-600">-</span>}
    </span>
  </div>
);

export const ReviewSection = ({
  title,
  icon,
  children,
}: {
  title: string;
  icon: ReactNode;
  children: ReactNode;
}) => (
  <div className="overflow-hidden rounded-xl border border-zinc-100 dark:border-white/10">
    <div className="flex items-center gap-2.5 border-b border-zinc-100 bg-zinc-50 px-5 py-3.5 dark:border-white/10 dark:bg-zinc-900">
      <span className="text-zinc-500 dark:text-zinc-300">{icon}</span>
      <span className="text-sm font-semibold text-zinc-700 dark:text-zinc-100">{title}</span>
    </div>
    <div className="divide-y divide-zinc-100 px-5 dark:divide-white/10">{children}</div>
  </div>
);

export const SuccessScreen = ({ referenceNumber }: { referenceNumber: string }) => (
  <div className="flex flex-col items-center justify-center space-y-5 px-6 py-16 text-center">
    <div className="flex h-16 w-16 items-center justify-center rounded-full bg-zinc-800 dark:bg-zinc-100">
      <Check size={28} className="text-white dark:text-zinc-900" strokeWidth={2.5} />
    </div>
    <div>
      <h2 className="font-display text-2xl font-semibold text-zinc-800 dark:text-zinc-100">Request Submitted</h2>
      <p className="mt-2 max-w-sm text-sm leading-relaxed text-zinc-400 dark:text-zinc-500">
        Your company account request has been received. Our team will review your documents and get back to you within 2-3 business days.
      </p>
    </div>
    <div className="flex w-full max-w-xs flex-col gap-2 pt-2">
      <p className="text-xs text-zinc-400 dark:text-zinc-500">Reference number</p>
      <code className="rounded-xl bg-zinc-100 px-4 py-2 text-sm font-semibold text-zinc-700 dark:bg-zinc-900 dark:text-zinc-100">
        {referenceNumber}
      </code>
    </div>
  </div>
);
