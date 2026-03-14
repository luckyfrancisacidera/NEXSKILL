import { useEffect, useMemo, useState, type FormEvent } from "react";
import type {
  InterviewType,
  ScheduleInterviewInput,
  ShortlistedCandidateOption,
} from "@features/recruiter/types/interview.types";
import type { JobDto } from "@features/recruiter/types";
import { recruiterService } from "@features/recruiter/service/recruiter.service";
import { recruiterInterviewService } from "@features/recruiter/services/interview.service";
import { Card } from "@shared/components/Card";

interface InterviewSchedulerFormProps {
  onSchedule: (input: ScheduleInterviewInput) => Promise<void> | void;
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
      message: message.trim() || undefined,
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
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="space-y-4 dark:border-zinc-800 dark:bg-zinc-950">
      <header>
        <p className="text-xs font-semibold uppercase tracking-wide text-zinc-400 dark:text-zinc-500">
          Create interview
        </p>
        <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
          Candidate & schedule
        </h3>
        <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
          Recruiters should schedule interviews from shortlisted candidates
          only, not by typing raw database IDs.
        </p>
      </header>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid gap-3 md:grid-cols-2">
          <label className="text-xs font-medium text-zinc-700 dark:text-zinc-300">
            Department
            <select
              value={department}
              disabled={isLoadingJobs || isSubmitting}
              onChange={(event) => {
                setDepartment(event.target.value);
                clearError("department");
              }}
              className="mt-1 w-full rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-3 py-2 text-sm text-zinc-800 dark:text-zinc-100 shadow-sm outline-none transition focus:border-violet-500 dark:focus:border-violet-600 focus:ring-4 focus:ring-violet-100 dark:focus:ring-violet-900 disabled:cursor-not-allowed disabled:bg-zinc-100 dark:disabled:bg-zinc-800"
              style={{ colorScheme: 'light dark' }}
            >
              <option value="">
                {isLoadingJobs ? "Loading departments..." : "All departments"}
              </option>
              {departments.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </label>

          <label className="text-xs font-medium text-zinc-700 dark:text-zinc-300">
            Job
            <select
              required
              value={jobId}
              disabled={isLoadingJobs || isSubmitting}
              onChange={(event) => {
                setJobId(event.target.value);
                clearError("jobId");
              }}
              className="mt-1 w-full rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-3 py-2 text-sm text-zinc-800 dark:text-zinc-100 shadow-sm outline-none transition focus:border-violet-500 dark:focus:border-violet-600 focus:ring-4 focus:ring-violet-100 dark:focus:ring-violet-900 disabled:cursor-not-allowed disabled:bg-zinc-100 dark:disabled:bg-zinc-800"
              style={{ colorScheme: 'light dark' }}
            >
              <option value="">
                {isLoadingJobs
                  ? "Loading jobs..."
                  : filteredJobs.length === 0
                    ? "No jobs for this department"
                    : "Select a job"}
              </option>
              {filteredJobs.map((job) => (
                <option key={job.id} value={job.id}>
                  {job.title}
                  {job.department ? ` - ${job.department}` : ""}
                </option>
              ))}
            </select>
            {errors.jobId ? (
              <p className="mt-1 text-[11px] text-rose-600 dark:text-rose-400">{errors.jobId}</p>
            ) : null}
          </label>

          <label className="text-xs font-medium text-zinc-700 dark:text-zinc-300">
            Candidate
            <select
              required
              value={jobseekerId}
              disabled={!jobId || isLoadingCandidates || isSubmitting}
              onChange={(event) => {
                setJobseekerId(event.target.value);
                clearError("jobseekerId");
              }}
              className="mt-1 w-full rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-3 py-2 text-sm text-zinc-800 dark:text-zinc-100 shadow-sm outline-none transition focus:border-violet-500 dark:focus:border-violet-600 focus:ring-4 focus:ring-violet-100 dark:focus:ring-violet-900 disabled:cursor-not-allowed disabled:bg-zinc-100 dark:disabled:bg-zinc-800"
              style={{ colorScheme: 'light dark' }}
            >
              <option value="">
                {!jobId
                  ? "Select a job first"
                  : isLoadingCandidates
                    ? "Loading shortlisted candidates..."
                    : candidates.length === 0
                      ? "No shortlisted candidates"
                      : "Select a candidate"}
              </option>
              {candidates.map((candidate) => (
                <option
                  key={candidate.submissionId}
                  value={candidate.jobseekerId}
                >
                  {candidate.candidateName} ({candidate.candidateEmail})
                </option>
              ))}
            </select>
            {errors.jobseekerId ? (
              <p className="mt-1 text-[11px] text-rose-600 dark:text-rose-400">
                {errors.jobseekerId}
              </p>
            ) : null}
          </label>

          <label className="text-xs font-medium text-zinc-700 dark:text-zinc-300 md:col-span-2">
            Interview date
            <input
              required
              type="date"
              className="mt-1 w-full rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-3 py-2 text-sm text-zinc-800 dark:text-zinc-100 shadow-sm outline-none transition focus:border-violet-500 dark:focus:border-violet-600 focus:ring-4 focus:ring-violet-100 dark:focus:ring-violet-900"
              value={scheduledDate}
              onChange={(event) => {
                setScheduledDate(event.target.value);
                clearError("scheduledDate");
              }}
            />
            {errors.scheduledDate ? (
              <p className="mt-1 text-[11px] text-rose-600 dark:text-rose-400">
                {errors.scheduledDate}
              </p>
            ) : null}
          </label>

          <label className="text-xs font-medium text-zinc-700 dark:text-zinc-300 md:col-span-2">
            Interview time
            <p className="mt-1 text-[11px] text-zinc-500 dark:text-zinc-400">
              Select the time the interview will begin.
            </p>
            <div className="mt-2 grid grid-cols-3 gap-2">
              <select
                className="rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-3 py-2 text-sm text-zinc-800 dark:text-zinc-100 shadow-sm outline-none transition focus:border-violet-500 dark:focus:border-violet-600 focus:ring-4 focus:ring-violet-100 dark:focus:ring-violet-900"
                value={scheduledHour}
                onChange={(event) => {
                  setScheduledHour(event.target.value);
                  clearError("scheduledTime");
                }}
                style={{ colorScheme: 'light dark' }}
              >
                {["1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12"].map(
                  (hour) => (
                    <option key={hour} value={hour}>
                      {hour}
                    </option>
                  ),
                )}
              </select>
              <select
                className="rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-3 py-2 text-sm text-zinc-800 dark:text-zinc-100 shadow-sm outline-none transition focus:border-violet-500 dark:focus:border-violet-600 focus:ring-4 focus:ring-violet-100 dark:focus:ring-violet-900"
                value={scheduledMinute}
                onChange={(event) => {
                  setScheduledMinute(event.target.value);
                  clearError("scheduledTime");
                }}
                style={{ colorScheme: 'light dark' }}
              >
                {["00", "15", "30", "45"].map((minute) => (
                  <option key={minute} value={minute}>
                    {minute}
                  </option>
                ))}
              </select>
              <select
                className="rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-3 py-2 text-sm text-zinc-800 dark:text-zinc-100 shadow-sm outline-none transition focus:border-violet-500 dark:focus:border-violet-600 focus:ring-4 focus:ring-violet-100 dark:focus:ring-violet-900"
                value={scheduledMeridiem}
                onChange={(event) => {
                  setScheduledMeridiem(event.target.value as "AM" | "PM");
                  clearError("scheduledTime");
                }}
                style={{ colorScheme: 'light dark' }}
              >
                <option value="AM">AM</option>
                <option value="PM">PM</option>
              </select>
            </div>
            {errors.scheduledTime ? (
              <p className="mt-1 text-[11px] text-rose-600 dark:text-rose-400">
                {errors.scheduledTime}
              </p>
            ) : null}
          </label>

          <label className="text-xs font-medium text-zinc-700 dark:text-zinc-300 md:col-span-2">
            Interview type
            <select
              className="mt-1 w-full rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-3 py-2 text-sm text-zinc-800 dark:text-zinc-100 shadow-sm outline-none transition focus:border-violet-500 dark:focus:border-violet-600 focus:ring-4 focus:ring-violet-100 dark:focus:ring-violet-900"
              value={interviewType}
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
              style={{ colorScheme: 'light dark' }}
            >
              <option value="Virtual">Virtual</option>
              <option value="Onsite">Onsite</option>
            </select>
          </label>
        </div>

        <div className="grid gap-3">
          {interviewType === "Virtual" ? (
            <label className="text-xs font-medium text-zinc-700 dark:text-zinc-300">
              Meeting link
              <input
                required
                type="url"
                className="mt-1 w-full rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-3 py-2 text-sm text-zinc-800 dark:text-zinc-100 shadow-sm outline-none transition focus:border-violet-500 dark:focus:border-violet-600 focus:ring-4 focus:ring-violet-100 dark:focus:ring-violet-900"
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
                className="mt-1 w-full rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-3 py-2 text-sm text-zinc-800 dark:text-zinc-100 shadow-sm outline-none transition focus:border-violet-500 dark:focus:border-violet-600 focus:ring-4 focus:ring-violet-100 dark:focus:ring-violet-900"
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

        <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300">
          Message to candidate
          <textarea
            rows={4}
            className="mt-1 w-full rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-3 py-2 text-sm text-zinc-800 dark:text-zinc-100 shadow-sm outline-none transition focus:border-violet-500 dark:focus:border-violet-600 focus:ring-4 focus:ring-violet-100 dark:focus:ring-violet-900"
            value={message}
            onChange={(event) => setMessage(event.target.value)}
            placeholder="Share interview agenda, preparation tips, or expectations."
          />
        </label>

        {errors.form ? (
          <p className="text-sm text-rose-600 dark:text-rose-400">{errors.form}</p>
        ) : null}

        <div className="flex items-center justify-between pt-1">
          <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
            Calendar sync will be available once connected in settings.
          </p>
          <button
            type="submit"
            className="rounded-full bg-zinc-900 dark:bg-violet-600 dark:hover:bg-violet-700 px-4 py-1.5 text-xs font-semibold text-white shadow-sm transition hover:bg-zinc-800 disabled:cursor-wait disabled:opacity-80"
            disabled={isSubmitting || isLoadingJobs}
          >
            {isSubmitting ? "Scheduling..." : "Schedule interview"}
          </button>
        </div>
      </form>
    </Card>
  );
};
