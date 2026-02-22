import { Form, Link, useLoaderData } from 'react-router-dom';
import { Card } from '@shared/components/Card';

export const InterviewsPage = () => {
  const { interviews, candidates, jobs } = useLoaderData() as {
    interviews: Array<{ id: string; candidateId: string; jobId: string; interviewer: string; startsAt: string; status: string; location: string }>;
    candidates: Array<{ id: string; name: string }>;
    jobs: Array<{ id: string; title: string }>;
  };

  return (
    <Card>
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-xl font-semibold">Interviews</h2>
        <Link className="rounded-lg bg-zinc-900 px-4 py-2 text-white" to="/recruiter/interviews/new">Create interview</Link>
      </div>
      <table className="min-w-full text-sm">
        <thead><tr>{['Candidate', 'Job', 'Interviewer', 'Date/Time', 'Location', 'Status', 'Actions'].map((col) => <th key={col} className="px-3 py-2 text-left">{col}</th>)}</tr></thead>
        <tbody>
          {interviews.map((item, idx) => (
            <tr key={item.id} className={idx % 2 ? 'bg-zinc-50' : ''}>
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
    </Card>
  );
};
