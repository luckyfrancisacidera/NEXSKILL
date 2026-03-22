import { BriefcaseBusiness, Building2, Mail, Sparkles, UserRound } from "lucide-react";

import type { JobseekerApplicationStage } from "@features/jobseeker/types";
import { Card } from "@shared/components/Card";
import { StatusBadge } from "@shared/components/StatusBadge";

import { OfferStageTimeline } from "./OfferStageTimeline";

export interface OfferPipelineCardData {
  id: string;
  jobTitle: string;
  companyName: string;
  recruiterName: string;
  recruiterEmail?: string;
  createdAtUtc: string;
  currentStage: JobseekerApplicationStage | string;
  hasOffer: boolean;
  isHired: boolean;
  offeredAtUtc?: string | null;
  hiredAtUtc?: string | null;
  legacyHint?: string | null;
}

const formatUtc = (value?: string | null) => {
  if (!value) {
    return null;
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return null;
  }

  return date.toLocaleString();
};

const resolveStatusMessage = (item: OfferPipelineCardData) => {
  if (item.isHired) {
    return item.hiredAtUtc
      ? `Hired on ${formatUtc(item.hiredAtUtc)}`
      : "You have been marked as hired for this role.";
  }

  if (item.hasOffer) {
    return item.offeredAtUtc
      ? `Offer received on ${formatUtc(item.offeredAtUtc)}`
      : "An offer has been extended for this role.";
  }

  return `Current stage: ${item.currentStage}`;
};

export const OfferPipelineCard = ({ item }: { item: OfferPipelineCardData }) => (
  <Card className="rounded-[26px] border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-700 dark:bg-zinc-900 md:p-6">
    <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
      <div className="space-y-3">
        <div className="flex flex-wrap items-center gap-3">
          <StatusBadge status={item.currentStage} />
          {item.hasOffer ? (
            <StatusBadge status="Offer" label="Offer Active" />
          ) : null}
          {item.isHired ? (
            <StatusBadge status="Hire" label="Hired" />
          ) : null}
        </div>
        <div>
          <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100">{item.jobTitle}</h2>
          <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
            Applied on {new Date(item.createdAtUtc).toLocaleDateString()}
          </p>
        </div>
      </div>
      <div className="grid gap-3 sm:grid-cols-2 lg:min-w-[420px]">
        <div className="rounded-2xl border border-zinc-200 bg-zinc-50 px-4 py-3 dark:border-zinc-700 dark:bg-zinc-800/70">
          <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-zinc-400 dark:text-zinc-500">
            <UserRound className="h-4 w-4" /> Recruiter
          </p>
          <p className="mt-2 text-sm font-semibold text-zinc-900 dark:text-zinc-100">{item.recruiterName}</p>
          {item.recruiterEmail ? (
            <p className="mt-1 flex items-center gap-1 text-xs text-zinc-500 dark:text-zinc-400">
              <Mail className="h-3.5 w-3.5" /> {item.recruiterEmail}
            </p>
          ) : null}
        </div>
        <div className="rounded-2xl border border-zinc-200 bg-zinc-50 px-4 py-3 dark:border-zinc-700 dark:bg-zinc-800/70">
          <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-zinc-400 dark:text-zinc-500">
            <Building2 className="h-4 w-4" /> Company
          </p>
          <p className="mt-2 text-sm font-semibold text-zinc-900 dark:text-zinc-100">{item.companyName}</p>
          <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">Recruiter and company details come from your application record.</p>
        </div>
      </div>
    </div>

    <div className="mt-6 rounded-[24px] border border-zinc-200 bg-zinc-50 px-4 py-5 dark:border-zinc-700 dark:bg-zinc-800/70 md:px-5">
      <div className="mb-4 flex items-center gap-2 text-sm font-semibold text-zinc-800 dark:text-zinc-200">
        <BriefcaseBusiness className="h-4 w-4 text-zinc-500 dark:text-zinc-400" />
        Application stage timeline
      </div>
      <OfferStageTimeline activeStage={item.currentStage} />
    </div>

    <div className="mt-4 grid gap-3 lg:grid-cols-[1.2fr_0.8fr]">
      <div className="rounded-2xl border border-zinc-200 bg-white px-4 py-3 dark:border-zinc-700 dark:bg-zinc-900">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-zinc-400 dark:text-zinc-500">Progress summary</p>
        <p className="mt-2 text-sm font-semibold text-zinc-900 dark:text-zinc-100">{resolveStatusMessage(item)}</p>
        {item.offeredAtUtc && !item.isHired ? (
          <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">Offer stage is distinct from hire and remains active until a hiring decision is recorded.</p>
        ) : null}
      </div>
      {item.legacyHint ? (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800 dark:border-amber-900/60 dark:bg-amber-950/40 dark:text-amber-200">
          <p className="flex items-center gap-2 font-semibold">
            <Sparkles className="h-4 w-4" /> Legacy fallback in use
          </p>
          <p className="mt-1 text-xs leading-5">{item.legacyHint}</p>
        </div>
      ) : null}
    </div>
  </Card>
);
