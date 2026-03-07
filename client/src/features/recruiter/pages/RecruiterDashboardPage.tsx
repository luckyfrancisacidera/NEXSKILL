import { useMemo, useState } from 'react';
import { useLoaderData, useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowDownRight, ArrowUpRight, CalendarDays, ChevronsUpDown, Expand, Shrink } from 'lucide-react';

import { Card } from '@shared/components/Card';
import { RecruiterHeader } from '@features/recruiter/components/RecruiterHeader';

import { DashboardAreaChart } from '@shared/components/DashboardAreaChart';

type Metric = { value: number; previous_value: number; comparison_percent: number };
type GroupByType = 'week' | 'month' | 'year' | 'department' | 'job';

type DashboardData = {
  filters: { departments: string[]; job_roles: string[] };
  summary: {
    total_applicants: Metric;
    total_shortlisted: Metric;
    total_interview: Metric;
    total_offer: Metric;
    total_hired: Metric;
  };
  trends: {
    labels: string[];
    datasets: Array<{ key: string; label: string; data: number[]; border_color: string; background_color: string }>;
  };
};

const cards: Array<{ key: keyof DashboardData['summary']; label: string }> = [
  { key: 'total_applicants', label: 'Applicants' },
  { key: 'total_shortlisted', label: 'Shortlisted' },
  { key: 'total_interview', label: 'Interviewed' },
  { key: 'total_offer', label: 'Offered' },
  { key: 'total_hired', label: 'Hired' },
];

const tabGroupBy: GroupByType[] = ['week', 'month', 'year'];

const formatCompactNumber = (value: number) => Intl.NumberFormat('en-US').format(value);

export const RecruiterDashboardPage = () => {
   const data = useLoaderData() as DashboardData;
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [expanded, setExpanded] = useState(false);

  const selected = {
    startDate: searchParams.get('startDate') ?? '',
    endDate: searchParams.get('endDate') ?? '',
    department: searchParams.get('department') ?? 'all',
    jobRole: searchParams.get('jobRole') ?? 'all',
    groupBy: (searchParams.get('groupBy') as GroupByType | null) ?? 'month',
  };

  const title = useMemo(() => `${selected.groupBy[0].toUpperCase()}${selected.groupBy.slice(1)} Applicant Trends`, [selected.groupBy]);

  const updateFilters = (formData: FormData) => {
    const next = new URLSearchParams(searchParams);
    ['startDate', 'endDate', 'department', 'jobRole', 'groupBy'].forEach((key) => {
      const value = String(formData.get(key) ?? '').trim();
      if (!value || value === 'all') next.delete(key);
      else next.set(key, value);
    });

    navigate(`/recruiter/dashboard?${next.toString()}`);
  };

  const updateGroupBy = (groupBy: GroupByType) => {
    const next = new URLSearchParams(searchParams);
    next.set('groupBy', groupBy);
    navigate(`/recruiter/dashboard?${next.toString()}`);
  };

  return (
    <div className="space-y-4">
     <RecruiterHeader />
        <Card className="bg-zinc-100/70 p-3">
        <form
          className="grid gap-2 md:grid-cols-5"
          onSubmit={(event) => {
            event.preventDefault();
            updateFilters(new FormData(event.currentTarget));
          }}
        >
          <label className="flex items-center gap-2 rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-700">
            <CalendarDays size={16} className="text-zinc-500" />
            <input type="date" name="startDate" defaultValue={selected.startDate} className="w-full bg-transparent outline-none" />
          </label>
          <label className="flex items-center gap-2 rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-700">
            <CalendarDays size={16} className="text-zinc-500" />
            <input type="date" name="endDate" defaultValue={selected.endDate} className="w-full bg-transparent outline-none" />
          </label>
          <label className="flex items-center gap-2 rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-700">
            <select name="department" defaultValue={selected.department} className="w-full bg-transparent outline-none">
              <option value="all">Department</option>
              {data.filters.departments.map((department) => <option key={department}>{department}</option>)}
            </select>
            <ChevronsUpDown size={14} className="text-zinc-500" />
          </label>
          <label className="flex items-center gap-2 rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-700">
            <select name="jobRole" defaultValue={selected.jobRole} className="w-full bg-transparent outline-none">
              <option value="all">Job Role</option>
              {data.filters.job_roles.map((role) => <option key={role}>{role}</option>)}
            </select>
            <ChevronsUpDown size={14} className="text-zinc-500" />
          </label>
          <div className="flex gap-2">
            <input type="hidden" name="groupBy" value={selected.groupBy} />
            <button type="submit" className="w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50">Apply</button>
            <button
              type="button"
              className="w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50"
              onClick={() => navigate('/recruiter/dashboard')}
            >
              Clear Filters
            </button>
          </div>
        </form>
      </Card>
       <section className="grid gap-3 grid-cols-5">
        {cards.map(({ key, label }) => {
          const metric = data.summary[key];
          const positive = metric.comparison_percent >= 0;
          return (
            <Card key={key} className="space-y-2 border border-zinc-200 bg-white shadow-sm">
              <p className="text-xl font-semibold tracking-tight text-zinc-800">{formatCompactNumber(metric.value)}</p>
              <div className="flex items-end justify-between gap-2 border-b border-zinc-200 pb-2">
                <p className="text-sm font-inter text-zinc-700">{label}</p>
                <p className={`inline-flex items-center gap-1 text-sm font-semibold ${positive ? 'text-emerald-600' : 'text-rose-600'}`}>
                  {positive ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                  {Math.abs(metric.comparison_percent).toFixed(0)}%
                </p>
              </div>
            </Card>
          );
        })}
      </section>

      <Card className={expanded ? 'space-y-4 fixed inset-6 z-40 overflow-auto border border-zinc-200 bg-white' : 'space-y-4 border border-zinc-200 bg-white'}>
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-zinc-200 pb-3">
          <div className="inline-flex rounded-md border border-zinc-200 bg-zinc-50 p-1">
            {tabGroupBy.map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => updateGroupBy(item)}
                className={`rounded px-5 py-1.5 text-sm font-medium capitalize transition ${selected.groupBy === item ? 'bg-blue-100 text-blue-700' : 'text-zinc-600 hover:bg-zinc-100'}`}
              >
                {item}
              </button>
            ))}
          </div>
            <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              className="inline-flex items-center gap-2 rounded-md border border-zinc-300 px-3 py-1.5 text-sm text-zinc-700"
              onClick={() => updateGroupBy('department')}
            >
              Department <ChevronsUpDown size={14} />
            </button>
            <button
              type="button"
              className="inline-flex items-center gap-2 rounded-md border border-zinc-300 px-3 py-1.5 text-sm text-zinc-700"
              onClick={() => updateGroupBy('job')}
            >
              Job Role <ChevronsUpDown size={14} />
            </button>
            <button type="button" className="inline-flex items-center gap-2 rounded-md border border-zinc-300 px-3 py-1.5 text-sm" onClick={() => setExpanded((v) => !v)}>
              {expanded ? <Shrink size={16} /> : <Expand size={16} />} {expanded ? 'Back to Dashboard' : 'Expand'}
            </button>
          </div>
        </div>

        <div>
          <h2 className="mb-3 text-sm font-medium text-zinc-600">{title}</h2>
          <div className={expanded ? 'h-[70vh]' : 'h-90'}>
            <DashboardAreaChart labels={data.trends.labels} datasets={data.trends.datasets} />
          </div>
        </div>
      </Card>
    </div>
  );
};
