import { useMemo } from "react";
import type { Interview } from "@features/recruiter/types/interview.types";
import { Card } from "@shared/components/Card";
import { InterviewCard } from "./InterviewCard";

interface InterviewListProps {
  interviews: Interview[];
  isLoading: boolean;
  error: string | null;
  onReschedule: (interview: Interview) => void;
  onCancel: (interview: Interview) => void;
  onArchive: (interview: Interview) => void;
  pendingActionId?: string | null;
}

export const InterviewList = ({
  interviews,
  isLoading,
  error,
  onReschedule,
  onCancel,
  onArchive,
  pendingActionId = null,
}: InterviewListProps) => {
  const visibleInterviews = useMemo(
    () =>
      interviews
        .filter((interview) => !interview.isArchived)
        .sort(
          (left, right) =>
            new Date(left.scheduledDate).getTime() -
            new Date(right.scheduledDate).getTime(),
        ),
    [interviews],
  );

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

  if (visibleInterviews.length === 0) {
    return (
      <Card>
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          No interviews scheduled yet. Use the calendar or Add Interview to create one.
        </p>
      </Card>
    );
  }

  return (
    <Card className="space-y-4">
      <div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-zinc-400 dark:text-zinc-500">
            Schedule details
          </p>
          <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
            Upcoming and active interviews
          </h3>
        </div>
      </div>

      <div className="space-y-3">
        {visibleInterviews.map((interview) => (
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
    </Card>
  );
};
