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
import { useLoaderData, useNavigate, useSearchParams } from 'react-router-dom';
import { FileCheck2, UserCheck2, UserRoundCheck, Users, UsersRound } from 'lucide-react';

import { RecruiterHeader } from '@features/recruiter/components/RecruiterHeader';
import { DashboardFilters } from '@features/recruiter/pages/RecruiterDashboardPage/components/DashboardFilters';
import { MetricCard } from '@features/recruiter/pages/RecruiterDashboardPage/components/MetricCard';
import { TrendChartCard } from '@features/recruiter/pages/RecruiterDashboardPage/components/TrendChartCard';
import type { DashboardDto, DashboardGroupBy, DashboardQuickRange } from '@features/recruiter/types';
import { Card } from '@shared/components/Card';
import type { DropdownOption } from '@shared/components/Dropdown';

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

  return (
    <div className="space-y-6">
      <RecruiterHeader />

      <Card className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm md:p-5">
        <DashboardFilters
          selected={selected}
          departmentOptions={departmentOptions}
          jobRoleOptions={jobRoleOptions}
          availableJobRoleValue={availableJobRoleSet.has(selected.jobRole) ? selected.jobRole : ''}
          onFieldChange={updateFilterField}
          onDepartmentChange={handleDepartmentChange}
          onClear={clearFilters}
        />
      </Card>

      <section className="flex flex-nowrap gap-3 overflow-x-auto pb-1">
        {cards.map(({ key, label, icon }) => {
          const metric = data.summary[key];

          return (
            <MetricCard
              key={key}
              icon={icon}
              label={label}
              value={metric.value}
              comparisonPercent={metric.comparison_percent}
            />
          );
        })}
      </section>

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
    </div>
  );
};
