import { Form, Link, useLoaderData, useSearchParams } from 'react-router-dom';
import { Card } from '@shared/components/Card';
import { RecruiterHeader } from '@features/recruiter/components/RecruiterHeader';

export const JobPostsPage = () => {
  const { jobs, total, page, pageSize, filters, candidates, options } = useLoaderData() as {
    jobs: Array<{ id: string; title: string; department: string; location: string; type: string; status: string; updatedAt: string }>;
    total: number;
    page: number;
    pageSize: number;
    filters: Record<string, string>;
    candidates: Array<{ jobId: string }>;
    options: { locations: string[]; departments: string[]; types: string[] };
  };
  const [params] = useSearchParams();
  const pageCount = Math.max(1, Math.ceil(total / pageSize));

  const filterSelect = (name: string, list: string[]) => (
    <select aria-label={name} name={name} defaultValue={filters[name] ?? 'all'} className="rounded-lg border border-zinc-300 px-3 py-2 text-sm min-w-50">
      <option value="all">All {name}</option>
      {list.map((item) => <option key={item} value={item}>{item}</option>)}
    </select>
  );

  return (
    <div className="space-y-4">
      <RecruiterHeader />
      <Card className="p-0">
        <div className="border-b border-zinc-200 p-4">
          <h2 className="text-xl font-semibold">Job Posts</h2>
        </div>
        <Form method="get" className="flex flex-wrap gap-2 border-b border-zinc-200 p-4">
          <input aria-label="search jobs" name="search" defaultValue={filters.search} className="min-w-50 rounded-lg border border-zinc-300 px-3 py-2 text-sm" placeholder="Search title / department / location" />
          {filterSelect('status', ['Open', 'Paused', 'Closed'])}
          {filterSelect('location', options.locations)}
          {filterSelect('department', options.departments)}
          {filterSelect('type', options.types)}
          <select aria-label="sort jobs" name="sort" defaultValue={filters.sort} className="rounded-lg border border-zinc-300 px-3 py-2 text-sm">
            <option value="updatedAt">Sort by recent</option>
            <option value="applicants">Sort by applicants</option>
          </select>
          <button className="rounded-lg bg-zinc-900 px-4 py-2 text-sm text-white" type="submit">Apply</button>
        </Form>

        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="sticky top-0 bg-zinc-100 text-left">
              <tr>
                {['Title', 'Department', 'Location', 'Type', 'Applicants', 'Status', 'Updated', 'Actions'].map((col) => (
                  <th key={col} className="px-4 py-3 font-medium text-zinc-700">{col}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {jobs.map((job, idx) => (
                <tr key={job.id} className={`${idx % 2 ? 'bg-zinc-50' : 'bg-white'} hover:bg-zinc-100`}>
                  <td className="px-4 py-3 font-medium">{job.title}</td>
                  <td className="px-4 py-3">{job.department}</td>
                  <td className="px-4 py-3">{job.location}</td>
                  <td className="px-4 py-3">{job.type}</td>
                  <td className="px-4 py-3">{candidates.filter((candidate) => candidate.jobId === job.id).length}</td>
                  <td className="px-4 py-3"><span className="rounded-full bg-zinc-200 px-2 py-1 text-xs">{job.status}</span></td>
                  <td className="px-4 py-3">{new Date(job.updatedAt).toLocaleDateString()}</td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <Link className="rounded border border-zinc-300 px-2 py-1" to={`/recruiter/job-posts/${job.id}`}>View</Link>
                      <Link className="rounded border border-zinc-300 px-2 py-1" to={`/recruiter/job-posts/${job.id}/edit`}>Edit</Link>
                      <Form method="post" action={`/recruiter/job-posts/${job.id}/delete`} onSubmit={(event) => { if (!window.confirm('Delete this job? Type confirmation in next step.')) event.preventDefault(); }}>
                        <input type="hidden" name="confirm" value="DELETE" />
                        <button className="rounded border border-zinc-300 px-2 py-1" type="submit">Delete</button>
                      </Form>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="flex items-center justify-between border-t border-zinc-200 p-4 text-sm">
          <span>Page {page} of {pageCount}</span>
          <div className="flex gap-2">
            <Link
              to={`/recruiter/job-posts?${new URLSearchParams({ ...Object.fromEntries(params.entries()), page: String(Math.max(1, page - 1)) }).toString()}`}
              className="rounded border border-zinc-300 px-3 py-1"
            >Prev</Link>
            <Link
              to={`/recruiter/job-posts?${new URLSearchParams({ ...Object.fromEntries(params.entries()), page: String(Math.min(pageCount, page + 1)) }).toString()}`}
              className="rounded border border-zinc-300 px-3 py-1"
            >Next</Link>
          </div>
        </div>
      </Card>
    </div>
  );
};
