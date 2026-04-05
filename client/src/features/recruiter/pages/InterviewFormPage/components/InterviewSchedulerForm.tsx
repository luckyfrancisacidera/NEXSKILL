import { useEffect, useMemo, useState, type FormEvent } from "react";
import type {
  InterviewType,
  ScheduleInterviewInput,
  ShortlistedCandidateOption,
} from "@features/recruiter/types/interview.types";
import type { JobDto } from "@features/recruiter/types";
import { recruiterService } from "@features/recruiter/services/recruiter.service";
import { recruiterInterviewService } from "@features/recruiter/services/interview.service";
import { Button } from "@shared/components/actions/Button";
import { DatePicker, Dropdown, type DropdownOption } from "@shared/components/form";
import { RichTextField } from "@shared/components/form/RichTextField";
import { sanitizeRichText } from "@shared/utils/richText";

const buildScheduleConflictMessage = (message: string) => {
  const normalizedMessage = message.trim();
  if (/already has an interview scheduled at that time/i.test(normalizedMessage)) {
    return "There is already an interview scheduled at this time. Please choose a different schedule.";
  }

  return normalizedMessage || "Unable to schedule the interview. Please try again.";
};

interface InterviewSchedulerFormProps {
  onSchedule: (input: ScheduleInterviewInput) => Promise<void> | void;
  defaultDate?: string;
  onCancel?: () => void;
  title?: string;
  description?: string;
  submitLabel?: string;
  showHeader?: boolean;
}

type FormErrors = Partial<
  Record<
    | "jobId"
    | "department"
    | "jobseekerId"
    | "scheduledDate"
    | "scheduledTime"
    | "location"
    | "form",
    string
  >
>;

