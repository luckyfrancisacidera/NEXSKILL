import { Link } from 'react-router-dom';

export const NotAuthorized = () => (
  <div className="flex min-h-[60vh] items-center justify-center">
    <div className="rounded-xl border border-zinc-200 bg-white p-8 text-center shadow-sm">
      <h1 className="text-2xl font-semibold text-zinc-900">Not authorized</h1>
      <p className="mt-2 text-zinc-500">Your current role cannot access this page.</p>
      <Link to="/dashboard" className="mt-6 inline-block rounded-lg bg-zinc-900 px-4 py-2 text-sm text-zinc-50">
        Back to dashboard
      </Link>
    </div>
  </div>
);
