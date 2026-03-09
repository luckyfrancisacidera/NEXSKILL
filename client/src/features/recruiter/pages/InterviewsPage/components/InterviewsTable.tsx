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
      <tr>
        {['Candidate', 'Job', 'Interviewer', 'Date/Time', 'Location', 'Status', 'Actions'].map((column) => (
          <th key={column} className="px-3 py-2 text-left">
            {column}
          </th>
        ))}
      </tr>
    </thead>
    <tbody>
      {interviews.map((item, index) => (
        <tr key={item.id} className={index % 2 ? 'bg-zinc-50' : ''}>
          <td className="px-3 py-2">{candidates.find((candidate) => candidate.id === item.candidateId)?.name}</td>
          <td className="px-3 py-2">{jobs.find((job) => job.id === item.jobId)?.title}</td>
          <td className="px-3 py-2">{item.interviewer}</td>
          <td className="px-3 py-2">{new Date(item.startsAt).toLocaleString()}</td>
          <td className="px-3 py-2">{item.location}</td>
          <td className="px-3 py-2">{item.status}</td>
          <td className="px-3 py-2">
            <div className="flex gap-2">
              <Link className="underline" to={`/recruiter/interviews/${item.id}/edit`}>Reschedule</Link>
              <Form method="post" action={`/recruiter/interviews/${item.id}/cancel`}>
                <input type="hidden" name="cancelReason" value="Canceled by recruiter" />
                <button className="underline" type="submit">Cancel</button>
              </Form>
            </div>
          </td>
        </tr>
      ))}
    </tbody>
  </table>
);
