import { useEffect, useState } from "react";
import type { Interview } from "@features/recruiter/types/interview.types";
import { recruiterInterviewService } from "@features/recruiter/services/interview.service";
import { Card } from "@shared/components/Card";
import { emitNotification } from "@shared/utils/notifications";
import { InterviewSchedulerForm } from "./components/InterviewSchedulerForm";
import { InterviewList } from "./components/InterviewList";

export const InterviewFormPage = () => {
  const [interviews, setInterviews] = useState<Interview[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      try {
        setIsLoading(true);
        const data = await recruiterInterviewService.getRecruiterInterviews();
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

  const addInterview = (interview: Interview) => {
    setInterviews((items) => [interview, ...items]);
  };

  const updateInterview = (updated: Interview) => {
    setInterviews((items) =>
      items.map((item) => (item.id === updated.id ? updated : item)),
    );
  };

  const handleSchedule = async (
    input: Omit<Interview, "id" | "status"> & { status?: Interview["status"] },
  ) => {
    const scheduled = await recruiterInterviewService.scheduleInterview({
      recruiterId: input.recruiterId,
      jobseekerId: input.jobseekerId,
      candidateName: input.candidateName,
      scheduledDate: input.scheduledDate,
      meetingLink: input.meetingLink,
      location: input.location,
      message: input.message,
    });
    addInterview(scheduled);

    emitNotification({
      title: "Interview scheduled",
      description: `${scheduled.candidateName} has been invited.`,
      actor: "recruiter",
    });
  };

  const handleReschedule = async (
    id: string,
    scheduledDate: string,
    message?: string,
  ) => {
    const updated = await recruiterInterviewService.rescheduleInterview(id, {
      scheduledDate,
      message,
    });
    updateInterview(updated);

    emitNotification({
      title: "Interview rescheduled",
      description: `${updated.candidateName} has been notified of the change.`,
      actor: "recruiter",
    });
  };

  return (
    <div className="space-y-4">
      <Card className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-zinc-900">
            Schedule interviews
          </h2>
          <p className="mt-1 text-sm text-zinc-500">
            Pick a time, personalize the invite, and track responses in a
            Sneat-style dashboard.
          </p>
        </div>
      </Card>

      <div className="grid gap-4 lg:grid-cols-[minmax(0,2fr)_minmax(0,3fr)]">
        <InterviewSchedulerForm onSchedule={handleSchedule} />
        <InterviewList
          interviews={interviews}
          isLoading={isLoading}
          error={error}
          onReschedule={handleReschedule}
        />
      </div>
    </div>
  );
}

