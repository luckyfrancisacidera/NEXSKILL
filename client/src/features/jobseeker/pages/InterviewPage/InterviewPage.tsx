import { useEffect, useState } from "react";
import { Card } from "@shared/components/Card";
import type { JobseekerInterview } from "@features/jobseeker/types";
import { jobseekerInterviewService } from "@features/jobseeker/services/interview.service";
import { emitNotification } from "@shared/utils/notifications";
import { JobseekerInterviewList } from "./components/JobseekerInterviewList";

export const InterviewPage = () => {
  const [interviews, setInterviews] = useState<JobseekerInterview[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
      items.map((item) => (item.id === updated.id ? updated : item)),
    );
  };

  const handleAccept = async (id: string) => {
    const updated = await jobseekerInterviewService.acceptInterview(id);
    updateInterview(updated);
    emitNotification({
      title: "Interview accepted",
      description: "The recruiter has been notified of your acceptance.",
      actor: "jobseeker",
    });
  };

  const handleDecline = async (id: string) => {
    const updated = await jobseekerInterviewService.declineInterview(id);
    updateInterview(updated);
    emitNotification({
      title: "Interview declined",
      description: "The recruiter has been notified of your decision.",
      actor: "jobseeker",
    });
  };

  const handleRequestReschedule = async (
    id: string,
    message: string,
    attachment?: File,
  ) => {
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
  };

  return (
    <div className="space-y-4">
      <Card className="flex items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-semibold text-zinc-900">
            My Interviews
          </h2>
          <p className="mt-1 text-sm text-zinc-500">
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
      />
    </div>
  );
};

