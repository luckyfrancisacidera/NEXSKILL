import { CalendarDays, CircleAlert, Eye, Loader2, Mail, Sparkles, Trash2 } from "lucide-react";
import { Link } from "react-router-dom";

import type { JobseekerApplicationStage, JobseekerOfferDto } from "@features/jobseeker/types";
import { getJobseekerListActions } from "@features/jobseeker/utils/applicationActionRules";
import { ActionButton, actionButtonClassName } from "@shared/components/ActionButton";
import { Badge } from "@shared/components/Badge";
import { Button } from "@shared/components/Button";
import { Card } from "@shared/components/Card";
import { StatusBadge } from "@shared/components/StatusBadge";

import { OfferStageTimeline } from "./OfferStageTimeline";

export interface OfferPipelineCardData {
  id: string;
  jobId?: string;
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
  offer?: JobseekerOfferDto | null;
  updatedAtUtc?: string;
}

const formatDate = (value?: string | null) => {
  if (!value) {
    return null;
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return null;
  }

  return date.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

const resolveStatusMessage = (item: OfferPipelineCardData) => {
  if (item.isHired) {
    return item.hiredAtUtc
      ? `Hired on ${formatDate(item.hiredAtUtc)}`
      : "You have been marked as hired for this role.";
  }

  if (item.hasOffer) {
    return item.offeredAtUtc
      ? `Offer received on ${formatDate(item.offeredAtUtc)}`
      : "An offer has been extended for this role.";
  }

  return `Current stage: ${item.currentStage}`;
};

const CompactDetailChip = ({
  label,
  value,
}: {
  label: string;
  value: string;
}) => (
  <span className="inline-flex min-w-0 items-center gap-1 rounded-full border border-zinc-200 bg-zinc-50 px-2.5 py-1 text-[11px] font-medium text-zinc-600 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300">
    <span className="text-zinc-400 dark:text-zinc-500">{label}</span>
    <span className="truncate text-zinc-700 dark:text-zinc-200">{value}</span>
  </span>
);

const buildTimelineDates = (item: OfferPipelineCardData) => ({
  Applied: item.createdAtUtc,
  Offer: item.offeredAtUtc ?? undefined,
  Hired: item.hiredAtUtc ?? undefined,
});

const resolveNextAction = (item: OfferPipelineCardData) => {
  if (item.offer?.can_accept || item.offer?.can_decline) {
    return "Review and respond to the active offer.";
  }

  switch (item.currentStage) {
    case "Applied":
      return "Your application has been received and is waiting for review.";
    case "Under Review":
      return "Recruiters are reviewing your resume and fit for the role.";
    case "Shortlisted":
      return "You are shortlisted. Watch for interview scheduling updates.";
    case "Interview":
      return "Prepare for the interview and keep an eye on your inbox.";
    case "Offer":
      return "Offer details are available below.";
    case "Hired":
      return "Hiring is complete for this application.";
    case "Rejected":
      return "This application is closed.";
    case "Withdrawn":
      return "You withdrew this application.";
    default:
      return "We will keep this timeline updated as the process moves.";
  }
};

export const OfferPipelineCard = ({
  item,
  onAccept,
  onDecline,
  onDeleteHistory,
  isActing,
  isDeletingHistory,
}: {
  item: OfferPipelineCardData;
  onAccept: (applicationId: string) => void;
  onDecline: (applicationId: string) => void;
  onDeleteHistory: (applicationId: string) => void;
  isActing?: boolean;
  isDeletingHistory?: boolean;
}) => {
  const actions = getJobseekerListActions(item.currentStage, "offers");

  return (
    <Card className="rounded-[22px] border border-zinc-200 bg-white p-3 shadow-sm dark:border-zinc-800 dark:bg-zinc-950 md:p-4">
      <div className="space-y-3">
      <div className="flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h2
              className="max-w-full truncate text-base font-semibold text-zinc-900 dark:text-zinc-100 md:text-lg"
              title={item.jobTitle}
            >
              {item.jobTitle}
            </h2>
            <StatusBadge status={item.currentStage} />
            {item.offer ? <StatusBadge status={item.offer.status} /> : null}
          </div>
          <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-zinc-500 dark:text-zinc-400">
            <span className="max-w-full truncate font-medium text-zinc-700 dark:text-zinc-300" title={item.companyName}>
              {item.companyName}
            </span>
            <span className="hidden text-zinc-300 dark:text-zinc-700 md:inline">•</span>
            <span className="truncate">
              Recruiter: {item.recruiterName}
            </span>
            <span className="hidden text-zinc-300 dark:text-zinc-700 md:inline">•</span>
            <span className="inline-flex items-center gap-1">
              <CalendarDays className="h-3.5 w-3.5" />
              Applied {formatDate(item.createdAtUtc)}
            </span>
          </div>
        </div>
        <div className="flex shrink-0 flex-wrap items-center gap-2 md:justify-end">
          {item.hasOffer ? (
            <Badge>Offer flow</Badge>
          ) : null}
          {item.updatedAtUtc ? (
            <CompactDetailChip label="Updated" value={formatDate(item.updatedAtUtc) ?? "Recently"} />
          ) : null}
          {item.recruiterEmail ? (
            <CompactDetailChip label="Contact" value={item.recruiterEmail} />
          ) : null}
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <CompactDetailChip label="Stage" value={item.currentStage} />
        <CompactDetailChip
          label="Salary"
          value={item.offer?.salary_text?.trim() || "Not specified"}
        />
        <CompactDetailChip
          label="Start"
          value={formatDate(item.offer?.start_date) || "Not specified"}
        />
        <CompactDetailChip
          label="Type"
          value={item.offer?.employment_type?.trim() || "Not specified"}
        />
        {item.offer?.expiration_date ? (
          <CompactDetailChip
            label="Expires"
            value={formatDate(item.offer.expiration_date) || "Not specified"}
          />
        ) : null}
      </div>

      <div className="rounded-[20px] border border-zinc-200 bg-zinc-50 px-3 py-3 dark:border-zinc-800 dark:bg-zinc-900/70">
        <OfferStageTimeline
          activeStage={item.currentStage}
          stageDates={buildTimelineDates(item)}
        />
      </div>

      <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
        <div className="min-w-0 flex-1 space-y-2">
          <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
            {resolveStatusMessage(item)}
          </p>
          <p className="inline-flex items-start gap-2 text-sm text-zinc-600 dark:text-zinc-300">
            <CircleAlert className="mt-0.5 h-4 w-4 shrink-0 text-zinc-400 dark:text-zinc-500" />
            <span>{resolveNextAction(item)}</span>
          </p>
          {item.offer?.message ? (
            <p className="line-clamp-2 rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-2 text-sm text-zinc-600 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300">
              {item.offer.message}
            </p>
          ) : null}
        </div>
        <div className="flex flex-wrap items-center gap-2 lg:justify-end">
          {item.jobId ? (
            <Link
              to={`/jobs/${item.jobId}`}
              title="View job"
              aria-label="View job"
              className={actionButtonClassName({ iconOnly: true })}
            >
              <Eye className="h-4 w-4" />
              <span className="sr-only">View job</span>
            </Link>
          ) : null}
          {actions.includes("delete_history") ? (
            <ActionButton
              icon={isDeletingHistory ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
              label="Delete history"
              destructive
              iconOnly
              disabled={isDeletingHistory || isActing}
              onClick={() => onDeleteHistory(item.id)}
            />
          ) : null}
          {item.offer?.can_accept ? (
            <Button
              type="button"
              disabled={isActing}
              onClick={() => onAccept(item.id)}
              className="min-w-[132px]"
            >
              {isActing ? "Updating..." : "Accept Offer"}
            </Button>
          ) : null}
          {item.offer?.can_decline ? (
            <Button
              type="button"
              variant="secondary"
              disabled={isActing}
              onClick={() => onDecline(item.id)}
              className="min-w-[120px]"
            >
              {isActing ? "Updating..." : "Decline"}
            </Button>
          ) : null}
          {item.legacyHint ? (
            <div className="w-full rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-800 dark:border-amber-900/60 dark:bg-amber-950/40 dark:text-amber-200">
              <p className="flex items-center gap-1.5 font-semibold">
                <Sparkles className="h-3.5 w-3.5" /> Legacy fallback in use
              </p>
              <p className="mt-1 leading-5">{item.legacyHint}</p>
            </div>
          ) : null}
          {item.recruiterEmail ? (
            <a
              href={`mailto:${item.recruiterEmail}`}
              className="inline-flex items-center gap-1.5 text-xs text-zinc-500 transition hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-200"
            >
              <Mail className="h-3.5 w-3.5" />
              Contact recruiter
            </a>
          ) : null}
        </div>
      </div>
      </div>
    </Card>
  );
};
