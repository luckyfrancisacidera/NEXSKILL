/**
 * Recruiter dashboard page for applicant analytics, trend exploration, and date-based filtering.
 *
 * Main exports:
 * - `RecruiterDashboardPage`: Route component for recruiter analytics.
 *
 * Usage notes:
 * - The route expects loader data shaped as `DashboardDto`.
 * - Filters live in the query string so dashboard views are shareable.
 * - Only supported groupings are exposed in the UI even if the API supports more.
 */
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useLoaderData, useNavigate, useNavigation, useSearchParams } from 'react-router-dom';
import {
  BriefcaseBusiness,
  Building2,
  FileCheck2,
  Filter,
  UserCheck2,
  UserRoundCheck,
  Users,
  UsersRound,
} from 'lucide-react';

import { RecruiterHeader } from '@features/recruiter/components/RecruiterHeader';
import { DashboardFilters } from '@features/recruiter/pages/RecruiterDashboardPage/components/DashboardFilters';
import { MetricCard } from '@features/recruiter/pages/RecruiterDashboardPage/components/MetricCard';
import { RecruiterDashboardSkeleton } from '@features/recruiter/pages/RecruiterDashboardPage/components/RecruiterDashboardSkeleton';
import { TrendChartCard } from '@features/recruiter/pages/RecruiterDashboardPage/components/TrendChartCard';
import { DashboardGreeting } from '@shared/components/layout/DashboardGreeting';
import type { DashboardDto, DashboardGroupBy, DashboardQuickRange } from '@features/recruiter/types';
import { DashboardEmptyState, DashboardSectionCard } from '@shared/components/layout/DashboardPrimitives';
import type { DropdownOption } from '@shared/components/form/Dropdown';
import { formatOfferCompensation } from '@shared/utils/offerCompensation';

const cards = [
  { key: 'total_applicants', label: 'Total Applicants', icon: Users },
  { key: 'total_shortlisted', label: 'Shortlisted', icon: UserCheck2 },
  { key: 'total_interview', label: 'Interviewed', icon: UsersRound },
  { key: 'total_offer', label: 'Offered', icon: FileCheck2 },
  { key: 'total_hired', label: 'Hired', icon: UserRoundCheck },
] as const;

const tabGroupBy: DashboardGroupBy[] = ['week', 'month', 'year'];
const monthFormatter = new Intl.DateTimeFormat('en-US', { month: 'long', year: 'numeric' });

const formatMonthLabel = (label: string) => {
  const monthMatch = label.match(/^(\d{4})-(\d{2})$/);
  if (!monthMatch) {
    return label;
  }

  const date = new Date(Number(monthMatch[1]), Number(monthMatch[2]) - 1, 1);
  if (Number.isNaN(date.getTime())) {
    return label;
  }

  return monthFormatter.format(date);
};

