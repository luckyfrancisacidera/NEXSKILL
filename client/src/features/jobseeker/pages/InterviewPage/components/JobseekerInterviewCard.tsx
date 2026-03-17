import type { JobseekerInterview } from "@features/jobseeker/types";
import { RescheduleRequestModal } from "./RescheduleRequestModal";
import { useState } from "react";
import { downloadInterviewICS } from "@shared/utils/calendar";
import { emitNotification } from "@shared/utils/notifications";
import { RichTextContent } from "@shared/components/RichTextContent";
import {
  interviewStatusChipClassName,
  isTerminalInterviewStatus,
} from "@shared/utils/interviewStatus";

interface JobseekerInterviewCardProps {
  interview: JobseekerInterview;
  onAccept: (id: string) => Promise<void> | void;
  onDecline: (id: string) => Promise<void> | void;
  onRequestReschedule: (
    id: string,
    message: string,
    attachment?: File,
  ) => Promise<void> | void;
  onArchive: (id: string) => Promise<void> | void;
  isPending?: boolean;
}

export const JobseekerInterviewCard = ({
  interview,
  onAccept,
  onDecline,
  onRequestReschedule,
  onArchive,
  isPending = false,
}: JobseekerInterviewCardProps) => {
  const [isRescheduleOpen, setIsRescheduleOpen] = useState(false);
  const isTerminal = isTerminalInterviewStatus(interview.status);
  const canRespond =
    !isPending && !isTerminal && interview.status !== "Accepted";
  const canRequestReschedule = !isPending && !isTerminal;
  const canArchive = !isPending && isTerminal;

  const scheduledAt = new Date(interview.scheduledDate);
  const recruiterLine = interview.recruiterName
    ? `Recruiter: ${interview.recruiterName}${interview.companyName ? ` (${interview.companyName})` : ""}`
    : interview.companyName
      ? `Recruiter: ${interview.companyName}`
      : null;

  const onDownloadCalendar = async () => {
    try {
      await downloadInterviewICS(interview.id, "jobseeker");
      emitNotification({
        title: "Calendar download ready",
        description: "Your interview calendar invite has been downloaded.",
        actor: "jobseeker",
      });
    } catch (error) {
      emitNotification({
        title: "Calendar download failed",
        description:
          error instanceof Error
            ? error.message
            : "Unable to download the interview calendar right now.",
        actor: "jobseeker",
      });
    }
  };

  return (
    <>
      <article className="flex flex-col gap-3 rounded-2xl border border-zinc-200 bg-white/80 p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md dark:border-zinc-700 dark:bg-zinc-900/80">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-xs uppercase tracking-wide text-zinc-400">
              Upcoming interview
            </p>
            <h4 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">
              {interview.companyName || interview.recruiterName || "Interview"}
            </h4>
            <p className="mt-1 text-xs text-zinc-500">
              {scheduledAt.toLocaleDateString(undefined, {
                weekday: "short",
                month: "short",
                day: "numeric",
              })}{" "}
              ·{" "}
              {scheduledAt.toLocaleTimeString(undefined, {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </p>
            {recruiterLine ? (
              <p className="mt-1 text-xs text-zinc-600 dark:text-zinc-300">
                {recruiterLine}
              </p>
            ) : null}
            {interview.recruiterEmail ? (
              <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
                {interview.recruiterEmail}
              </p>
            ) : null}
          </div>
          <span
            className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${interviewStatusChipClassName[interview.status]}`}
          >
            {interview.status}
          </span>
        </div>
        {interview.message ? (
          <RichTextContent
            html={interview.message}
            className="rounded-lg bg-zinc-50 p-2 text-xs dark:bg-zinc-950/60"
          />
        ) : null}
        <div className="flex flex-wrap items-center justify-between gap-2">
          {interview.meetingLink ? (
            <a
              href={interview.meetingLink}
              target="_blank"
              rel="noreferrer"
              className="text-xs font-medium text-violet-600 hover:text-violet-700 dark:text-violet-400 dark:hover:text-violet-300"
            >
              Join meeting
            </a>
          ) : interview.location ? (
            <p className="text-xs text-zinc-500">
              Location:{" "}
              <span className="font-medium text-zinc-700 dark:text-zinc-200">
                {interview.location}
              </span>
            </p>
          ) : null}
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              className="rounded-full border border-zinc-200 bg-zinc-50 px-3 py-1 text-xs font-semibold text-zinc-700 transition hover:bg-zinc-100 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200 dark:hover:bg-zinc-800"
              onClick={() => void onDownloadCalendar()}
            >
              Add to calendar
            </button>
            <button
              type="button"
              disabled={!canRespond}
              className="rounded-full border border-zinc-300 bg-white px-3 py-1 text-xs font-semibold text-zinc-800 shadow-sm transition hover:bg-zinc-100 disabled:cursor-not-allowed disabled:opacity-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 dark:hover:bg-zinc-800"
              onClick={() => onAccept(interview.id)}
            >
              Accept
            </button>
            <button
              type="button"
              disabled={!canRespond}
              className="rounded-full border border-zinc-200 bg-zinc-50 px-3 py-1 text-xs font-semibold text-zinc-700 transition hover:bg-zinc-100 disabled:cursor-not-allowed disabled:opacity-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200 dark:hover:bg-zinc-800"
              onClick={() => onDecline(interview.id)}
            >
              Decline
            </button>
            <button
              type="button"
              disabled={!canRequestReschedule}
              className="rounded-full bg-zinc-900 px-3 py-1 text-xs font-semibold text-white shadow-sm transition hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
              onClick={() => setIsRescheduleOpen(true)}
            >
              Request reschedule
            </button>
            {canArchive ? (
              <button
                type="button"
                disabled={isPending}
                className="rounded-full border border-zinc-200 bg-zinc-50 px-3 py-1 text-xs font-semibold text-zinc-700 transition hover:bg-zinc-100 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200 dark:hover:bg-zinc-800"
                onClick={() => onArchive(interview.id)}
              >
                Archive
              </button>
            ) : null}
          </div>
        </div>
        {interview.cancelReason ? (
          <p className="rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2 text-xs text-zinc-600 dark:border-zinc-800 dark:bg-zinc-950/60 dark:text-zinc-300">
            Cancellation reason: {interview.cancelReason}
          </p>
        ) : null}
        {isTerminal ? (
          <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
            Declined and cancelled interviews are terminal scheduling states.
            They can be archived, but they cannot be rescheduled in place.
          </p>
        ) : null}
      </article>

      <RescheduleRequestModal
        open={isRescheduleOpen && canRequestReschedule}
        onClose={() => setIsRescheduleOpen(false)}
        onSubmit={async (message, attachment) => {
          await onRequestReschedule(interview.id, message, attachment);
          setIsRescheduleOpen(false);
        }}
      />
    </>
  );
};
