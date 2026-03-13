import type { Interview } from "@features/recruiter/types/interview.types";
import { downloadInterviewICS } from "@shared/utils/calendar";
import { emitNotification } from "@shared/utils/notifications";
import {
  interviewStatusChipClassName,
  isTerminalInterviewStatus,
} from "@shared/utils/interviewStatus";

interface InterviewCardProps {
  interview: Interview;
  onReschedule: (interview: Interview) => void;
  onCancel: (interview: Interview) => void;
  onArchive: (interview: Interview) => void;
  isPending?: boolean;
}

export const InterviewCard = ({
  interview,
  onReschedule,
  onCancel,
  onArchive,
  isPending = false,
}: InterviewCardProps) => {
  const scheduledAt = new Date(interview.scheduledDate);
  const isTerminal = isTerminalInterviewStatus(interview.status);
  const canReschedule = !isPending && !isTerminal;
  const canCancel = !isPending && interview.status !== "Cancelled" && !interview.isArchived;
  const canArchive =
    !isPending &&
    (interview.status === "Declined" || interview.status === "Cancelled");

  const onDownloadCalendar = async () => {
    try {
      await downloadInterviewICS(interview.id, "recruiter");
      emitNotification({
        title: "Calendar download ready",
        description: `Interview invite for ${interview.candidateName} has been downloaded.`,
        actor: "recruiter",
      });
    } catch (error) {
      emitNotification({
        title: "Calendar download failed",
        description:
          error instanceof Error
            ? error.message
            : "Unable to download the interview calendar right now.",
        actor: "recruiter",
      });
    }
  };

  return (
    <article className="flex gap-3 rounded-2xl border border-zinc-200 bg-white/80 p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md dark:border-zinc-700 dark:bg-zinc-900/80">
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-violet-500 to-indigo-500 text-sm font-semibold text-white shadow-md">
        {interview.candidateName
          .split(" ")
          .map((part) => part[0])
          .join("")
          .slice(0, 2)
          .toUpperCase()}
      </div>
      <div className="flex flex-1 flex-col gap-2">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-xs uppercase tracking-wide text-zinc-400">
              Candidate
            </p>
            <h4 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">
              {interview.candidateName}
            </h4>
            <p className="mt-1 text-xs text-zinc-500">
              {scheduledAt.toLocaleDateString(undefined, {
                weekday: "short",
                month: "short",
                day: "numeric",
              })}{" "}
              -{" "}
              {scheduledAt.toLocaleTimeString(undefined, {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </p>
            {interview.jobTitle ? (
              <p className="mt-1 text-xs text-zinc-500">{interview.jobTitle}</p>
            ) : null}
          </div>
          <span
            className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${interviewStatusChipClassName[interview.status]}`}
          >
            {interview.status}
          </span>
        </div>

        {interview.message ? (
          <p className="rounded-lg bg-zinc-50 p-2 text-xs text-zinc-600 dark:bg-zinc-950/60 dark:text-zinc-300">
            {interview.message}
          </p>
        ) : null}
        {interview.cancelReason ? (
          <p className="rounded-lg border border-zinc-200 bg-zinc-50 p-2 text-xs text-zinc-600 dark:border-zinc-800 dark:bg-zinc-950/60 dark:text-zinc-300">
            Cancellation reason: {interview.cancelReason}
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
              Copy meeting link
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
              disabled={!canReschedule}
              className="rounded-full bg-zinc-900 px-3 py-1 text-xs font-semibold text-white shadow-sm transition hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
              onClick={() => onReschedule(interview)}
            >
              Reschedule
            </button>
            <button
              type="button"
              disabled={!canCancel}
              className="rounded-full border border-zinc-200 bg-zinc-50 px-3 py-1 text-xs font-semibold text-zinc-700 transition hover:bg-zinc-100 disabled:cursor-not-allowed disabled:opacity-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200 dark:hover:bg-zinc-800"
              onClick={() => onCancel(interview)}
            >
              Cancel
            </button>
            {canArchive ? (
              <button
                type="button"
                disabled={isPending}
                className="rounded-full border border-zinc-200 bg-zinc-50 px-3 py-1 text-xs font-semibold text-zinc-700 transition hover:bg-zinc-100 disabled:cursor-not-allowed disabled:opacity-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200 dark:hover:bg-zinc-800"
                onClick={() => onArchive(interview)}
              >
                Archive
              </button>
            ) : null}
          </div>
        </div>
        {isTerminal ? (
          <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
            Declined and cancelled interviews are terminal scheduling states.
            Archive them or create a new schedule instead of rescheduling them.
          </p>
        ) : null}
      </div>
    </article>
  );
};
