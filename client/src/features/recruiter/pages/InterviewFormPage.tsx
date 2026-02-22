import { Form, useActionData, useLoaderData } from 'react-router-dom';
import { Card } from '@shared/components/Card';

export const InterviewFormPage = ({ mode }: { mode: 'create' | 'edit' }) => {
  const actionData = useActionData() as { error?: string } | undefined;
  const { interview, candidates, jobs, interviewers, settings } = useLoaderData() as {
    interview?: { candidateId: string; jobId: string; interviewer: string; startsAt: string; durationMinutes: number; location: string; status: string };
    candidates: Array<{ id: string; name: string }>;
    jobs: Array<{ id: string; title: string }>;
    interviewers: string[];
    settings: { defaultInterviewDuration: number; bufferBefore: number; bufferAfter: number };
  };

  return (
    <Card className="max-w-3xl">
      <h2 className="mb-4 text-xl font-semibold">{mode === 'create' ? 'Schedule Interview' : 'Reschedule Interview'}</h2>
      {actionData?.error ? <p className="mb-3 rounded bg-zinc-100 p-2 text-sm">{actionData.error}</p> : null}
      <Form method="post" className="grid gap-3 md:grid-cols-2">
        <label className="text-sm">Candidate
          <select aria-label="candidate" name="candidateId" defaultValue={interview?.candidateId} className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2">
            {candidates.map((candidate) => <option key={candidate.id} value={candidate.id}>{candidate.name}</option>)}
          </select>
        </label>
        <label className="text-sm">Job
          <select aria-label="job" name="jobId" defaultValue={interview?.jobId} className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2">
            {jobs.map((job) => <option key={job.id} value={job.id}>{job.title}</option>)}
          </select>
        </label>
        <label className="text-sm">Interviewer
          <select aria-label="interviewer" name="interviewer" defaultValue={interview?.interviewer} className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2">
            {interviewers.map((person) => <option key={person} value={person}>{person}</option>)}
          </select>
        </label>
        <label className="text-sm">Date & time
          <input aria-label="interview date" type="datetime-local" name="startsAt" defaultValue={interview?.startsAt?.slice(0, 16)} className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2" />
        </label>
        <label className="text-sm">Location / meeting link
          <input aria-label="location" name="location" defaultValue={interview?.location} className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2" />
        </label>
        <label className="text-sm">Duration (minutes)
          <input aria-label="duration" type="number" name="durationMinutes" defaultValue={interview?.durationMinutes ?? settings.defaultInterviewDuration} className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2" />
        </label>
        <label className="text-sm">Status
          <select aria-label="status" name="status" defaultValue={interview?.status ?? 'Scheduled'} className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2">
            {['Scheduled', 'Completed', 'Canceled'].map((status) => <option key={status} value={status}>{status}</option>)}
          </select>
        </label>
        <p className="text-xs text-zinc-500">Buffer awareness: {settings.bufferBefore}m before / {settings.bufferAfter}m after.</p>
        <button className="rounded-lg bg-zinc-900 px-4 py-2 text-white md:col-span-2" type="submit">Save interview</button>
      </Form>
    </Card>
  );
};
