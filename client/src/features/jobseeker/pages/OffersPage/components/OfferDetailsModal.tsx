import { Briefcase, CalendarDays, CircleDollarSign, Clock3, Copy, Laptop2, Mail, MessageSquareText, ShieldCheck } from "lucide-react";

import { useToast } from "@app/providers/ToastProvider";
import type { OfferPipelineCardData } from "./OfferPipelineCard";
import { Button } from "@shared/components/actions/Button";
import { ModalFrame } from "@shared/components/overlay/ModalFrame";
import { StatusBadge } from "@shared/components/data-display/StatusBadge";
import { richTextToDisplayLines, richTextToList } from "@shared/utils/richText";
import { fallbackRecruiterMailto, openRecruiterContact } from "../utils/contactRecruiter";

const formatDate = (value?: string | null) => {
  if (!value) {
    return "Not specified";
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

const renderNormalizedLines = (
  lines: string[],
  emptyMessage: string,
  className = "text-sm leading-6 text-zinc-700 dark:text-zinc-300",
) => {
  if (lines.length === 0) {
    return <p className="text-sm text-zinc-500 dark:text-zinc-400">{emptyMessage}</p>;
  }

  return (
    <div className="space-y-2">
      {lines.map((line, index) => (
        <p key={`${line}-${index}`} className={className}>
          {line}
        </p>
      ))}
    </div>
  );
};

const resolveOfferStatusLabel = (status?: string | null) => {
  if (!status) {
    return "Offer";
  }

  return `Offer ${status}`;
};

const resolveApplicationStatusLabel = (status?: string | null) => {
  if (!status) {
    return "Application";
  }

  return `Application ${status}`;
};

export const OfferDetailsModal = ({
  item,
  isActing = false,
  onAccept,
  onDecline,
  onClose,
}: {
  item: OfferPipelineCardData;
  isActing?: boolean;
  onAccept: (applicationId: string) => void;
  onDecline: (applicationId: string) => void;
  onClose: () => void;
}) => {
  const { showToast } = useToast();
  const offer = item.offer;
  if (!offer) {
    return null;
  }

  const benefitItems = richTextToList(offer.benefits);
  const benefitLines = richTextToDisplayLines(offer.benefits);
  const messageLines = richTextToDisplayLines(offer.message);

  const handleCopyRecruiterEmail = async () => {
    if (!item.recruiterEmail) {
      return;
    }

    try {
      await navigator.clipboard.writeText(item.recruiterEmail);
      showToast({
        title: "Recruiter email copied",
        description: item.recruiterEmail,
        tone: "success",
      });
    } catch {
      fallbackRecruiterMailto(item.recruiterEmail);
    }
  };

  return (
    <ModalFrame
      onClose={onClose}
      containerClassName="max-w-3xl"
      contentClassName="ring-1 ring-zinc-200 dark:ring-zinc-700"
      bodyClassName="min-h-0 flex-1 space-y-5 overflow-y-auto"
      footer={
        <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <Button type="button" variant="secondary" onClick={onClose}>
            Back
          </Button>
          {offer.can_decline ? (
            <Button
              type="button"
              variant="secondary"
              loading={isActing}
              loadingText="Updating"
              onClick={() => onDecline(item.id)}
            >
              Decline
            </Button>
          ) : null}
          {offer.can_accept ? (
            <Button
              type="button"
              loading={isActing}
              loadingText="Updating"
              onClick={() => onAccept(item.id)}
            >
              Accept Offer
            </Button>
          ) : null}
        </div>
      }
      showCloseButton
      closeLabel="Close offer details"
      headerContent={
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 rounded-full border border-zinc-200 bg-zinc-100 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-zinc-600 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300">
              <ShieldCheck className="h-3.5 w-3.5" />
              Offer Details
            </div>
            <div className="space-y-1">
              <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 sm:text-xl">{offer.title || item.jobTitle}</h3>
              <div className="flex flex-wrap items-center gap-2 text-sm text-zinc-500 dark:text-zinc-400">
                <span className="font-medium text-zinc-700 dark:text-zinc-200">{item.companyName}</span>
                <span>{item.recruiterName}</span>
                {item.recruiterEmail ? (
                  <button
                    type="button"
                    className="inline-flex items-center gap-1 text-zinc-500 transition hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-200"
                    onClick={() => openRecruiterContact(item.recruiterEmail!)}
                  >
                    <Mail className="h-3.5 w-3.5" />
                    {item.recruiterEmail}
                  </button>
                ) : null}
                {item.recruiterEmail ? (
                  <button
                    type="button"
                    className="inline-flex items-center gap-1 text-zinc-500 transition hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-200"
                    onClick={() => {
                      void handleCopyRecruiterEmail();
                    }}
                  >
                    <Copy className="h-3.5 w-3.5" />
                    Copy email
                  </button>
                ) : null}
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 sm:justify-end">
            <StatusBadge status={item.currentStage} label={resolveApplicationStatusLabel(item.currentStage)} />
            <StatusBadge status={offer.status} label={resolveOfferStatusLabel(offer.status)} />
          </div>
        </div>
      }
    >
      <section className="grid gap-3 rounded-[24px] border border-zinc-200 bg-zinc-50/80 p-4 sm:grid-cols-2 dark:border-zinc-700 dark:bg-zinc-950/60">
        <div className="space-y-1">
          <p className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-zinc-500 dark:text-zinc-400">
            <CalendarDays className="h-3.5 w-3.5" />
            Received
          </p>
          <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">{formatDate(item.offeredAtUtc ?? offer.sent_at_utc)}</p>
        </div>
        <div className="space-y-1">
          <p className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-zinc-500 dark:text-zinc-400">
            <CalendarDays className="h-3.5 w-3.5" />
            Start Date
          </p>
          <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">{formatDate(offer.start_date)}</p>
        </div>
        <div className="space-y-1">
          <p className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-zinc-500 dark:text-zinc-400">
            <Clock3 className="h-3.5 w-3.5" />
            Offer Expires
          </p>
          <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">{formatDate(offer.expiration_date)}</p>
        </div>
        <div className="space-y-1">
          <p className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-zinc-500 dark:text-zinc-400">
            <CircleDollarSign className="h-3.5 w-3.5" />
            Compensation
          </p>
          <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">{offer.salary_text || "Not specified"}</p>
        </div>
        <div className="space-y-1">
          <p className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-zinc-500 dark:text-zinc-400">
            <Laptop2 className="h-3.5 w-3.5" />
            Setup
          </p>
          <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
            {offer.work_setup?.trim() || "Not specified"}
          </p>
        </div>
        <div className="space-y-1">
          <p className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-zinc-500 dark:text-zinc-400">
            <Briefcase className="h-3.5 w-3.5" />
            Type
          </p>
          <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
            {offer.employment_type?.trim() || "Not specified"}
          </p>
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        <div className="space-y-3 rounded-[24px] border border-zinc-200 bg-white p-4 dark:border-zinc-700 dark:bg-zinc-950/60">
          <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">Benefits</p>
          {benefitItems.length > 0 ? (
            <ul className="space-y-2 pl-5 text-sm text-zinc-700 dark:text-zinc-300">
              {benefitItems.map((itemValue) => (
                <li key={itemValue} className="list-disc leading-6">{itemValue}</li>
              ))}
            </ul>
          ) : (
            renderNormalizedLines(benefitLines, "No benefits listed.")
          )}
        </div>

        <div className="space-y-3 rounded-[24px] border border-zinc-200 bg-white p-4 dark:border-zinc-700 dark:bg-zinc-950/60">
          <p className="inline-flex items-center gap-2 text-sm font-semibold text-zinc-900 dark:text-zinc-100">
            <MessageSquareText className="h-4 w-4" />
            Additional Notes
          </p>
          {renderNormalizedLines(messageLines, "No additional notes provided.")}
        </div>
      </section>
    </ModalFrame>
  );
};

