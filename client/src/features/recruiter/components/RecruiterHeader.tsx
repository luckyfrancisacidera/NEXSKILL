import { Link } from 'react-router-dom';

export const RecruiterHeader = () => (
  <div className="mb-5 flex flex-col gap-2.5 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
    <div className="min-w-0">
      <h1 className="text-lg font-semibold text-zinc-900 dark:text-white sm:text-xl">Recruiter Workspace</h1>
      <p className="text-xs text-zinc-500 sm:text-sm">Manage hiring, candidates, interviews, and automations.</p>
    </div>
    <div className="flex w-full flex-col gap-2 text-xs sm:w-auto sm:flex-row sm:text-sm">
      <Link className="inline-flex min-h-[2.125rem] items-center justify-center rounded-lg border border-zinc-300 bg-white px-3 py-1.5 hover:bg-zinc-200 dark:bg-black sm:min-h-9 sm:py-2" to="/recruiter/job-posts/new">Add Job</Link>
      <Link className="inline-flex min-h-[2.125rem] items-center justify-center rounded-lg border border-zinc-300 bg-white px-3 py-1.5 hover:bg-zinc-100 dark:bg-black sm:min-h-9 sm:py-2" to="/recruiter/interviews">Schedule Interview</Link>
    </div>
  </div>
);
