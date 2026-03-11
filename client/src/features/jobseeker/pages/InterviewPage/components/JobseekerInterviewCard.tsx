import type { JobseekerInterview } from "@features/jobseeker/types";
import { RescheduleRequestModal } from "./RescheduleRequestModal";
import { useState } from "react";
import { downloadInterviewICS } from "@shared/utils/calendar";
import { emitNotification } from "@shared/utils/notifications";

interface JobseekerInterviewCardProps {
  interview: JobseekerInterview;
  onAccept: (id: string) => Promise<void> | void;
  onDecline: (id: string) => Promise<void> | void;
  onRequestReschedule: (
    id: string,
    message: string,
    attachment?: File,
  ) => Promise<void> | void;
}

const statusChipClassName: Record<JobseekerInterview["status"], string> = {
  Pending:
    "bg-amber-50 text-amber-700 ring-1 ring-amber-200/70 dark:bg-amber-900/30 dark:text-amber-200 dark:ring-amber-900/70",
  Accepted:
    "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200/70 dark:bg-emerald-900/30 dark:text-emerald-200 dark:ring-emerald-900/70",
  Declined:
    "bg-rose-50 text-rose-700 ring-1 ring-rose-200/70 dark:bg-rose-900/30 dark:text-rose-200 dark:ring-rose-900/70",
  RescheduleRequested:
    "bg-indigo-50 text-indigo-700 ring-1 ring-indigo-200/70 dark:bg-indigo-900/30 dark:text-indigo-200 dark:ring-indigo-900/70",
  Rescheduled:
    "bg-sky-50 text-sky-700 ring-1 ring-sky-200/70 dark:bg-sky-900/30 dark:text-sky-200 dark:ring-sky-900/70",
};

export const JobseekerInterviewCard = ({
  interview,
  onAccept,
  onDecline,
  onRequestReschedule,
}: JobseekerInterviewCardProps) => {
  const [isRescheduleOpen, setIsRescheduleOpen] = useState(false);

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
            className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${statusChipClassName[interview.status]}`}
          >
            {interview.status}
          </span>
        </div>
        {interview.message ? (
          <p className="rounded-lg bg-zinc-50 p-2 text-xs text-zinc-600 dark:bg-zinc-950/60 dark:text-zinc-300">
            {interview.message}
          </p>
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
              className="rounded-full border border-zinc-300 bg-white px-3 py-1 text-xs font-semibold text-zinc-800 shadow-sm transition hover:bg-zinc-100 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 dark:hover:bg-zinc-800"
              onClick={() => onAccept(interview.id)}
            >
              Accept
            </button>
            <button
              type="button"
              className="rounded-full border border-zinc-200 bg-zinc-50 px-3 py-1 text-xs font-semibold text-zinc-700 transition hover:bg-zinc-100 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200 dark:hover:bg-zinc-800"
              onClick={() => onDecline(interview.id)}
            >
              Decline
            </button>
            <button
              type="button"
              className="rounded-full bg-zinc-900 px-3 py-1 text-xs font-semibold text-white shadow-sm transition hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
              onClick={() => setIsRescheduleOpen(true)}
            >
              Request reschedule
            </button>
          </div>
        </div>
      </article>

      <RescheduleRequestModal
        open={isRescheduleOpen}
        onClose={() => setIsRescheduleOpen(false)}
        onSubmit={async (message, attachment) => {
          await onRequestReschedule(interview.id, message, attachment);
          setIsRescheduleOpen(false);
        }}
      />
    </>
  );
};
