import { useEffect, useState } from "react";
import { useConfirmation } from "@shared/hooks/useConfirmation";
import { Card } from "@shared/components/Card";
import type { JobseekerInterview } from "@features/jobseeker/types";
import { jobseekerInterviewService } from "@features/jobseeker/services/interview.service";
import { emitNotification } from "@shared/utils/notifications";
import { JobseekerInterviewList } from "./components/JobseekerInterviewList";

export const InterviewPage = () => {
  const [interviews, setInterviews] = useState<JobseekerInterview[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pendingActionId, setPendingActionId] = useState<string | null>(null);
  const confirm = useConfirmation();

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      try {
        setIsLoading(true);
        const data = await jobseekerInterviewService.getJobseekerInterviews();
        if (!cancelled) {
          setInterviews(data);
        }
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof Error
              ? err.message
              : "Unable to load interviews. Please try again.",
          );
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    };

    void load();

    return () => {
      cancelled = true;
    };
  }, []);

  const updateInterview = (updated: JobseekerInterview) => {
    setInterviews((items) =>
      updated.isArchived
        ? items.filter((item) => item.id !== updated.id)
        : items.map((item) => (item.id === updated.id ? updated : item)),
    );
  };

  const handleAccept = async (id: string) => {
    const confirmed = await confirm({
      title: "Accept interview",
      message: "Accept this interview invitation?",
      confirmLabel: "Accept",
      accent: "green",
    });
    if (!confirmed) return;

    setPendingActionId(id);
    try {
      const updated = await jobseekerInterviewService.acceptInterview(id);
      updateInterview(updated);
      emitNotification({
        title: "Interview accepted",
        description: "The recruiter has been notified of your acceptance.",
        actor: "jobseeker",
      });
    } finally {
      setPendingActionId(null);
    }
  };

  const handleDecline = async (id: string) => {
    const confirmed = await confirm({
      title: "Decline interview",
      message: "Decline this interview invitation? Declined interviews are terminal for scheduling.",
      confirmLabel: "Decline",
      accent: "red",
    });
    if (!confirmed) return;

    setPendingActionId(id);
    try {
      const updated = await jobseekerInterviewService.declineInterview(id);
      updateInterview(updated);
      emitNotification({
        title: "Interview declined",
        description: "The recruiter has been notified of your decision.",
        actor: "jobseeker",
      });
    } finally {
      setPendingActionId(null);
    }
  };

  const handleRequestReschedule = async (
    id: string,
    message: string,
    attachment?: File,
  ) => {
    const confirmed = await confirm({
      title: "Request reschedule",
      message: "Send this reschedule request to the recruiter?",
      confirmLabel: "Send request",
      accent: "violet",
    });
    if (!confirmed) return;

    setPendingActionId(id);
    try {
      const updated = await jobseekerInterviewService.requestReschedule(
        id,
        message,
        attachment,
      );
      updateInterview(updated);
      emitNotification({
        title: "Reschedule requested",
        description:
          "Your reschedule request has been sent to the recruiter.",
        actor: "jobseeker",
      });
    } finally {
      setPendingActionId(null);
    }
  };

  const handleArchive = async (id: string) => {
    const confirmed = await confirm({
      title: "Archive interview",
      message: "Archive this declined or cancelled interview? It will be removed from active views.",
      confirmLabel: "Archive",
      accent: "violet",
    });
    if (!confirmed) return;

    setPendingActionId(id);
    try {
      const updated = await jobseekerInterviewService.archiveInterview(id);
      updateInterview(updated);
      emitNotification({
        title: "Interview archived",
        description: "The interview has been removed from your active schedule.",
        actor: "jobseeker",
      });
    } finally {
      setPendingActionId(null);
    }
  };

  return (
    <div className="space-y-4">
      <Card className="flex items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-100">
            My Interviews
          </h2>
          <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
            Stay on top of upcoming interviews and respond in one click.
          </p>
        </div>
      </Card>
      <JobseekerInterviewList
        interviews={interviews}
        isLoading={isLoading}
        error={error}
        onAccept={handleAccept}
        onDecline={handleDecline}
        onRequestReschedule={handleRequestReschedule}
        onArchive={handleArchive}
        pendingActionId={pendingActionId}
      />
    </div>
  );
};
