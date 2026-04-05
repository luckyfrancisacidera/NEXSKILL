import { useState } from 'react';
import { SlidersHorizontal } from 'lucide-react';
import DatePicker from '@shared/components/form/DatePicker';
import Dropdown, { type DropdownOption } from '@shared/components/form/Dropdown';
import { FilterSnapSheet } from '@shared/components/overlay/FilterSnapSheet';

export interface DashboardFiltersValue {
  startDate: string;
  endDate: string;
  department: string;
  jobRole: string;
}

export interface DashboardFiltersProps {
  selected: DashboardFiltersValue;
  departmentOptions: DropdownOption[];
  jobRoleOptions: DropdownOption[];
  jobRoleOptionsByDepartment: Record<string, DropdownOption[]>;
  availableJobRoleValue: string;
  onFieldChange: <K extends keyof DashboardFiltersValue>(key: K, value: DashboardFiltersValue[K]) => void;
  onDepartmentChange: (department: string) => void;
  onApply: (nextFilters: DashboardFiltersValue) => void;
  onClear: () => void;
}

/**
 * Filter row for recruiter dashboard analytics.
 */
export const DashboardFilters = ({
  selected,
  departmentOptions,
  jobRoleOptions,
  jobRoleOptionsByDepartment,
  availableJobRoleValue,
  onFieldChange,
  onDepartmentChange,
  onApply,
  onClear,
}: DashboardFiltersProps) => {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [draftFilters, setDraftFilters] = useState<DashboardFiltersValue>(selected);
  const activeFilterCount =
    Number(selected.startDate !== '') +
    Number(selected.endDate !== '') +
    Number(selected.department !== '') +
    Number(selected.jobRole !== '');
  const drawerJobRoleOptions = draftFilters.department
    ? jobRoleOptionsByDepartment[draftFilters.department] ?? [{ value: '', label: 'All Job Roles' }]
    : jobRoleOptions;

  return (
    <form className="w-full min-w-0 space-y-3">
      <div className="flex justify-end lg:hidden">
        <button
          type="button"
          className="inline-flex items-center gap-2 rounded-xl border border-zinc-300 bg-white px-4 py-2.5 text-sm font-medium text-zinc-700 shadow-sm transition hover:border-zinc-400 hover:bg-zinc-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-400 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 dark:hover:border-zinc-600 dark:hover:bg-zinc-800"
          aria-label="Open dashboard filters"
          aria-expanded={isDrawerOpen}
          aria-controls="dashboard-filter-drawer"
          onClick={() => {
            setDraftFilters(selected);
            setIsDrawerOpen(true);
          }}
        >
          <SlidersHorizontal className="h-4 w-4" />
          <span>Filters</span>
          <span className="inline-flex min-w-6 items-center justify-center rounded-full bg-zinc-900 px-1.5 py-0.5 text-xs font-semibold text-zinc-50 dark:bg-zinc-100 dark:text-zinc-900">
            {activeFilterCount}
          </span>
        </button>
      </div>

      <div className="hidden grid-cols-1 gap-3 sm:grid-cols-2 lg:grid lg:grid-cols-5">
        <DatePicker
          label="Start Date"
          value={selected.startDate}
          onChange={(value) => onFieldChange('startDate', value)}
          className="w-full min-w-0"
        />

        <DatePicker
          label="End Date"
          value={selected.endDate}
          onChange={(value) => onFieldChange('endDate', value)}
          className="w-full min-w-0"
        />

        <div className="min-w-0">
          <Dropdown
            label="Department"
            name="department"
            value={selected.department}
            options={departmentOptions}
            className="w-full min-w-0"
            onChange={(event) => onDepartmentChange(event.target.value)}
          />
        </div>

        <div className="min-w-0">
          <Dropdown
            label="Job Role"
            name="jobRole"
            value={availableJobRoleValue}
            options={jobRoleOptions}
            className="w-full min-w-0"
            onChange={(event) => onFieldChange('jobRole', event.target.value)}
          />
        </div>

        <button
          type="button"
          className="h-11 w-full self-end whitespace-nowrap rounded-xl border border-zinc-300 bg-white px-4 text-sm font-semibold text-zinc-700 transition hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-400 dark:hover:bg-zinc-900"
          onClick={onClear}
        >
          Clear Filters
        </button>
      </div>

      <FilterSnapSheet
        id="dashboard-filter-drawer"
        title="Filter dashboard"
        description="Adjust the analytics scope, then apply the changes."
        isOpen={isDrawerOpen}
        footer={
          <div className="grid grid-cols-[minmax(0,1fr)_auto] gap-3">
            <button
              type="button"
              className="h-11 rounded-xl bg-zinc-800 px-4 text-sm font-medium text-white transition hover:bg-zinc-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-400 dark:bg-zinc-100 dark:text-zinc-950 dark:hover:bg-zinc-200 dark:focus-visible:ring-zinc-600"
              onClick={() => {
                onApply(draftFilters);
                setIsDrawerOpen(false);
              }}
            >
              Apply Filters
            </button>
            <button
              type="button"
              className="h-11 rounded-xl border border-zinc-300 bg-white px-4 text-sm font-medium text-zinc-700 transition hover:border-zinc-400 hover:bg-zinc-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-400 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200 dark:hover:border-zinc-600 dark:hover:bg-zinc-800 dark:focus-visible:ring-zinc-600"
              onClick={() =>
                setDraftFilters({
                  startDate: '',
                  endDate: '',
                  department: '',
                  jobRole: '',
                })
              }
            >
              Reset
            </button>
          </div>
        }
        onClose={() => setIsDrawerOpen(false)}
      >
        <DatePicker
          label="Start Date"
          value={draftFilters.startDate}
          onChange={(value) => setDraftFilters((current) => ({ ...current, startDate: value }))}
          className="w-full min-w-0"
        />

        <DatePicker
          label="End Date"
          value={draftFilters.endDate}
          onChange={(value) => setDraftFilters((current) => ({ ...current, endDate: value }))}
          className="w-full min-w-0"
        />

        <div className="min-w-0">
          <Dropdown
            label="Department"
            name="department"
            value={draftFilters.department}
            options={departmentOptions}
            className="w-full min-w-0"
            buttonClassName="h-11"
            compactOnMobile={false}
            onChange={(event) =>
              setDraftFilters((current) => ({
                ...current,
                department: event.target.value,
                jobRole: event.target.value === selected.department ? current.jobRole : '',
              }))
            }
          />
        </div>

        <div className="min-w-0">
          <Dropdown
            label="Job Role"
            name="jobRole"
            value={drawerJobRoleOptions.some((option) => option.value === draftFilters.jobRole) ? draftFilters.jobRole : ''}
            options={drawerJobRoleOptions}
            className="w-full min-w-0"
            buttonClassName="h-11"
            compactOnMobile={false}
            onChange={(event) =>
              setDraftFilters((current) => ({
                ...current,
                jobRole: event.target.value,
              }))
            }
          />
        </div>
      </FilterSnapSheet>
    </form>
  );
};

