import { useMemo, useState } from "react";
import type { Interview } from "@features/recruiter/types/interview.types";
import { Card } from "@shared/components/Card";
import { InterviewCard } from "./InterviewCard";

interface InterviewListProps {
  interviews: Interview[];
  isLoading: boolean;
  error: string | null;
  onReschedule: (id: string, scheduledDate: string, message?: string) => void;
}

type ViewMode = "list" | "calendar";

const formatDateKey = (iso: string) => iso.slice(0, 10);

export const InterviewList = ({
  interviews,
  isLoading,
  error,
  onReschedule,
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
          <div className="h-5 w-48 animate-pulse rounded bg-zinc-200" />
          <div className="grid gap-2 md:grid-cols-2">
            <div className="h-24 w-full animate-pulse rounded-xl bg-zinc-100" />
            <div className="h-24 w-full animate-pulse rounded-xl bg-zinc-100" />
          </div>
        </div>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <p className="text-sm text-rose-600">{error}</p>
      </Card>
    );
  }

  if (interviews.length === 0) {
    return (
      <Card>
        <p className="text-sm text-zinc-500">
          No interviews scheduled yet. Start by creating one on the left.
        </p>
      </Card>
    );
  }

  return (
    <Card className="space-y-4">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-zinc-400">
            Schedule overview
          </p>
          <h3 className="text-lg font-semibold text-zinc-900">
            Upcoming interviews
          </h3>
        </div>
        <div className="inline-flex rounded-full bg-zinc-100 p-1 text-xs font-medium text-zinc-600">
          <button
            type="button"
            onClick={() => setView("list")}
            className={`rounded-full px-3 py-1 transition ${
              view === "list"
                ? "bg-white text-zinc-900 shadow-sm"
                : "text-zinc-500 hover:text-zinc-800"
            }`}
          >
            List
          </button>
          <button
            type="button"
            onClick={() => setView("calendar")}
            className={`rounded-full px-3 py-1 transition ${
              view === "calendar"
                ? "bg-white text-zinc-900 shadow-sm"
                : "text-zinc-500 hover:text-zinc-800"
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
            />
          ))}
        </div>
      ) : (
        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
          {groupedByDate.map(([date, items]) => (
            <div
              key={date}
              className="flex flex-col rounded-xl border border-zinc-200 bg-zinc-50/60 p-3"
            >
              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-zinc-500">
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
                    className="flex flex-col rounded-lg bg-white px-3 py-2 text-left text-xs shadow-sm"
                    onClick={() =>
                      onReschedule(interview.id, interview.scheduledDate)
                    }
                  >
                    <span className="font-medium text-zinc-900">
                      {interview.candidateName}
                    </span>
                    <span className="text-[11px] text-zinc-500">
                      {new Date(interview.scheduledDate).toLocaleTimeString(
                        undefined,
                        {
                          hour: "2-digit",
                          minute: "2-digit",
                        },
                      )}
                    </span>
                    <span className="mt-1 inline-flex w-fit rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-emerald-700">
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