export const InterviewSchedulerForm = ({
  onSchedule,
  defaultDate,
  onCancel,
  title = "Create interview",
  description = "Recruiters should schedule interviews from shortlisted candidates only, not by typing raw database IDs.",
  submitLabel = "Schedule interview",
  showHeader = true,
}: InterviewSchedulerFormProps) => {
  const [jobs, setJobs] = useState<JobDto[]>([]);
  const [candidates, setCandidates] = useState<ShortlistedCandidateOption[]>([]);
  const [department, setDepartment] = useState("");
  const [jobId, setJobId] = useState("");
  const [jobseekerId, setJobseekerId] = useState("");
  const [scheduledDate, setScheduledDate] = useState("");
  const [scheduledHour, setScheduledHour] = useState("9");
  const [scheduledMinute, setScheduledMinute] = useState("00");
  const [scheduledMeridiem, setScheduledMeridiem] = useState<"AM" | "PM">("AM");
  const [interviewType, setInterviewType] = useState<InterviewType>("Virtual");
  const [meetingLink, setMeetingLink] = useState("");
  const [location, setLocation] = useState("");
  const [message, setMessage] = useState("");
  const [isLoadingJobs, setIsLoadingJobs] = useState(true);
  const [isLoadingCandidates, setIsLoadingCandidates] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});

  const departments = useMemo(
    () =>
      Array.from(
        new Set(
          jobs
            .map((job) => (job.department?.trim() ? job.department.trim() : "Unassigned")),
        ),
      ).sort((left, right) => left.localeCompare(right)),
    [jobs],
  );

  const filteredJobs = useMemo(() => {
    if (!department) {
      return jobs;
    }

    return jobs.filter(
      (job) => (job.department?.trim() ? job.department.trim() : "Unassigned") === department,
    );
  }, [department, jobs]);

  const departmentOptions = useMemo<DropdownOption[]>(
    () => [
      {
        value: "",
        label: isLoadingJobs ? "Loading departments..." : "All departments",
      },
      ...departments.map((item) => ({
        value: item,
        label: item,
      })),
    ],
    [departments, isLoadingJobs],
  );

  const jobOptions = useMemo<DropdownOption[]>(
    () => [
      {
        value: "",
        label: isLoadingJobs
          ? "Loading jobs..."
          : filteredJobs.length === 0
            ? "No jobs for this department"
            : "Select a job",
      },
      ...filteredJobs.map((job) => ({
        value: job.id,
        label: `${job.title}${job.department ? ` - ${job.department}` : ""}`,
        triggerLabel: job.title,
      })),
    ],
    [filteredJobs, isLoadingJobs],
  );

  const candidateOptions = useMemo<DropdownOption[]>(
    () => [
      {
        value: "",
        label: !jobId
          ? "Select a job first"
          : isLoadingCandidates
            ? "Loading shortlisted candidates..."
            : candidates.length === 0
              ? "No shortlisted candidates"
              : "Select a candidate",
      },
      ...candidates.map((candidate) => ({
        value: candidate.jobseekerId,
        label: `${candidate.candidateName} (${candidate.candidateEmail})`,
        triggerLabel: candidate.candidateName,
      })),
    ],
    [candidates, isLoadingCandidates, jobId],
  );

  const hourOptions = useMemo<DropdownOption[]>(
    () => Array.from({ length: 12 }, (_, index) => {
      const hour = String(index + 1);
      return { value: hour, label: hour };
    }),
    [],
  );

  const minuteOptions = useMemo<DropdownOption[]>(
    () => Array.from({ length: 60 }, (_, index) => {
      const minute = String(index).padStart(2, "0");
      return { value: minute, label: minute };
    }),
    [],
  );

  const meridiemOptions = useMemo<DropdownOption[]>(
    () => [
      { value: "AM", label: "AM" },
      { value: "PM", label: "PM" },
    ],
    [],
  );

  const interviewTypeOptions = useMemo<DropdownOption[]>(
    () => [
      { value: "Virtual", label: "Virtual" },
      { value: "Onsite", label: "Onsite" },
    ],
    [],
  );

  useEffect(() => {
    if (defaultDate) {
      setScheduledDate(defaultDate);
      clearError("scheduledDate");
    }
  }, [defaultDate]);

  useEffect(() => {
    let cancelled = false;

    const loadJobs = async () => {
      try {
        setIsLoadingJobs(true);
        const response = await recruiterService.getRecruiterJobs({
          pageNumber: 1,
          pageSize: 100,
        });

        if (!cancelled) {
          setJobs(response.items);
        }
      } catch (error) {
        if (!cancelled) {
          setErrors({
            form:
              error instanceof Error
                ? error.message
                : "Unable to load recruiter jobs right now.",
          });
        }
      } finally {
        if (!cancelled) {
          setIsLoadingJobs(false);
        }
      }
    };

    void loadJobs();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    let cancelled = false;

    const loadCandidates = async () => {
      if (!jobId) {
        setCandidates([]);
        setJobseekerId("");
        return;
      }

      try {
        setIsLoadingCandidates(true);
        setErrors((current) => {
          const next = { ...current };
          delete next.form;
          return next;
        });

        const result =
          await recruiterInterviewService.getShortlistedCandidates(jobId, department || undefined);

        if (!cancelled) {
          setCandidates(result);
          setJobseekerId((current) =>
            result.some((candidate) => candidate.jobseekerId === current)
              ? current
              : "",
          );
        }
      } catch (error) {
        if (!cancelled) {
          setCandidates([]);
          setJobseekerId("");
          setErrors({
            form:
              error instanceof Error
                ? error.message
                : "Unable to load shortlisted candidates right now.",
          });
        }
      } finally {
        if (!cancelled) {
          setIsLoadingCandidates(false);
        }
      }
    };

    void loadCandidates();

    return () => {
      cancelled = true;
    };
  }, [department, jobId]);

  useEffect(() => {
    if (!jobId) {
      return;
    }

    const selectedJob = jobs.find((job) => job.id === jobId);
    const selectedJobDepartment = selectedJob?.department?.trim() || "Unassigned";
    if (department && selectedJobDepartment !== department) {
      setJobId("");
      setJobseekerId("");
      setCandidates([]);
    }
  }, [department, jobId, jobs]);

  const clearError = (field: keyof FormErrors) => {
    setErrors((current) => {
      if (!current[field] && !current.form) {
        return current;
      }

      const next = { ...current };
      delete next[field];
      if (field !== "form") {
        delete next.form;
      }
      return next;
    });
  };

  const resetForm = () => {
    setJobseekerId("");
    setDepartment("");
    setScheduledDate("");
    setScheduledHour("9");
    setScheduledMinute("00");
    setScheduledMeridiem("AM");
    setInterviewType("Virtual");
    setMeetingLink("");
    setLocation("");
    setMessage("");
    setErrors({});
  };

  const validate = (): ScheduleInterviewInput | null => {
    const nextErrors: FormErrors = {};

    if (!jobId) {
      nextErrors.jobId = "Select a job first.";
    }

    if (!jobseekerId) {
      nextErrors.jobseekerId = "Select a shortlisted candidate.";
    }

    if (!scheduledDate) {
      nextErrors.scheduledDate = "Interview date is required.";
    }

    const selectedHour = Number(scheduledHour);
    const selectedMinute = Number(scheduledMinute);
    if (Number.isNaN(selectedHour) || Number.isNaN(selectedMinute)) {
      nextErrors.scheduledTime = "Interview time is required.";
    }

    const detailValue =
      interviewType === "Virtual" ? meetingLink.trim() : location.trim();

    if (!detailValue) {
      nextErrors.location =
        interviewType === "Virtual"
          ? "Meeting link is required."
          : "Location / address is required.";
    } else if (
      interviewType === "Virtual" &&
      !/^https?:\/\/.+/i.test(detailValue)
    ) {
      nextErrors.location =
        "Enter a valid meeting link starting with http:// or https://.";
    }

    let hour24 = selectedHour % 12;
    if (scheduledMeridiem === "PM") {
      hour24 += 12;
    }

    const scheduledDateTime = new Date(
      `${scheduledDate}T${String(hour24).padStart(2, "0")}:${String(
        selectedMinute,
      ).padStart(2, "0")}:00`,
    );

    if (Number.isNaN(scheduledDateTime.getTime())) {
      nextErrors.form = "Please provide a valid interview date and time.";
    } else if (scheduledDateTime.getTime() <= Date.now()) {
      nextErrors.form = "Please choose a future date and time.";
    }

    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) {
      return null;
    }

    return {
      jobId,
      jobseekerId,
      scheduledDate: scheduledDateTime.toISOString(),
      interviewType,
      meetingLink: interviewType === "Virtual" ? detailValue : undefined,
      location: interviewType === "Onsite" ? detailValue : undefined,
      message: sanitizeRichText(message) || undefined,
    };
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const input = validate();
    if (!input) {
      return;
    }

    setIsSubmitting(true);
    try {
      await onSchedule(input);
      resetForm();
    } catch (error) {
      setErrors((current) => ({
        ...current,
        form: buildScheduleConflictMessage(
          error instanceof Error ? error.message : "Unable to schedule the interview. Please try again.",
        ),
      }));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-4">
      {showHeader ? (
        <header>
        <p className="text-xs font-semibold uppercase tracking-wide text-zinc-400 dark:text-zinc-500">
          {title}
        </p>
        <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
          Candidate & schedule
        </h3>
        <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
          {description}
        </p>
      </header>
      ) : null}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid gap-3 md:grid-cols-2">
          <div>
            <Dropdown
              label="Department"
              name="department"
              value={department}
              options={departmentOptions}
              disabled={isLoadingJobs || isSubmitting}
              className="w-full"
              compactOnMobile={false}
              buttonClassName="h-11"
              onChange={(event) => {
                setDepartment(event.target.value);
                clearError("department");
              }}
            />
          </div>

          <div>
            <Dropdown
              label="Job"
              name="jobId"
              value={jobId}
              options={jobOptions}
              disabled={isLoadingJobs || isSubmitting}
              className="w-full"
              compactOnMobile={false}
              buttonClassName="h-11"
              onChange={(event) => {
                setJobId(event.target.value);
                clearError("jobId");
              }}
            />
            {errors.jobId ? (
              <p className="mt-1 text-[11px] text-rose-600 dark:text-rose-400">{errors.jobId}</p>
            ) : null}
          </div>

          <div className="md:col-span-2">
            <Dropdown
              label="Candidate"
              name="jobseekerId"
              value={jobseekerId}
              options={candidateOptions}
              disabled={!jobId || isLoadingCandidates || isSubmitting}
              className="w-full"
              compactOnMobile={false}
              buttonClassName="h-11"
              onChange={(event) => {
                setJobseekerId(event.target.value);
                clearError("jobseekerId");
              }}
            />
            {errors.jobseekerId ? (
              <p className="mt-1 text-[11px] text-rose-600 dark:text-rose-400">
                {errors.jobseekerId}
              </p>
            ) : null}
          </div>

          <div className="md:col-span-2">
            <DatePicker
              label="Interview date"
              value={scheduledDate}
              disabled={isSubmitting}
              className="w-full"
              onChange={(value) => {
                setScheduledDate(value);
                clearError("scheduledDate");
              }}
            />
            {errors.scheduledDate ? (
              <p className="mt-1 text-[11px] text-rose-600 dark:text-rose-400">
                {errors.scheduledDate}
              </p>
            ) : null}
          </div>

          <label className="text-xs font-medium text-zinc-700 dark:text-zinc-300 md:col-span-2">
            Interview time
            <p className="mt-1 text-[11px] text-zinc-500 dark:text-zinc-400">
              Select the time the interview will begin.
            </p>
            <div className="mt-2 grid grid-cols-3 gap-2">
              <Dropdown
                name="scheduledHour"
                value={scheduledHour}
                options={hourOptions}
                className="w-full"
                compactOnMobile={false}
                buttonClassName="h-11"
                onChange={(event) => {
                  setScheduledHour(event.target.value);
                  clearError("scheduledTime");
                }}
                disabled={isSubmitting}
              />
              <Dropdown
                name="scheduledMinute"
                value={scheduledMinute}
                options={minuteOptions}
                className="w-full"
                compactOnMobile={false}
                buttonClassName="h-11"
                onChange={(event) => {
                  setScheduledMinute(event.target.value);
                  clearError("scheduledTime");
                }}
                disabled={isSubmitting}
              />
              <Dropdown
                name="scheduledMeridiem"
                value={scheduledMeridiem}
                options={meridiemOptions}
                className="w-full"
                compactOnMobile={false}
                buttonClassName="h-11"
                onChange={(event) => {
                  setScheduledMeridiem(event.target.value as "AM" | "PM");
                  clearError("scheduledTime");
                }}
                disabled={isSubmitting}
              />
            </div>
            {errors.scheduledTime ? (
              <p className="mt-1 text-[11px] text-rose-600 dark:text-rose-400">
                {errors.scheduledTime}
              </p>
            ) : null}
          </label>

          <div className="md:col-span-2">
            <Dropdown
              label="Interview type"
              name="interviewType"
              value={interviewType}
              options={interviewTypeOptions}
              className="w-full"
              compactOnMobile={false}
              buttonClassName="h-11"
              onChange={(event) => {
                const nextType = event.target.value as InterviewType;
                setInterviewType(nextType);
                clearError("location");
                if (nextType === "Virtual") {
                  setLocation("");
                } else {
                  setMeetingLink("");
                }
              }}
              disabled={isSubmitting}
            />
          </div>
        </div>

        <div className="grid gap-3">
          {interviewType === "Virtual" ? (
            <label className="text-xs font-medium text-zinc-700 dark:text-zinc-300">
              Meeting link
              <input
                required
                type="url"
                className="mt-1 h-11 w-full rounded-xl border border-zinc-300 bg-white px-3.5 text-sm text-zinc-700 shadow-sm outline-none transition hover:border-zinc-400 focus:border-zinc-400 focus:ring-4 focus:ring-zinc-200 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200 dark:hover:border-zinc-600 dark:hover:bg-zinc-800/80 dark:focus:border-zinc-400 dark:focus:ring-white/15"
                value={meetingLink}
                onChange={(event) => {
                  setMeetingLink(event.target.value);
                  clearError("location");
                }}
                placeholder="Zoom / Teams / Meet URL"
              />
            </label>
          ) : (
            <label className="text-xs font-medium text-zinc-700 dark:text-zinc-300">
              Location / address
              <input
                required
                className="mt-1 h-11 w-full rounded-xl border border-zinc-300 bg-white px-3.5 text-sm text-zinc-700 shadow-sm outline-none transition hover:border-zinc-400 focus:border-zinc-400 focus:ring-4 focus:ring-zinc-200 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200 dark:hover:border-zinc-600 dark:hover:bg-zinc-800/80 dark:focus:border-zinc-400 dark:focus:ring-white/15"
                value={location}
                onChange={(event) => {
                  setLocation(event.target.value);
                  clearError("location");
                }}
                placeholder="Office, building, room, or full address"
              />
            </label>
          )}
          {errors.location ? (
            <p className="text-[11px] text-rose-600 dark:text-rose-400">{errors.location}</p>
          ) : null}
        </div>

        <RichTextField
          label="Message to candidate"
          value={message}
          onChange={setMessage}
          placeholder="Share interview agenda, preparation tips, or expectations."
          helperText="Keep the invite polished with agenda details, prep notes, or joining instructions."
          minHeightClassName="min-h-[170px]"
        />

        {errors.form ? (
          <div className="rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700 dark:border-rose-900/70 dark:bg-rose-950/30 dark:text-rose-300">
            {errors.form}
          </div>
        ) : null}

        <div className="grid grid-cols-1 gap-2 pt-1 sm:grid-cols-2">
          <Button
            type="submit"
            className="w-full rounded-xl px-4 py-2 text-xs"
            disabled={isLoadingJobs}
            loading={isSubmitting}
            loadingText="Scheduling"
          >
            {submitLabel}
          </Button>
          {onCancel ? (
            <Button
              type="button"
              variant="secondary"
              className="w-full rounded-xl px-4 py-2 text-xs"
              onClick={onCancel}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
          ) : (
            <div className="hidden sm:block" />
          )}
        </div>
      </form>
    </div>
  );
};
