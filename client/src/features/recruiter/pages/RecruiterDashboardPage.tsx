import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useLoaderData, useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowDownRight, ArrowUpRight, Expand, FileCheck2, UserCheck2, UserRoundCheck, Users, UsersRound } from 'lucide-react';

import { Card } from '@shared/components/Card';
import { RecruiterHeader } from '@features/recruiter/components/RecruiterHeader';
import { DashboardAreaChart } from '@shared/components/DashboardAreaChart';
import DatePicker from '@shared/components/DatePicker';
import Dropdown, { type DropdownOption } from '@shared/components/Dropdown';

type Metric = { value: number; previous_value: number; comparison_percent: number };
type GroupByType = 'week' | 'month' | 'year' | 'department' | 'job';
type QuickRangeType = '' | 'last7' | 'last28' | 'lastMonth';

type DashboardData = {
  filters: { departments: string[]; job_roles: string[]; job_roles_by_department: Record<string, string[]> };
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

const cards: Array<{ key: keyof DashboardData['summary']; label: string; icon: typeof Users }> = [
  { key: 'total_applicants', label: 'Total Applicants', icon: Users },
  { key: 'total_shortlisted', label: 'Shortlisted', icon: UserCheck2 },
  { key: 'total_interview', label: 'Interviewed', icon: UsersRound },
  { key: 'total_offer', label: 'Offered', icon: FileCheck2 },
  { key: 'total_hired', label: 'Hired', icon: UserRoundCheck },
];

const tabGroupBy: GroupByType[] = ['week', 'month', 'year'];
const monthFormatter = new Intl.DateTimeFormat('en-US', { month: 'long', year: 'numeric' });
const formatCompactNumber = (value: number) => Intl.NumberFormat('en-US').format(value);

const formatMonthLabel = (label: string) => {
  const monthMatch = label.match(/^(\d{4})-(\d{2})$/);
  if (!monthMatch) return label;

  const date = new Date(Number(monthMatch[1]), Number(monthMatch[2]) - 1, 1);
  if (Number.isNaN(date.getTime())) return label;

  return monthFormatter.format(date);
};

const formatDateParam = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const getQuickRange = (type: Exclude<QuickRangeType, ''>) => {
  const today = new Date();
  const end = new Date(today.getFullYear(), today.getMonth(), today.getDate());

  if (type === 'lastMonth') {
    const start = new Date(today.getFullYear(), today.getMonth() - 1, 1);
    const lastDayPrevMonth = new Date(today.getFullYear(), today.getMonth(), 0);
    return { startDate: formatDateParam(start), endDate: formatDateParam(lastDayPrevMonth) };
  }

  const days = type === 'last7' ? 6 : 27;
  const start = new Date(end);
  start.setDate(end.getDate() - days);

  return { startDate: formatDateParam(start), endDate: formatDateParam(end) };
};

export const RecruiterDashboardPage = () => {
  const data = useLoaderData() as DashboardData;
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [expanded, setExpanded] = useState(false);
  const [quickRange, setQuickRange] = useState<QuickRangeType>('');

  const selected = useMemo(
    () => ({
      startDate: searchParams.get('startDate') ?? '',
      endDate: searchParams.get('endDate') ?? '',
      department: searchParams.get('department') ?? '',
      jobRole: searchParams.get('jobRole') ?? '',
      groupBy: (searchParams.get('groupBy') as GroupByType | null) ?? 'month',
    }),
    [searchParams],
  );

  const previousRequestRef = useRef(searchParams.toString());

  useEffect(() => {
    previousRequestRef.current = searchParams.toString();
  }, [searchParams]);

  const title = useMemo(() => `${selected.groupBy[0].toUpperCase()}${selected.groupBy.slice(1)} Applicant Trends`, [selected.groupBy]);

  const updateFilters = useCallback((nextFilters: typeof selected) => {
    const next = new URLSearchParams(searchParams);

    (['startDate', 'endDate', 'department', 'jobRole', 'groupBy'] as const).forEach((key) => {
      const value = nextFilters[key]?.trim() ?? '';
      if (!value) next.delete(key);
      else next.set(key, value);
    });

    const nextQuery = next.toString();
    if (nextQuery === previousRequestRef.current) return;

    previousRequestRef.current = nextQuery;
    navigate(nextQuery ? `/recruiter/dashboard?${nextQuery}` : '/recruiter/dashboard');
  }, [navigate, searchParams]);

  const updateFilterField = <K extends keyof typeof selected>(key: K, value: (typeof selected)[K]) => {
    const nextFilters = { ...selected, [key]: value };
    updateFilters(nextFilters);
  };

  const updateGroupBy = (groupBy: GroupByType) => {
    updateFilterField('groupBy', groupBy);
  };

  const roleOptionsByDepartment = data.filters.job_roles_by_department;
  const availableJobRoles = useMemo(() => {
    if (!selected.department) return data.filters.job_roles;
    return roleOptionsByDepartment[selected.department] ?? [];
  }, [data.filters.job_roles, roleOptionsByDepartment, selected.department]);

  const availableJobRoleSet = useMemo(() => new Set(availableJobRoles), [availableJobRoles]);

  useEffect(() => {
    if (!selected.jobRole || availableJobRoleSet.has(selected.jobRole)) return;
    updateFilters({ ...selected, jobRole: '' });
  }, [availableJobRoleSet, selected, updateFilters]);

  const handleDepartmentChange = (department: string) => {
    const departmentRoles = department ? roleOptionsByDepartment[department] ?? [] : data.filters.job_roles;
    const nextJobRole = selected.jobRole && !departmentRoles.includes(selected.jobRole) ? '' : selected.jobRole;
    updateFilters({ ...selected, department, jobRole: nextJobRole });
  };

  const clearFilters = () => {
    const resetFilters = { ...selected, startDate: '', endDate: '', department: '', jobRole: '' };
    setQuickRange('');
    updateFilters(resetFilters);
  };

  const departmentOptions: DropdownOption[] = [{ value: '', label: 'All Departments' }, ...data.filters.departments.map((department) => ({ value: department, label: department }))];
  const jobRoleOptions: DropdownOption[] = [{ value: '', label: 'All Job Roles' }, ...availableJobRoles.map((role) => ({ value: role, label: role }))];
  const quickRangeOptions: DropdownOption[] = [
    { value: '', label: 'Quick Range' },
    { value: 'last7', label: 'Last 7 Days' },
    { value: 'last28', label: 'Last 28 Days' },
    { value: 'lastMonth', label: 'Last Month' },
  ];

  const handleQuickRangeChange = (value: QuickRangeType) => {
    setQuickRange(value);
    if (!value) return;

    const range = getQuickRange(value);
    const nextFilters = { ...selected, ...range };
    updateFilters(nextFilters);
  };

  const formattedTrendLabels = useMemo(() => {
    if (selected.groupBy === 'month') return data.trends.labels.map(formatMonthLabel);

    if (selected.groupBy === 'week') {
      const referenceDate = selected.startDate || selected.endDate;
      const reference = referenceDate ? new Date(referenceDate) : new Date();
      const monthYear = monthFormatter.format(reference);

      return data.trends.labels.map((label, index) => {
        if (label.match(/^\d{4}-\d{2}-W\d+$/)) {
          const parts = label.split('-');
          const date = new Date(Number(parts[0]), Number(parts[1]) - 1, 1);
          return `${monthFormatter.format(date)}, Week ${index + 1}`;
        }

        return `${monthYear}, Week ${index + 1}`;
      });
    }

    return data.trends.labels;
  }, [data.trends.labels, selected.groupBy, selected.startDate, selected.endDate]);

  return (
    <div className="space-y-6">
      <RecruiterHeader />

      <Card className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm md:p-5">
        <form>
          <div className="flex min-w-0 flex-nowrap items-end gap-3 pb-1">
            <DatePicker label="Start Date" value={selected.startDate} onChange={(value) => updateFilterField('startDate', value)} className="min-w-42.5 flex-1" />
            <DatePicker label="End Date" value={selected.endDate} onChange={(value) => updateFilterField('endDate', value)} className="min-w-42.5 flex-1" />

            <div className="min-w-42.5 flex-1">
              <Dropdown
                label="Department"
                name="department"
                value={selected.department}
                options={departmentOptions}
                onChange={(event) => handleDepartmentChange(event.target.value)}
              />
            </div>

            <div className="min-w-42.5 flex-1">
              <Dropdown
                label="Job Role"
                name="jobRole"
                value={availableJobRoleSet.has(selected.jobRole) ? selected.jobRole : ''}
                options={jobRoleOptions}
                onChange={(event) => updateFilterField('jobRole', event.target.value)}
              />
            </div>

            <button type="button" className="h-11 whitespace-nowrap rounded-md border border-zinc-300 bg-white px-4 text-sm font-semibold text-zinc-700 transition hover:bg-zinc-50" onClick={clearFilters}>
              Clear Filters
            </button>
          </div>
        </form>
      </Card>

      <section className="flex flex-nowrap gap-3 overflow-x-auto pb-1">
        {cards.map(({ key, label, icon: Icon }) => {
          const metric = data.summary[key];
          const positive = metric.comparison_percent >= 0;

          return (
            <Card key={key} className="min-w-55 flex-1 space-y-3 rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm">
              <div className="flex items-center justify-between">
                <div className="inline-flex items-center gap-2 text-sm font-medium text-zinc-700">
                  <Icon size={16} className="text-zinc-500" />
                  <span>{label}</span>
                </div>
                <p className={`inline-flex items-center gap-1 text-sm font-semibold ${positive ? 'text-emerald-600' : 'text-rose-600'}`}>
                  {positive ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                  {Math.abs(metric.comparison_percent).toFixed(0)}%
                </p>
              </div>

              <p className="text-2xl font-semibold tracking-tight text-zinc-900">{formatCompactNumber(metric.value)}</p>
            </Card>
          );
        })}
      </section>

      <Card className={expanded ? 'fixed inset-4 z-40 space-y-4 overflow-auto rounded-2xl border border-zinc-200 bg-white p-4 shadow-xl md:inset-6' : 'space-y-4 rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm'}>
        <div className="flex flex-wrap items-end justify-between gap-3 border-b border-zinc-200 pb-3">
          <div className="inline-flex rounded-lg border border-zinc-300 bg-zinc-100 p-1">
            {tabGroupBy.map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => updateGroupBy(item)}
                className={`rounded-md px-5 py-1.5 text-sm font-semibold capitalize transition ${selected.groupBy === item ? 'bg-black text-white shadow-sm' : 'text-zinc-600 hover:bg-zinc-200'}`}
              >
                {item}
              </button>
            ))}
          </div>

          <div className="flex items-end gap-2">
            <div className="min-w-42.5">
              <Dropdown
                label="Quick Filter"
                name="quickRange"
                value={quickRange}
                options={quickRangeOptions}
                onChange={(event) => handleQuickRangeChange(event.target.value as QuickRangeType)}
                buttonClassName="h-9 rounded-md"
              />
            </div>
            <button type="button" className="inline-flex items-center gap-2 rounded-md border border-zinc-300 px-3 py-1.5 text-sm font-medium text-zinc-700" onClick={() => setExpanded((v) => !v)}>
              <Expand size={16} /> {expanded ? 'Back to Dashboard' : 'Expand'}
            </button>
          </div>
        </div>

        <div>
          <h2 className="mb-3 text-sm font-semibold text-zinc-600">{title}</h2>
          <div className={expanded ? 'h-[70vh]' : 'h-96'}>
            <DashboardAreaChart labels={formattedTrendLabels} datasets={data.trends.datasets} />
          </div>
        </div>
      </Card>
    </div>
  );
};