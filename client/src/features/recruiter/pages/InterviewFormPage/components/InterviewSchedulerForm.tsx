import { useState, type FormEvent } from "react";
import type { ScheduleInterviewInput } from "@features/recruiter/types/interview.types";
import { Card } from "@shared/components/Card";

interface InterviewSchedulerFormProps {
  onSchedule: (input: ScheduleInterviewInput) => Promise<void> | void;
}

export const InterviewSchedulerForm = ({
  onSchedule,
}: InterviewSchedulerFormProps) => {
  const [jobId, setJobId] = useState("");
  const [jobseekerId, setJobseekerId] = useState("");
  const [scheduledDate, setScheduledDate] = useState("");
  const [meetingLink, setMeetingLink] = useState("");
  const [location, setLocation] = useState("");
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);
    try {
      await onSchedule({
        jobId,
        jobseekerId,
        scheduledDate,
        meetingLink: meetingLink || undefined,
        location: location || undefined,
        message: message || undefined,
      });

      setJobId("");
      setJobseekerId("");
      setScheduledDate("");
      setMeetingLink("");
      setLocation("");
      setMessage("");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="space-y-4">
      <header>
        <p className="text-xs font-semibold uppercase tracking-wide text-zinc-400">
          Create interview
        </p>
        <h3 className="text-lg font-semibold text-zinc-900">
          Candidate & schedule
        </h3>
      </header>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid gap-3 md:grid-cols-2">
          <label className="text-xs font-medium text-zinc-700">
            Candidate ID
            <input
              required
              className="mt-1 w-full rounded-xl border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-800 shadow-sm outline-none transition focus:border-violet-500 focus:ring-4 focus:ring-violet-100"
              value={jobseekerId}
              onChange={(event) => setJobseekerId(event.target.value)}
              placeholder="Candidate user identifier"
            />
          </label>
          <label className="text-xs font-medium text-zinc-700">
            Job ID
            <input
              required
              className="mt-1 w-full rounded-xl border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-800 shadow-sm outline-none transition focus:border-violet-500 focus:ring-4 focus:ring-violet-100"
              value={jobId}
              onChange={(event) => setJobId(event.target.value)}
              placeholder="Job identifier"
            />
          </label>
          <label className="text-xs font-medium text-zinc-700 md:col-span-2">
            Date & time
            <input
              required
              type="datetime-local"
              className="mt-1 w-full rounded-xl border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-800 shadow-sm outline-none transition focus:border-violet-500 focus:ring-4 focus:ring-violet-100"
              value={scheduledDate}
              onChange={(event) => setScheduledDate(event.target.value)}
            />
          </label>
        </div>

        <div className="grid gap-3 md:grid-cols-2">
          <label className="text-xs font-medium text-zinc-700">
            Meeting link
            <input
              className="mt-1 w-full rounded-xl border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-800 shadow-sm outline-none transition focus:border-violet-500 focus:ring-4 focus:ring-violet-100"
              value={meetingLink}
              onChange={(event) => setMeetingLink(event.target.value)}
              placeholder="Zoom / Teams / Meet URL"
            />
          </label>
          <label className="text-xs font-medium text-zinc-700">
            Location
            <input
              className="mt-1 w-full rounded-xl border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-800 shadow-sm outline-none transition focus:border-violet-500 focus:ring-4 focus:ring-violet-100"
              value={location}
              onChange={(event) => setLocation(event.target.value)}
              placeholder="Office, onsite details, etc."
            />
          </label>
        </div>

        <label className="block text-xs font-medium text-zinc-700">
          Message to candidate
          <textarea
            rows={4}
            className="mt-1 w-full rounded-xl border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-800 shadow-sm outline-none transition focus:border-violet-500 focus:ring-4 focus:ring-violet-100"
            value={message}
            onChange={(event) => setMessage(event.target.value)}
            placeholder="Share interview agenda, preparation tips, or expectations."
          />
        </label>

        <div className="flex items-center justify-between pt-1">
          <p className="text-[11px] text-zinc-500">
            Calendar sync will be available once connected in settings.
          </p>
          <button
            type="submit"
            className="rounded-full bg-zinc-900 px-4 py-1.5 text-xs font-semibold text-white shadow-sm transition hover:bg-zinc-800 disabled:cursor-wait disabled:opacity-80"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Scheduling..." : "Schedule interview"}
          </button>
        </div>
      </form>
    </Card>
  );
};
