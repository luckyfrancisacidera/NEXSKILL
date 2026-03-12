import type { Interview } from "@features/recruiter/types/interview.types";
import { downloadInterviewICS } from "@shared/utils/calendar";
import { emitNotification } from "@shared/utils/notifications";

interface InterviewCardProps {
  interview: Interview;
  onReschedule: (id: string, scheduledDate: string, message?: string) => void;
}

const statusChipClassName: Record<Interview["status"], string> = {
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

export const InterviewCard = ({ interview, onReschedule }: InterviewCardProps) => {
  const scheduledAt = new Date(interview.scheduledDate);

  const onQuickReschedule = () => {
    const next = prompt(
      "New date & time (ISO or YYYY-MM-DDTHH:mm):",
      interview.scheduledDate.slice(0, 16),
    );
    if (!next) return;
    const note = prompt("Optional message to candidate (leave blank to skip):");
    onReschedule(interview.id, next, note || undefined);
  };

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
              className="rounded-full bg-zinc-900 px-3 py-1 text-xs font-semibold text-white shadow-sm transition hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
              onClick={onQuickReschedule}
            >
              Reschedule
            </button>
            <button
              type="button"
              className="rounded-full border border-zinc-200 bg-zinc-50 px-3 py-1 text-xs font-semibold text-zinc-700 transition hover:bg-zinc-100 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200 dark:hover:bg-zinc-800"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </article>
  );
};
