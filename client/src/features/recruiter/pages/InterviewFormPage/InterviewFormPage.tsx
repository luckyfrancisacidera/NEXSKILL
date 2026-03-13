import { useEffect, useState } from "react";
import { useLoaderData, useRevalidator } from "react-router-dom";
import { useToast } from "@app/providers/ToastProvider";
import { useConfirmation } from "@shared/hooks/useConfirmation";
import type {
  Interview,
  ScheduleInterviewInput,
  RescheduleInterviewInput,
} from "@features/recruiter/types/interview.types";
import { recruiterInterviewService } from "@features/recruiter/services/interview.service";
import { Card } from "@shared/components/Card";
import {
  InterviewModal,
  type InterviewFormValues,
} from "@features/recruiter/pages/CandidateDetailPage/components/modals/InterviewModal";
import { InterviewSchedulerForm } from "./components/InterviewSchedulerForm";
import { InterviewList } from "./components/InterviewList";

interface InterviewFormLoaderData {
  interviews: Interview[];
}

export const InterviewFormPage = () => {
  const loaderData = useLoaderData() as InterviewFormLoaderData;
  const [interviews, setInterviews] = useState<Interview[]>(loaderData.interviews);
  const [error, setError] = useState<string | null>(null);
  const [isRescheduleOpen, setIsRescheduleOpen] = useState(false);
  const [selectedInterview, setSelectedInterview] = useState<Interview | null>(null);
  const [isRescheduling, setIsRescheduling] = useState(false);
  const [pendingActionId, setPendingActionId] = useState<string | null>(null);
  const [rescheduleErrors, setRescheduleErrors] = useState<Partial<Record<keyof InterviewFormValues | "form", string>>>({});
  const [rescheduleForm, setRescheduleForm] = useState<InterviewFormValues>({
    date: "",
    hour: "9",
    minute: "00",
    meridiem: "AM",
    mode: "Virtual",
    location: "",
    notes: "",
  });
  const revalidator = useRevalidator();
  const { showToast } = useToast();
  const confirm = useConfirmation();

  useEffect(() => {
    setInterviews(loaderData.interviews);
  }, [loaderData]);

  const addInterview = (interview: Interview) => {
    setInterviews((items) => [interview, ...items]);
  };

  const updateInterview = (updated: Interview) => {
    setInterviews((items) =>
      updated.isArchived
        ? items.filter((item) => item.id !== updated.id)
        : items.map((item) => (item.id === updated.id ? updated : item)),
    );
  };

  const handleSchedule = async (input: ScheduleInterviewInput) => {
    try {
      const scheduled = await recruiterInterviewService.scheduleInterview(input);
      addInterview(scheduled);
      setError(null);
      revalidator.revalidate();
      showToast({
        title: "Interview scheduled",
        description: `${scheduled.candidateName} has been invited.`,
        tone: "success",
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

  const closeRescheduleModal = () => {
    setIsRescheduleOpen(false);
    setSelectedInterview(null);
    setRescheduleErrors({});
  };

  const handleRescheduleChange = (field: keyof InterviewFormValues, value: string) => {
    setRescheduleForm((current) => ({ ...current, [field]: value }));
    setRescheduleErrors((current) => {
      if (!current[field] && !current.form) {
        return current;
      }

      const next = { ...current };
      delete next[field];
      delete next.form;
      return next;
    });
  };

  const openRescheduleModal = (interview: Interview) => {
    if (interview.status === "Declined" || interview.status === "Cancelled") {
      showToast({
        title: "Interview cannot be rescheduled",
        description:
          "Declined and cancelled interviews are terminal scheduling states. Archive them or create a fresh interview instead.",
        tone: "error",
      });
      return;
    }

    const scheduledAt = new Date(interview.scheduledDate);
    const hour = scheduledAt.getHours();
    const normalizedHour = hour % 12 || 12;

    setSelectedInterview(interview);
    setRescheduleErrors({});
    setRescheduleForm({
      date: interview.scheduledDate.slice(0, 10),
      hour: String(normalizedHour),
      minute: String(scheduledAt.getMinutes()).padStart(2, "0"),
      meridiem: hour >= 12 ? "PM" : "AM",
      mode: interview.interviewType,
      location: interview.meetingLink ?? interview.location ?? "",
      notes: interview.message ?? "",
    });
    setIsRescheduleOpen(true);
  };

  const buildRescheduleInput = (): {
    errors: Partial<Record<keyof InterviewFormValues | "form", string>>;
    input?: RescheduleInterviewInput;
  } => {
    const errors: Partial<Record<keyof InterviewFormValues | "form", string>> = {};

    if (!rescheduleForm.date) {
      errors.date = "Interview date is required.";
    }

    if (!rescheduleForm.location.trim()) {
      errors.location =
        rescheduleForm.mode === "Virtual"
          ? "Meeting link is required."
          : "Location / address is required.";
    } else if (
      rescheduleForm.mode === "Virtual" &&
      !/^https?:\/\/.+/i.test(rescheduleForm.location.trim())
    ) {
      errors.location = "Enter a valid meeting link starting with http:// or https://.";
    }

    const selectedHour = Number(rescheduleForm.hour);
    const selectedMinute = Number(rescheduleForm.minute);

    if (Number.isNaN(selectedHour) || Number.isNaN(selectedMinute)) {
      errors.hour = "Interview time is required.";
    }

    let hour24 = selectedHour % 12;
    if (rescheduleForm.meridiem === "PM") {
      hour24 += 12;
    }

    const scheduledDate = new Date(
      `${rescheduleForm.date}T${String(hour24).padStart(2, "0")}:${String(selectedMinute).padStart(2, "0")}:00`,
    );

    if (Number.isNaN(scheduledDate.getTime())) {
      errors.form = "Please provide a valid interview date and time.";
    } else if (scheduledDate.getTime() <= Date.now()) {
      errors.form = "Please choose a future date and time.";
    }

    if (Object.keys(errors).length > 0) {
      return { errors };
    }

    return {
      errors,
      input: {
        scheduledDate: scheduledDate.toISOString(),
        interviewType: rescheduleForm.mode,
        meetingLink: rescheduleForm.mode === "Virtual" ? rescheduleForm.location.trim() : undefined,
        location: rescheduleForm.mode === "Onsite" ? rescheduleForm.location.trim() : undefined,
        message: rescheduleForm.notes.trim() || undefined,
      },
    };
  };

  const handleRescheduleSubmit = async () => {
    if (!selectedInterview) {
      return;
    }

    const { errors, input } = buildRescheduleInput();
    setRescheduleErrors(errors);

    if (!input) {
      return;
    }

    const confirmed = await confirm({
      title: "Reschedule interview",
      message: "Save these interview changes and notify the candidate of the updated schedule?",
      confirmLabel: "Save reschedule",
      accent: "violet",
    });
    if (!confirmed) {
      return;
    }

    setIsRescheduling(true);
    try {
      const updated = await recruiterInterviewService.rescheduleInterview(selectedInterview.id, input);
      updateInterview(updated);
      setError(null);
      closeRescheduleModal();
      revalidator.revalidate();
      showToast({
        title: "Interview rescheduled",
        description: `${updated.candidateName} has been notified of the change.`,
        tone: "success",
      });
    } catch (err) {
      const description =
        err instanceof Error
          ? err.message
          : "Unable to reschedule the interview. Please try again.";
      setError(description);
      setRescheduleErrors({ form: description });
      showToast({
        title: "Reschedule failed",
        description,
        tone: "error",
      });
    } finally {
      setIsRescheduling(false);
    }
  };

  const handleCancel = async (interview: Interview) => {
    const confirmed = await confirm({
      title: "Cancel interview",
      message:
        "Cancel this interview and notify the candidate? Cancelled interviews are no longer treated as active schedules.",
      confirmLabel: "Cancel interview",
      accent: "red",
    });
    if (!confirmed) {
      return;
    }

    setPendingActionId(interview.id);
    try {
      const updated = await recruiterInterviewService.cancelInterview(interview.id, {});
      updateInterview(updated);
      setError(null);
      revalidator.revalidate();
      showToast({
        title: "Interview cancelled",
        description: `${updated.candidateName} has been notified.`,
        tone: "success",
      });
    } catch (err) {
      const description =
        err instanceof Error
          ? err.message
          : "Unable to cancel the interview. Please try again.";
      setError(description);
      showToast({
        title: "Cancel failed",
        description,
        tone: "error",
      });
    } finally {
      setPendingActionId(null);
    }
  };

  const handleArchive = async (interview: Interview) => {
    const confirmed = await confirm({
      title: "Archive interview",
      message:
        "Archive this declined or cancelled interview? It will be removed from active recruiter views.",
      confirmLabel: "Archive",
      accent: "violet",
    });
    if (!confirmed) {
      return;
    }

    setPendingActionId(interview.id);
    try {
      const updated = await recruiterInterviewService.archiveInterview(interview.id);
      updateInterview(updated);
      setError(null);
      revalidator.revalidate();
      showToast({
        title: "Interview archived",
        description: `${interview.candidateName} was removed from the active schedule.`,
        tone: "success",
      });
    } catch (err) {
      const description =
        err instanceof Error
          ? err.message
          : "Unable to archive the interview. Please try again.";
      setError(description);
      showToast({
        title: "Archive failed",
        description,
        tone: "error",
      });
    } finally {
      setPendingActionId(null);
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
          onReschedule={openRescheduleModal}
          onCancel={handleCancel}
          onArchive={handleArchive}
          pendingActionId={pendingActionId}
        />
      </div>

      <InterviewModal
        open={isRescheduleOpen}
        form={rescheduleForm}
        isSubmitting={isRescheduling}
        title={selectedInterview ? `Reschedule ${selectedInterview.candidateName}` : "Reschedule interview"}
        submitLabel="Save reschedule"
        errors={rescheduleErrors}
        onClose={closeRescheduleModal}
        onChange={handleRescheduleChange}
        onSubmit={async (event) => {
          event.preventDefault();
          await handleRescheduleSubmit();
        }}
      />
    </div>
  );
};
