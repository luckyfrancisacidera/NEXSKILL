import { Form, Link } from 'react-router-dom';

import type { RecruiterInterview } from '@features/recruiter/types';

export interface InterviewListItem
  extends Pick<RecruiterInterview, 'id' | 'candidateId' | 'jobId' | 'interviewer' | 'startsAt' | 'status' | 'location'> {}

export interface InterviewsTableProps {
  interviews: InterviewListItem[];
  candidates: Array<{ id: string; name: string }>;
  jobs: Array<{ id: string; title: string }>;
}

/**
 * Recruiter interviews table with built-in row actions.
 */
export const InterviewsTable = ({ interviews, candidates, jobs }: InterviewsTableProps) => (
  <table className="min-w-full text-sm">
    <thead>
      <tr className="border-b border-zinc-200 dark:border-zinc-800">
        {['Candidate', 'Job', 'Interviewer', 'Date/Time', 'Location', 'Status', 'Actions'].map((column) => (
          <th key={column} className="px-3 py-2 text-left font-medium text-zinc-700 dark:text-zinc-400">
            {column}
          </th>
        ))}
      </tr>
    </thead>
    <tbody>
      {interviews.map((item, index) => (
        <tr key={item.id} className={`border-t border-zinc-100 ${index % 2 ? 'bg-zinc-50 dark:bg-zinc-900/40' : 'bg-white dark:bg-zinc-950'} dark:border-zinc-800`}>
          <td className="px-3 py-2 text-zinc-900 dark:text-zinc-100">{candidates.find((candidate) => candidate.id === item.candidateId)?.name}</td>
          <td className="px-3 py-2 text-zinc-700 dark:text-zinc-400">{jobs.find((job) => job.id === item.jobId)?.title}</td>
          <td className="px-3 py-2 text-zinc-700 dark:text-zinc-400">{item.interviewer}</td>
          <td className="px-3 py-2 text-zinc-700 dark:text-zinc-400">{new Date(item.startsAt).toLocaleString()}</td>
          <td className="px-3 py-2 text-zinc-700 dark:text-zinc-400">{item.location}</td>
          <td className="px-3 py-2 text-zinc-700 dark:text-zinc-400">{item.status}</td>
          <td className="px-3 py-2">
            <div className="flex gap-2">
              <Link className="text-violet-600 dark:text-violet-400 hover:underline" to={`/recruiter/interviews/${item.id}/edit`}>Reschedule</Link>
              <Form method="post" action={`/recruiter/interviews/${item.id}/cancel`}>
                <input type="hidden" name="cancelReason" value="Canceled by recruiter" />
                <button className="text-rose-600 dark:text-rose-400 hover:underline" type="submit">Cancel</button>
              </Form>
            </div>
          </td>
        </tr>
      ))}
    </tbody>
  </table>
);
