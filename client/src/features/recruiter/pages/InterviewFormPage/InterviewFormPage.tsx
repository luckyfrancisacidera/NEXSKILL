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
} from "@features/recruiter/pages/CandidateDetailPage/components/InterviewModal";
import { SideDrawer } from "@shared/components/SideDrawer";
import { sanitizeRichText } from "@shared/utils/richText";
import { InterviewCalendar } from "./components/InterviewCalendar";
import { InterviewSchedulerForm } from "./components/InterviewSchedulerForm";

interface InterviewFormLoaderData {
  interviews: Interview[];
}

export const InterviewFormPage = () => {
  const loaderData = useLoaderData() as InterviewFormLoaderData;
  const [interviews, setInterviews] = useState<Interview[]>(loaderData.interviews);
  const [error, setError] = useState<string | null>(null);
  const [isScheduleDrawerOpen, setIsScheduleDrawerOpen] = useState(false);
  const [scheduleDrawerDate, setScheduleDrawerDate] = useState("");
  const [isRescheduleOpen, setIsRescheduleOpen] = useState(false);
  const [selectedInterview, setSelectedInterview] = useState<Interview | null>(null);
  const [isRescheduling, setIsRescheduling] = useState(false);
  const [isCompleting, setIsCompleting] = useState(false);
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

  const closeScheduleDrawer = () => {
    setIsScheduleDrawerOpen(false);
    setScheduleDrawerDate("");
  };

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
      closeScheduleDrawer();
      revalidator.revalidate();
      showToast({
        title: "Interview scheduled",
        description: `${scheduled.candidateName} has been invited.`,
        tone: "success",
      });
    } catch (err) {
      throw err;
    }
  };

  const closeRescheduleModal = () => {
    setIsRescheduleOpen(false);
    setSelectedInterview(null);
    setRescheduleErrors({});
  };

  const openScheduleDrawer = (date?: string) => {
    setScheduleDrawerDate(date ?? "");
    setIsScheduleDrawerOpen(true);
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
    if (interview.status === "Declined" || interview.status === "Cancelled" || interview.status === "Completed") {
      showToast({
        title: "Interview cannot be rescheduled",
        description:
          "Declined, cancelled, and completed interviews are terminal scheduling states. Create a fresh interview instead.",
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
        message: sanitizeRichText(rescheduleForm.notes) || undefined,
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
      return false;
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
      return true;
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
      return false;
    } finally {
      setPendingActionId(null);
    }
  };

  const handleComplete = async (interview: Interview) => {
    const confirmed = await confirm({
      title: "Mark interview done",
      message:
        "Mark this accepted interview as completed? Once completed, the candidate can be rejected or moved to offer stage.",
      confirmLabel: "Mark done",
      accent: "green",
    });
    if (!confirmed) {
      return false;
    }

    setIsCompleting(true);
    try {
      const updated = await recruiterInterviewService.completeInterview(interview.id);
      updateInterview(updated);
      setError(null);
      revalidator.revalidate();
      showToast({
        title: "Interview marked done",
        description: `${updated.candidateName} can now move to a post-interview decision.`,
        tone: "success",
      });
      return true;
    } catch (err) {
      const description =
        err instanceof Error
          ? err.message
          : "Unable to mark the interview as completed. Please try again.";
      setError(description);
      showToast({
        title: "Completion failed",
        description,
        tone: "error",
      });
      return false;
    } finally {
      setIsCompleting(false);
    }
  };

  return (
    <div className="space-y-4">
      <Card className="border border-zinc-200/80 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
        <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-100">
          Interview Page
        </h1>
        <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
          Manage interview schedules, review upcoming sessions, and update candidate meetings from one calendar view.
        </p>
      </Card>

      {error ? (
        <Card className="border border-rose-200 bg-rose-50/80 py-3 shadow-none dark:border-rose-900/70 dark:bg-rose-950/30">
          <p className="text-sm text-rose-700 dark:text-rose-300">{error}</p>
        </Card>
      ) : null}

      <InterviewCalendar
        interviews={interviews}
        onAddInterview={openScheduleDrawer}
        onEditInterview={openRescheduleModal}
      />

      <SideDrawer
        open={isScheduleDrawerOpen}
        title="Add interview"
        description="Select a job, choose a shortlisted candidate, and send a polished interview invite."
        onClose={closeScheduleDrawer}
        widthClassName="sm:max-w-[500px]"
      >
        <InterviewSchedulerForm
          onSchedule={handleSchedule}
          defaultDate={scheduleDrawerDate}
          onCancel={closeScheduleDrawer}
          showHeader={false}
          submitLabel="Schedule interview"
        />
      </SideDrawer>

      <InterviewModal
        open={isRescheduleOpen}
        form={rescheduleForm}
        isSubmitting={isRescheduling}
        title={selectedInterview ? `Reschedule ${selectedInterview.candidateName}` : "Reschedule interview"}
        submitLabel="Save reschedule"
        errors={rescheduleErrors}
        showCancelInterviewAction={
          Boolean(selectedInterview) &&
          selectedInterview?.status !== "Cancelled" &&
          selectedInterview?.status !== "Declined" &&
          selectedInterview?.status !== "Completed"
        }
        secondaryActionLabel={selectedInterview?.status === "Accepted" ? (isCompleting ? "Marking done..." : "Mark Done") : undefined}
        secondaryActionDisabled={isCompleting}
        onSecondaryAction={selectedInterview?.status === "Accepted"
          ? async () => {
              if (!selectedInterview) {
                return;
              }

              const didComplete = await handleComplete(selectedInterview);
              if (didComplete) {
                closeRescheduleModal();
              }
            }
          : undefined}
        isCanceling={pendingActionId === selectedInterview?.id}
        onCancelInterview={async () => {
          if (!selectedInterview) {
            return;
          }

          const didCancel = await handleCancel(selectedInterview);
          if (didCancel) {
            closeRescheduleModal();
          }
        }}
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
