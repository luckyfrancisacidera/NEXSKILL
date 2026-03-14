import { useMemo, useState } from "react";
import type { Interview } from "@features/recruiter/types/interview.types";
import { Card } from "@shared/components/Card";
import { InterviewCard } from "./InterviewCard";
import { interviewStatusCalendarPillClassName } from "@shared/utils/interviewStatus";

interface InterviewListProps {
  interviews: Interview[];
  isLoading: boolean;
  error: string | null;
  onReschedule: (interview: Interview) => void;
  onCancel: (interview: Interview) => void;
  onArchive: (interview: Interview) => void;
  pendingActionId?: string | null;
}

type ViewMode = "list" | "calendar";

const formatDateKey = (iso: string) => iso.slice(0, 10);

export const InterviewList = ({
  interviews,
  isLoading,
  error,
  onReschedule,
  onCancel,
  onArchive,
  pendingActionId = null,
}: InterviewListProps) => {
  const [view, setView] = useState<ViewMode>("calendar");

  const groupedByDate = useMemo(() => {
    const groups = new Map<string, Interview[]>();
    interviews.forEach((interview) => {
      const key = formatDateKey(interview.scheduledDate);
      const existing = groups.get(key) ?? [];
      existing.push(interview);
      groups.set(key, existing);
    });

    return Array.from(groups.entries()).sort(([a], [b]) =>
      a.localeCompare(b),
    );
  }, [interviews]);

  if (isLoading) {
    return (
      <Card>
        <div className="space-y-3">
          <div className="h-5 w-48 animate-pulse rounded bg-zinc-200 dark:bg-zinc-700" />
          <div className="grid gap-2 md:grid-cols-2">
            <div className="h-24 w-full animate-pulse rounded-xl bg-zinc-100 dark:bg-zinc-800" />
            <div className="h-24 w-full animate-pulse rounded-xl bg-zinc-100 dark:bg-zinc-800" />
          </div>
        </div>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <p className="text-sm text-rose-600 dark:text-rose-400">{error}</p>
      </Card>
    );
  }

  if (interviews.length === 0) {
    return (
      <Card>
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          No interviews scheduled yet. Start by creating one on the left.
        </p>
      </Card>
    );
  }

  return (
    <Card className="space-y-4">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-zinc-400 dark:text-zinc-500">
            Schedule overview
          </p>
          <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
            Upcoming interviews
          </h3>
        </div>
        <div className="inline-flex rounded-full bg-zinc-100 dark:bg-zinc-800 p-1 text-xs font-medium text-zinc-600 dark:text-zinc-400">
          <button
            type="button"
            onClick={() => setView("list")}
            className={`rounded-full px-3 py-1 transition ${
              view === "list"
                ? "bg-white dark:bg-zinc-700 text-zinc-900 dark:text-zinc-100 shadow-sm"
                : "text-zinc-500 dark:text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-200"
            }`}
          >
            List
          </button>
          <button
            type="button"
            onClick={() => setView("calendar")}
            className={`rounded-full px-3 py-1 transition ${
              view === "calendar"
                ? "bg-white dark:bg-zinc-700 text-zinc-900 dark:text-zinc-100 shadow-sm"
                : "text-zinc-500 dark:text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-200"
            }`}
          >
            Calendar
          </button>
        </div>
      </div>

      {view === "list" ? (
        <div className="space-y-3">
          {interviews.map((interview) => (
            <InterviewCard
              key={interview.id}
              interview={interview}
              onReschedule={onReschedule}
              onCancel={onCancel}
              onArchive={onArchive}
              isPending={pendingActionId === interview.id}
            />
          ))}
        </div>
      ) : (
        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
          {groupedByDate.map(([date, items]) => (
            <div
              key={date}
              className="flex flex-col rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/60 dark:bg-zinc-900/40 p-3"
            >
              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
                {new Date(date).toLocaleDateString(undefined, {
                  weekday: "short",
                  month: "short",
                  day: "numeric",
                })}
              </p>
              <div className="space-y-2">
                {items.map((interview) => (
                  <button
                    key={interview.id}
                    type="button"
                    className="flex flex-col rounded-lg bg-white dark:bg-zinc-800 px-3 py-2 text-left text-xs shadow-sm hover:bg-zinc-50 dark:hover:bg-zinc-700 transition"
                    onClick={() => {
                      if (
                        interview.status !== "Declined" &&
                        interview.status !== "Cancelled"
                      ) {
                        onReschedule(interview);
                      }
                    }}
                  >
                    <span className="font-medium text-zinc-900 dark:text-zinc-100">
                      {interview.candidateName}
                    </span>
                    <span className="text-[11px] text-zinc-500 dark:text-zinc-400">
                      {new Date(interview.scheduledDate).toLocaleTimeString(
                        undefined,
                        {
                          hour: "2-digit",
                          minute: "2-digit",
                        },
                      )}
                    </span>
                    <span className={`mt-1 inline-flex w-fit rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${interviewStatusCalendarPillClassName[interview.status]}`}>
                      {interview.status}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
};
