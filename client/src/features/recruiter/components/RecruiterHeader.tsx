import { Link } from 'react-router-dom';

export const RecruiterHeader = () => (
  <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
    <div className="min-w-0">
      <h1 className="text-xl font-semibold text-zinc-900 dark:text-white sm:text-2xl">Recruiter Workspace</h1>
      <p className="text-sm text-zinc-500">Manage hiring, candidates, interviews, and automations.</p>
    </div>
    <div className="flex w-full flex-col gap-2 text-sm sm:w-auto sm:flex-row">
      <Link className="inline-flex items-center justify-center rounded-lg border border-zinc-300 bg-white px-3 py-2 hover:bg-zinc-200 dark:bg-black" to="/recruiter/job-posts/new">Add Job</Link>
      <Link className="inline-flex items-center justify-center rounded-lg border border-zinc-300 bg-white px-3 py-2 hover:bg-zinc-100 dark:bg-black" to="/recruiter/interviews/new">Schedule Interview</Link>
    </div>
  </div>
);
