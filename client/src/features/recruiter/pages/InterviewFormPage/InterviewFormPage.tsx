import { useEffect, useState } from "react";
import { useLoaderData } from "react-router-dom";
import type {
  Interview,
  ScheduleInterviewInput,
} from "@features/recruiter/types/interview.types";
import { recruiterInterviewService } from "@features/recruiter/services/interview.service";
import { Card } from "@shared/components/Card";
import { emitNotification } from "@shared/utils/notifications";
import { InterviewSchedulerForm } from "./components/InterviewSchedulerForm";
import { InterviewList } from "./components/InterviewList";

interface InterviewFormLoaderData {
  interviews: Interview[];
}

export const InterviewFormPage = () => {
  const loaderData = useLoaderData() as InterviewFormLoaderData;
  const [interviews, setInterviews] = useState<Interview[]>(loaderData.interviews);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setInterviews(loaderData.interviews);
  }, [loaderData]);

  const addInterview = (interview: Interview) => {
    setInterviews((items) => [interview, ...items]);
  };

  const updateInterview = (updated: Interview) => {
    setInterviews((items) =>
      items.map((item) => (item.id === updated.id ? updated : item)),
    );
  };

  const handleSchedule = async (input: ScheduleInterviewInput) => {
    try {
      const scheduled = await recruiterInterviewService.scheduleInterview(input);
      addInterview(scheduled);
      setError(null);

      emitNotification({
        title: "Interview scheduled",
        description: `${scheduled.candidateName} has been invited.`,
        actor: "recruiter",
      });
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to schedule the interview. Please try again.",
      );
      throw err;
    }
  };

  const handleReschedule = async (
    id: string,
    scheduledDate: string,
    message?: string,
  ) => {
    try {
      const updated = await recruiterInterviewService.rescheduleInterview(id, {
        scheduledDate,
        message,
      });
      updateInterview(updated);
      setError(null);

      emitNotification({
        title: "Interview rescheduled",
        description: `${updated.candidateName} has been notified of the change.`,
        actor: "recruiter",
      });
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to reschedule the interview. Please try again.",
      );
    }
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
          isLoading={false}
          error={error}
          onReschedule={handleReschedule}
        />
      </div>
    </div>
  );
};
