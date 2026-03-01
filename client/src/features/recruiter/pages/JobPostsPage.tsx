import { Form, Link, useLoaderData, useSearchParams } from 'react-router-dom';
import { Card } from '@shared/components/Card';
import { RecruiterHeader } from '@features/recruiter/components/RecruiterHeader';

export const JobPostsPage = () => {
   const { jobs, total, page, pageSize, filters } = useLoaderData() as {
    jobs: Array<{ id: string; title: string; department?: string; location: string; employment_type: string; status: string }>;
    total: number;
    page: number;
    pageSize: number;
    filters: { search: string };
  };

  const [params] = useSearchParams();
  const pageCount = Math.max(1, Math.ceil(total / pageSize));

  return (
    <div className="space-y-6">
      <RecruiterHeader />
      <Card>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold">Job Posts</h2>
          <Link className="rounded-lg bg-zinc-900 px-4 py-2 text-sm text-white" to="/recruiter/job-posts/new">Create Job</Link>
        </div>

        <Form className="mb-4 flex gap-2">
          <input name="search" defaultValue={filters.search} className="rounded-lg border border-zinc-300 px-3 py-2 text-sm" placeholder="Search" />
          <button className="rounded-lg bg-zinc-900 px-4 py-2 text-sm text-white" type="submit">Apply</button>
        </Form>

        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-zinc-100 text-left"><tr>{['Title', 'Department', 'Location', 'Type', 'Status', 'Actions'].map((col) => <th key={col} className="px-4 py-3 font-medium text-zinc-700">{col}</th>)}</tr></thead>
            <tbody>
              {jobs.map((job, idx) => (
                  <tr key={job.id} className={`${idx % 2 ? 'bg-zinc-50' : 'bg-white'}`}>
                  <td className="px-4 py-3 font-medium">{job.title}</td>
                  <td className="px-4 py-3">{job.department ?? '-'}</td>
                  <td className="px-4 py-3">{job.location}</td>
                  <td className="px-4 py-3">{job.employment_type}</td>
                  <td className="px-4 py-3">{job.status}</td>
                  <td className="px-4 py-3"><div className="flex gap-2"><Link className="rounded border border-zinc-300 px-2 py-1" to={`/recruiter/job-posts/${job.id}`}>View</Link><Link className="rounded border border-zinc-300 px-2 py-1" to={`/recruiter/job-posts/${job.id}/edit`}>Edit</Link></div></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="flex items-center justify-between border-t border-zinc-200 p-4 text-sm">
          <span>Page {page} of {pageCount}</span>
          <div className="flex gap-2">
            <Link to={`/recruiter/job-posts?${new URLSearchParams({ ...Object.fromEntries(params.entries()), page: String(Math.max(1, page - 1)) }).toString()}`} className="rounded border border-zinc-300 px-3 py-1">Prev</Link>
            <Link to={`/recruiter/job-posts?${new URLSearchParams({ ...Object.fromEntries(params.entries()), page: String(Math.min(pageCount, page + 1)) }).toString()}`} className="rounded border border-zinc-300 px-3 py-1">Next</Link>
          </div>
        </div>
      </Card>
    </div>
  );
};
