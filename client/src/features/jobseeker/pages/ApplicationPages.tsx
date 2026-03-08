/* eslint-disable react-refresh/only-export-components */
import { useEffect, useState } from 'react';
import { Card } from '@shared/components/Card';
import { jobseekerService } from '@features/jobseeker/service/jobseeker.service';

export const applicationsLoader = async () => jobseekerService.getMyApplications({ pageNumber: 1, pageSize: 10 });

export const ApplicationsPage = () => {
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [data, setData] = useState<Awaited<ReturnType<typeof applicationsLoader>> | null>(null);

  useEffect(() => {
    void jobseekerService.getMyApplications({ pageNumber: 1, pageSize: 10, search, status }).then(setData);
  }, [search, status]);

  return (
    <Card className="space-y-4 overflow-x-auto">
      <h2 className="text-2xl font-semibold">Applications</h2>
      <div className="flex flex-wrap gap-2">
        <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search job/company" className="rounded border border-zinc-300 px-3 py-2 text-sm" />
        <select value={status} onChange={(e) => setStatus(e.target.value)} className="rounded border border-zinc-300 px-3 py-2 text-sm">
          <option value="">All statuses</option><option>Submitted</option><option>Reviewed</option><option>Shortlisted</option><option>Interview</option><option>Rejected</option><option>Hired</option><option>Withdrawn</option>
        </select>
      </div>
      {!data || data.items.length === 0 ? <p className="text-zinc-500">No applications found.</p> : (
        <ul className="space-y-3">
          {data.items.map((item) => (
            <li key={String(item.id)} className="rounded-lg border border-zinc-200 p-3">
              <p className="font-medium text-zinc-900">{String(item.job_title)}</p>
              <p className="text-sm text-zinc-500">{String(item.company)} · {new Date(String(item.created_at_utc)).toLocaleDateString()}</p>
              <div className="mt-2 flex flex-wrap gap-2">
                <span className="rounded bg-zinc-100 px-2 py-1 text-xs">{String(item.status)}</span>
                <button type="button" className="rounded border border-zinc-300 px-2 py-1 text-xs" onClick={() => { void jobseekerService.withdrawApplication(String(item.id)).then(() => jobseekerService.getMyApplications({ pageNumber: 1, pageSize: 10, search, status }).then(setData)); }}>Withdraw</button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
};
