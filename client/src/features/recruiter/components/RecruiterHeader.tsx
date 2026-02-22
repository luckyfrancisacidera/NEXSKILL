import { Link } from 'react-router-dom';

export const RecruiterHeader = () => (
  <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
    <div>
      <h1 className="text-2xl font-semibold text-zinc-900">Recruiter Workspace</h1>
      <p className="text-sm text-zinc-500">Manage hiring, candidates, interviews, and automations.</p>
    </div>
    <div className="flex gap-2 text-sm">
      <Link className="rounded-lg border border-zinc-300 px-3 py-2 hover:bg-zinc-100" to="/recruiter/job-posts/new">Add Job</Link>
      <Link className="rounded-lg border border-zinc-300 px-3 py-2 hover:bg-zinc-100" to="/recruiter/interviews/new">Schedule Interview</Link>
    </div>
  </div>
);
