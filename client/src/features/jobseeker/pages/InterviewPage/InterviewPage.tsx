import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useConfirmation } from "@shared/hooks/useConfirmation";
import { Card } from "@shared/components/Card";
import { RichTextContent } from "@shared/components/RichTextContent";
import { SideDrawer } from "@shared/components/SideDrawer";
import type { JobseekerInterview } from "@features/jobseeker/types";
import { jobseekerInterviewService } from "@features/jobseeker/services/interview.service";
import { emitNotification } from "@shared/utils/notifications";
import { downloadInterviewICS } from "@shared/utils/calendar";
import {
  publishJobseekerInterviewMutation,
  subscribeJobseekerInterviewMutations,
} from "@features/jobseeker/utils/interviewMutationSync";
import {
  interviewStatusChipClassName,
  isTerminalInterviewStatus,
} from "@shared/utils/interviewStatus";
import { JobseekerInterviewCalendar } from "./components/JobseekerInterviewCalendar";
import { RescheduleRequestForm } from "./components/RescheduleRequestForm";

export const InterviewPage = () => {
  const [interviews, setInterviews] = useState<JobseekerInterview[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [drawerActionError, setDrawerActionError] = useState<string | null>(null);
  const [pendingActionId, setPendingActionId] = useState<string | null>(null);
  const [selectedInterview, setSelectedInterview] = useState<JobseekerInterview | null>(null);
  const [showRescheduleForm, setShowRescheduleForm] = useState(false);
  const confirm = useConfirmation();

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      try {
        setIsLoading(true);
        const data = await jobseekerInterviewService.getJobseekerInterviews();
        if (!cancelled) {
          setInterviews(data);
          setError(null);
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

  useEffect(() => {
    let cancelled = false;
    const unsubscribe = subscribeJobseekerInterviewMutations(() => {
      void jobseekerInterviewService
        .getJobseekerInterviews()
        .then((data) => {
          if (!cancelled) {
            setInterviews(data);
            setError(null);
          }
        })
        .catch((nextError) => {
          if (!cancelled) {
            setError(
              nextError instanceof Error
                ? nextError.message
                : "Unable to load interviews. Please try again.",
            );
          }
        });
    });

    return () => {
      cancelled = true;
      unsubscribe();
    };
  }, []);

  const activeInterviews = useMemo(
    () => interviews.filter((interview) => !interview.isArchived),
    [interviews],
  );

  const updateInterview = (updated: JobseekerInterview) => {
    setInterviews((items) =>
      updated.isArchived
        ? items.filter((item) => item.id !== updated.id)
        : items.map((item) => (item.id === updated.id ? updated : item)),
    );
    setSelectedInterview((current) =>
      current?.id === updated.id
        ? updated.isArchived
          ? null
          : updated
        : current,
    );
  };

  const closeDrawer = () => {
    setSelectedInterview(null);
    setShowRescheduleForm(false);
    setDrawerActionError(null);
  };

  const canArchiveInterview = (status: JobseekerInterview["status"]) =>
    status === "Completed" || status === "Declined" || status === "Cancelled";

  const handleAccept = async (id: string) => {
    setDrawerActionError(null);
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
    setDrawerActionError(null);
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
    setDrawerActionError(null);
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
      setShowRescheduleForm(false);
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
    const selectedMatches = selectedInterview?.id === id;
    const interview = interviews.find((item) => item.id === id) ?? selectedInterview;
    if (selectedMatches) {
      setDrawerActionError(null);
    }

    if (interview && !canArchiveInterview(interview.status)) {
      if (selectedMatches) {
        setDrawerActionError("Only completed, declined, or cancelled interviews can be archived.");
      }
      return;
    }

    const confirmed = await confirm({
      title: "Archive interview",
      message: "Archive this completed, declined, or cancelled interview? It will be removed from active views.",
      confirmLabel: "Archive",
      accent: "violet",
    });
    if (!confirmed) return;

    setPendingActionId(id);
    try {
      const updated = await jobseekerInterviewService.archiveInterview(id);
      updateInterview(updated);
      publishJobseekerInterviewMutation({
        type: "archived",
        interview: updated,
      });
      emitNotification({
        title: "Interview archived",
        description: "The interview has been removed from your active schedule.",
        actor: "jobseeker",
      });
      closeDrawer();
    } catch (archiveError) {
      if (selectedMatches) {
        setDrawerActionError(
          archiveError instanceof Error
            ? archiveError.message
            : "Unable to archive this interview right now.",
        );
      }
    } finally {
      setPendingActionId(null);
    }
  };

  const handleDownloadCalendar = async (id: string) => {
    try {
      await downloadInterviewICS(id, "jobseeker");
      emitNotification({
        title: "Calendar download ready",
        description: "Your interview calendar invite has been downloaded.",
        actor: "jobseeker",
      });
    } catch (downloadError) {
      emitNotification({
        title: "Calendar download failed",
        description:
          downloadError instanceof Error
            ? downloadError.message
            : "Unable to download the interview calendar right now.",
        actor: "jobseeker",
      });
    }
  };

  const selectedIsPending = pendingActionId === selectedInterview?.id;
  const selectedIsTerminal = selectedInterview
    ? isTerminalInterviewStatus(selectedInterview.status)
    : false;
  const canRespond =
    Boolean(selectedInterview) &&
    !selectedIsPending &&
    !selectedIsTerminal &&
    selectedInterview?.status !== "Accepted";
  const canRequestReschedule =
    Boolean(selectedInterview) &&
    !selectedIsPending &&
    !selectedIsTerminal;
  const canArchive =
    Boolean(selectedInterview) &&
    !selectedIsPending;

  return (
    <div className="space-y-4">
      <Card className="border border-zinc-200/80 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
        <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-100">
          My Interview Page
        </h1>
        <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
          Review upcoming interviews, respond to invitations, and request schedule changes from one calendar view.
        </p>
        <Link
          to="/jobseeker/interviews/archived"
          className="mt-3 inline-flex text-sm font-medium text-zinc-700 underline-offset-4 hover:underline dark:text-zinc-300"
        >
          View archived interviews
        </Link>
      </Card>

      {error ? (
        <Card className="border border-rose-200 bg-rose-50/80 py-3 shadow-none dark:border-rose-900/70 dark:bg-rose-950/30">
          <p className="text-sm text-rose-700 dark:text-rose-300">{error}</p>
        </Card>
      ) : null}

      {isLoading ? (
        <Card className="space-y-4 border-0 bg-white py-8 shadow-[0_18px_50px_rgba(24,24,27,0.06)] dark:bg-zinc-950">
          <div className="h-6 w-48 animate-pulse rounded bg-zinc-200 dark:bg-zinc-800" />
          <div className="grid gap-4 xl:grid-cols-[300px_minmax(0,1fr)]">
            <div className="h-130 animate-pulse rounded-2xl bg-zinc-100 dark:bg-zinc-900" />
            <div className="h-130 animate-pulse rounded-2xl bg-zinc-100 dark:bg-zinc-900" />
          </div>
        </Card>
      ) : (
        <JobseekerInterviewCalendar
          interviews={activeInterviews}
          emptyStateMessage="No interviews scheduled yet."
          onSelectInterview={(interview) => {
            setSelectedInterview(interview);
            setShowRescheduleForm(false);
            setDrawerActionError(null);
          }}
        />
      )}

      <SideDrawer
        open={Boolean(selectedInterview)}
        title={selectedInterview?.jobTitle || selectedInterview?.companyName || "Interview"}
        description={
          selectedInterview?.recruiterName
            ? `Interview with ${selectedInterview.recruiterName}${selectedInterview.companyName ? ` at ${selectedInterview.companyName}` : ""}.`
            : "Review the interview details and update your response."
        }
        onClose={closeDrawer}
        widthClassName="sm:max-w-[480px]"
      >
        {selectedInterview ? (
          <div className="space-y-5">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                  {new Date(selectedInterview.scheduledDate).toLocaleString(undefined, {
                    weekday: "long",
                    month: "long",
                    day: "numeric",
                    hour: "numeric",
                    minute: "2-digit",
                  })}
                </p>
                {selectedInterview.jobTitle ? (
                  <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
                    Role: {selectedInterview.jobTitle}
                  </p>
                ) : null}
              </div>
              <span
                className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${interviewStatusChipClassName[selectedInterview.status]}`}
              >
                {selectedInterview.status}
              </span>
            </div>

            <div className="space-y-3 rounded-2xl border border-zinc-200 bg-zinc-50/70 p-4 dark:border-zinc-800 dark:bg-zinc-900/60">
              {selectedInterview.recruiterName ? (
                <p className="text-sm text-zinc-700 dark:text-zinc-200">
                  Recruiter: <span className="font-medium">{selectedInterview.recruiterName}</span>
                </p>
              ) : null}
              {selectedInterview.companyName ? (
                <p className="text-sm text-zinc-700 dark:text-zinc-200">
                  Company: <span className="font-medium">{selectedInterview.companyName}</span>
                </p>
              ) : null}
              {selectedInterview.recruiterEmail ? (
                <p className="text-sm text-zinc-700 dark:text-zinc-200">
                  Contact: <span className="font-medium">{selectedInterview.recruiterEmail}</span>
                </p>
              ) : null}
              {selectedInterview.meetingLink ? (
                <a
                  href={selectedInterview.meetingLink}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex text-sm font-medium text-zinc-900 underline-offset-4 hover:underline dark:text-zinc-100"
                >
                  Join meeting link
                </a>
              ) : selectedInterview.location ? (
                <p className="text-sm text-zinc-700 dark:text-zinc-200">
                  Location: <span className="font-medium">{selectedInterview.location}</span>
                </p>
              ) : null}
            </div>

            {selectedInterview.message ? (
              <div className="rounded-2xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-950">
                <p className="text-xs font-semibold uppercase tracking-wide text-zinc-400 dark:text-zinc-500">
                  Recruiter note
                </p>
                <RichTextContent
                  html={selectedInterview.message}
                  className="mt-2"
                />
              </div>
            ) : null}

            {selectedInterview.cancelReason ? (
              <div className="rounded-2xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm text-zinc-600 dark:border-zinc-800 dark:bg-zinc-900/60 dark:text-zinc-300">
                Cancellation reason: {selectedInterview.cancelReason}
              </div>
            ) : null}

            {drawerActionError ? (
              <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700 dark:border-rose-900/60 dark:bg-rose-950/40 dark:text-rose-200">
                {drawerActionError}
              </div>
            ) : null}

            {showRescheduleForm && canRequestReschedule ? (
              <div className="rounded-2xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-950">
                <div className="mb-4">
                  <h3 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">
                    Request Schedule Change
                  </h3>
                  <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
                    Send a note to the recruiter with the reason and your preferred timing.
                  </p>
                </div>
                <RescheduleRequestForm
                  onSubmit={async (message, attachment) => {
                    await handleRequestReschedule(selectedInterview.id, message, attachment);
                  }}
                  onCancel={() => setShowRescheduleForm(false)}
                />
              </div>
            ) : (
              <div className="space-y-3">
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    className="rounded-full border border-zinc-300 bg-white px-4 py-2 text-sm font-semibold text-zinc-800 transition hover:bg-zinc-100 disabled:cursor-not-allowed disabled:opacity-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 dark:hover:bg-zinc-800"
                    disabled={!canRespond}
                    onClick={() => void handleAccept(selectedInterview.id)}
                  >
                    Accept
                  </button>
                  <button
                    type="button"
                    className="rounded-full border border-zinc-300 bg-white px-4 py-2 text-sm font-semibold text-zinc-800 transition hover:bg-zinc-100 disabled:cursor-not-allowed disabled:opacity-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 dark:hover:bg-zinc-800"
                    disabled={!canRespond}
                    onClick={() => void handleDecline(selectedInterview.id)}
                  >
                    Decline
                  </button>
                  <button
                    type="button"
                    className="rounded-full bg-zinc-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-white"
                    disabled={!canRequestReschedule}
                    onClick={() => setShowRescheduleForm(true)}
                  >
                    Request Schedule
                  </button>
                </div>

                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    className="rounded-full border border-zinc-300 bg-white px-4 py-2 text-sm font-semibold text-zinc-700 transition hover:bg-zinc-100 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 dark:hover:bg-zinc-800"
                    onClick={() => void handleDownloadCalendar(selectedInterview.id)}
                  >
                    Add To Calendar
                  </button>
                  {canArchive ? (
                    <button
                      type="button"
                      className="rounded-full border border-zinc-300 bg-white px-4 py-2 text-sm font-semibold text-zinc-700 transition hover:bg-zinc-100 disabled:cursor-not-allowed disabled:opacity-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 dark:hover:bg-zinc-800"
                      disabled={selectedIsPending}
                      onClick={() => void handleArchive(selectedInterview.id)}
                    >
                      Archive
                    </button>
                  ) : null}
                </div>
              </div>
            )}

            {selectedIsTerminal ? (
              <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
                Completed, declined, and cancelled interviews can be archived. Other interview states need to finish or be closed first.
              </p>
            ) : null}
          </div>
        ) : null}
      </SideDrawer>
    </div>
  );
};