const formatDateParam = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const getQuickRange = (type: Exclude<DashboardQuickRange, ''>) => {
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

/**
 * Route component for recruiter analytics.
 */
export const RecruiterDashboardPage = () => {
  const data = useLoaderData() as DashboardDto;
  const navigate = useNavigate();
  const navigation = useNavigation();
  const [searchParams] = useSearchParams();
  const [expanded, setExpanded] = useState(false);
  const [quickRange, setQuickRange] = useState<DashboardQuickRange>('');

  const selected = useMemo(
    () => ({
      startDate: searchParams.get('startDate') ?? '',
      endDate: searchParams.get('endDate') ?? '',
      department: searchParams.get('department') ?? '',
      jobRole: searchParams.get('jobRole') ?? '',
      groupBy: (searchParams.get('groupBy') as DashboardGroupBy | null) ?? 'month',
    }),
    [searchParams],
  );

  const previousRequestRef = useRef(searchParams.toString());

  useEffect(() => {
    previousRequestRef.current = searchParams.toString();
  }, [searchParams]);

  const title = useMemo(
    () => `${selected.groupBy[0].toUpperCase()}${selected.groupBy.slice(1)} Applicant Trends`,
    [selected.groupBy],
  );
  const isLoadingDashboard = navigation.state === 'loading' && navigation.location?.pathname === '/recruiter/dashboard';

  const updateFilters = useCallback(
    (nextFilters: typeof selected) => {
      const next = new URLSearchParams(searchParams);

      (['startDate', 'endDate', 'department', 'jobRole', 'groupBy'] as const).forEach((key) => {
        const value = nextFilters[key]?.trim() ?? '';
        if (!value) {
          next.delete(key);
        } else {
          next.set(key, value);
        }
      });

      const nextQuery = next.toString();
      if (nextQuery === previousRequestRef.current) {
        return;
      }

      previousRequestRef.current = nextQuery;
      navigate(nextQuery ? `/recruiter/dashboard?${nextQuery}` : '/recruiter/dashboard');
    },
    [navigate, searchParams],
  );

  const updateFilterField = <K extends keyof typeof selected>(key: K, value: (typeof selected)[K]) => {
    updateFilters({ ...selected, [key]: value });
  };

  const roleOptionsByDepartment = data.filters.job_roles_by_department;
  const availableJobRoles = useMemo(() => {
    if (!selected.department) {
      return data.filters.job_roles;
    }

    return roleOptionsByDepartment[selected.department] ?? [];
  }, [data.filters.job_roles, roleOptionsByDepartment, selected.department]);

  const availableJobRoleSet = useMemo(() => new Set(availableJobRoles), [availableJobRoles]);

  useEffect(() => {
    if (!selected.jobRole || availableJobRoleSet.has(selected.jobRole)) {
      return;
    }

    updateFilters({ ...selected, jobRole: '' });
  }, [availableJobRoleSet, selected, updateFilters]);

  const handleDepartmentChange = (department: string) => {
    const departmentRoles = department ? roleOptionsByDepartment[department] ?? [] : data.filters.job_roles;
    const nextJobRole = selected.jobRole && !departmentRoles.includes(selected.jobRole) ? '' : selected.jobRole;
    updateFilters({ ...selected, department, jobRole: nextJobRole });
  };

  const clearFilters = () => {
    setQuickRange('');
    updateFilters({ ...selected, startDate: '', endDate: '', department: '', jobRole: '' });
  };

  const departmentOptions: DropdownOption[] = [
    { value: '', label: 'All Departments' },
    ...data.filters.departments.map((department) => ({ value: department, label: department })),
  ];
  const jobRoleOptions: DropdownOption[] = [
    { value: '', label: 'All Job Roles' },
    ...availableJobRoles.map((role) => ({ value: role, label: role })),
  ];
  const jobRoleOptionsByDepartment = useMemo(
    () =>
      Object.fromEntries(
        Object.entries(roleOptionsByDepartment).map(([department, roles]) => [
          department,
          [{ value: '', label: 'All Job Roles' }, ...roles.map((role) => ({ value: role, label: role }))],
        ]),
      ),
    [roleOptionsByDepartment],
  );
  const quickRangeOptions: DropdownOption[] = [
    { value: '', label: 'Quick Range' },
    { value: 'last7', label: 'Last 7 Days' },
    { value: 'last28', label: 'Last 28 Days' },
    { value: 'lastMonth', label: 'Last Month' },
  ];

  const handleQuickRangeChange = (value: DashboardQuickRange) => {
    setQuickRange(value);
    if (!value) {
      return;
    }

    updateFilters({ ...selected, ...getQuickRange(value) });
  };

  const formattedTrendLabels = useMemo(() => {
    if (selected.groupBy === 'month') {
      return data.trends.labels.map(formatMonthLabel);
    }

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

  const summaryCards = cards.slice(0, 4);
  const hiredMetric = data.summary.total_hired;
  const topJobPosts: Array<{ name: string; department: string; applications: number; status: string }> = [];
  const totalSummaryValue = cards.reduce((sum, card) => sum + data.summary[card.key].value, 0);
  const hasActivity = totalSummaryValue > 0 || data.trends.datasets.some((dataset) => dataset.data.some((value) => value > 0));

  return (
    <div className="min-w-0 space-y-6">
      <RecruiterHeader />

      <DashboardGreeting
        badge="Recruiter overview"
        subtitle="Here's what's happening today across your hiring funnel, team filters, and job performance."
        stats={[
          { label: 'Departments', value: data.filters.departments.length },
          { label: 'Roles in scope', value: availableJobRoles.length },
        ]}
      />

      <DashboardSectionCard
        title="Dashboard Filters"
        description="Refine applicant trends and job insights by date range, department, and role."
        action={
          <div className="inline-flex items-center gap-2 rounded-full bg-zinc-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-zinc-500 dark:bg-zinc-900 dark:text-zinc-400">
            <Filter className="h-3.5 w-3.5" />
            Recruiter view
          </div>
        }
      >
        <DashboardFilters
          selected={selected}
          departmentOptions={departmentOptions}
          jobRoleOptions={jobRoleOptions}
          jobRoleOptionsByDepartment={jobRoleOptionsByDepartment}
          availableJobRoleValue={availableJobRoleSet.has(selected.jobRole) ? selected.jobRole : ''}
          onFieldChange={updateFilterField}
          onDepartmentChange={handleDepartmentChange}
          onApply={(nextFilters) => updateFilters({ ...selected, ...nextFilters })}
          onClear={clearFilters}
        />
      </DashboardSectionCard>

      {isLoadingDashboard ? (
        <RecruiterDashboardSkeleton />
      ) : (
        <>
      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {summaryCards.map(({ key, label, icon }) => {
          const metric = data.summary[key];
          const valueDisplay = key === 'total_offer'
            ? formatOfferCompensation(metric.value, metric.normalized_unit)
            : undefined;

          return (
            <MetricCard
              key={key}
              icon={icon}
              label={label}
              value={metric.value}
              comparisonPercent={metric.comparison_percent}
              valueDisplay={valueDisplay}
            />
          );
        })}
      </section>

      <section className="grid gap-6 xl:grid-cols-[minmax(0,1.7fr)_minmax(320px,1fr)]">
        <TrendChartCard
          expanded={expanded}
          title={title}
          groupBy={selected.groupBy}
          groupOptions={tabGroupBy}
          quickRange={quickRange}
          quickRangeOptions={quickRangeOptions}
          labels={formattedTrendLabels}
          datasets={data.trends.datasets}
          onGroupByChange={(value) => updateFilterField('groupBy', value)}
          onQuickRangeChange={handleQuickRangeChange}
          onToggleExpanded={() => setExpanded((value) => !value)}
        />

        <DashboardSectionCard
          title="Top Job Posts"
          description={selected.department ? `Top 5 jobs for ${selected.department}.` : 'Top 5 jobs based on available dashboard performance data.'}
          className="h-full"
          contentClassName="p-6"
        >
          {topJobPosts.length > 0 ? (
            <div className="space-y-3">
              {topJobPosts.slice(0, 5).map((job, index) => (
                <div
                  key={`${job.name}-${index}`}
                  className="rounded-2xl border border-zinc-200 bg-zinc-50/70 p-4 transition hover:border-zinc-300 hover:bg-white dark:border-zinc-800 dark:bg-zinc-900/60 dark:hover:border-zinc-700 dark:hover:bg-zinc-900"
                >
                  <div className="flex items-start gap-4">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white text-sm font-semibold text-zinc-600 shadow-sm dark:bg-zinc-950 dark:text-zinc-300">
                      {index + 1}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-semibold text-zinc-950 dark:text-zinc-100">{job.name}</p>
                      <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">{job.department}</p>
                      <div className="mt-3 flex flex-wrap gap-2">
                        <span className="rounded-full border border-zinc-200 bg-white px-2.5 py-1 text-xs font-medium text-zinc-600 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-300">
                          {job.applications} applications
                        </span>
                        <span className="rounded-full border border-zinc-200 bg-white px-2.5 py-1 text-xs font-medium text-zinc-600 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-300">
                          {job.status}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <DashboardEmptyState
              compact
              icon={BriefcaseBusiness}
              title="No top job posts yet"
              description={
                selected.department
                  ? `No ranked job-post performance data is available yet for ${selected.department}.`
                  : 'No ranked job-post performance data is available yet.'
              }
            />
          )}
        </DashboardSectionCard>
      </section>

      <section className="grid gap-6 xl:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)]">
        <DashboardSectionCard
          title="Hiring Snapshot"
          description="A quick read on the current funnel mix and final outcomes."
        >
          {hasActivity ? (
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-2xl border border-zinc-200 bg-zinc-50/70 p-4 dark:border-zinc-800 dark:bg-zinc-900/60 sm:p-5">
                <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">Hired Candidates</p>
                <p className="mt-3 text-2xl font-semibold text-zinc-950 dark:text-zinc-100 sm:text-3xl">{hiredMetric.value}</p>
                <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
                  {hiredMetric.comparison_percent >= 0 ? '+' : ''}
                  {hiredMetric.comparison_percent.toFixed(0)}% versus the previous period.
                </p>
              </div>
              <div className="rounded-2xl border border-zinc-200 bg-zinc-50/70 p-4 dark:border-zinc-800 dark:bg-zinc-900/60 sm:p-5">
                <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">Department Filters</p>
                <p className="mt-3 text-2xl font-semibold text-zinc-950 dark:text-zinc-100 sm:text-3xl">
                  {data.filters.departments.length}
                </p>
                <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
                  Departments currently available for recruiter-level reporting.
                </p>
              </div>
            </div>
          ) : (
            <DashboardEmptyState
              compact
              icon={Building2}
              title="No recruiter activity yet"
              description="Once your team publishes jobs and receives applications, the funnel snapshot will populate here."
            />
          )}
        </DashboardSectionCard>

        <DashboardSectionCard
          title="Coverage"
          description="Current reporting scope for jobs and departments."
        >
          <div className="space-y-3">
            <div className="rounded-2xl border border-zinc-200 bg-zinc-50/70 p-4 dark:border-zinc-800 dark:bg-zinc-900/60">
              <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">Departments in scope</p>
              <p className="mt-2 text-xl font-semibold text-zinc-950 dark:text-zinc-100 sm:text-2xl">
                {data.filters.departments.length}
              </p>
            </div>
            <div className="rounded-2xl border border-zinc-200 bg-zinc-50/70 p-4 dark:border-zinc-800 dark:bg-zinc-900/60">
              <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">Job roles in scope</p>
              <p className="mt-2 text-xl font-semibold text-zinc-950 dark:text-zinc-100 sm:text-2xl">
                {availableJobRoles.length}
              </p>
              <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
                {selected.department ? `Filtered to ${selected.department}.` : 'All available roles across the recruiter workspace.'}
              </p>
            </div>
          </div>
        </DashboardSectionCard>
      </section>
        </>
      )}
    </div>
  );
};

