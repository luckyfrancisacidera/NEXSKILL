/* eslint-disable react-refresh/only-export-components */
import { useEffect, useMemo, useState } from 'react';
import { Card } from '@shared/components/Card';
import Dropdown, { type DropdownOption } from '@shared/components/Dropdown';
import { jobseekerService } from '@features/jobseeker/service/jobseeker.service';

export const applicationsLoader = async () => jobseekerService.getMyApplications({ pageNumber: 1, pageSize: 10 });

const statusOptions: DropdownOption[] = [
  { value: '', label: 'All statuses' },
  { value: 'Applied', label: 'Applied' },
  { value: 'Interview', label: 'Interview' },
  { value: 'Hire', label: 'Hire' },
  { value: 'Rejected', label: 'Rejected' },
  { value: 'Withdrawn', label: 'Withdrawn' },
];

const badgeClassByStatus: Record<string, string> = {
  Applied: 'bg-blue-50 text-blue-700',
  Interview: 'bg-violet-50 text-violet-700',
  Hire: 'bg-emerald-50 text-emerald-700',
  Rejected: 'bg-rose-50 text-rose-700',
  Withdrawn: 'bg-zinc-100 text-zinc-700',
};

export const ApplicationsPage = () => {
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [data, setData] = useState<Awaited<ReturnType<typeof applicationsLoader>> | null>(null);
  const [withdrawingId, setWithdrawingId] = useState<string | null>(null);

  useEffect(() => {
    void jobseekerService.getMyApplications({ pageNumber: 1, pageSize: 10, search, status }).then(setData);
  }, [search, status]);

  const currentStatusOptions = useMemo(() => statusOptions, []);

  return (
    <Card className="space-y-4 min-h-screen">
      <h2 className="text-2xl font-semibold">Applications</h2>
      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <label className="mb-1.5 block text-xs font-medium text-zinc-600">Search</label>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search job/company"
            aria-label="Search applications"
            className="h-11 w-full rounded-xl border border-zinc-300 bg-white px-3.5 text-sm text-zinc-700 shadow-sm outline-none transition placeholder:text-zinc-400 hover:border-zinc-400 focus:border-violet-500 focus:ring-4 focus:ring-violet-100"
          />
        </div>
        <Dropdown
          label="Status"
          name="status"
          value={status}
          options={currentStatusOptions}
          onChange={(event) => setStatus(event.target.value)}
        />
      </div>
      {!data || data.items.length === 0 ? <p className="text-zinc-500">No applications found.</p> : (
        <ul className="space-y-3">
          {data.items.map((item) => {
            const itemId = String(item.id);
            const itemStatus = String(item.status);
            return (
              <li key={itemId} className="rounded-lg border border-zinc-200 p-3">
                <p className="font-medium text-zinc-900">{String(item.job_title)}</p>
                <p className="text-sm text-zinc-500">{String(item.company)} · {new Date(String(item.created_at_utc)).toLocaleDateString()}</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  <span className={`rounded px-2 py-1 text-xs ${badgeClassByStatus[itemStatus] ?? 'bg-zinc-100 text-zinc-700'}`}>{itemStatus}</span>
                  <button
                    type="button"
                    disabled={withdrawingId === itemId}
                    className="rounded border border-zinc-300 px-2 py-1 text-xs disabled:cursor-not-allowed disabled:opacity-60"
                    onClick={() => {
                      setWithdrawingId(itemId);
                      void jobseekerService.withdrawApplication(itemId)
                        .then(() => jobseekerService.getMyApplications({ pageNumber: 1, pageSize: 10, search, status }).then(setData))
                        .finally(() => setWithdrawingId(null));
                    }}
                  >
                    {withdrawingId === itemId ? 'Withdrawing...' : 'Withdraw'}
                  </button>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </Card>
  );
};
