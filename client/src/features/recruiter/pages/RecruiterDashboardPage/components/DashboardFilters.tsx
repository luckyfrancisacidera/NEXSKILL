import DatePicker from '@shared/components/DatePicker';
import Dropdown, { type DropdownOption } from '@shared/components/Dropdown';

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
  availableJobRoleValue: string;
  onFieldChange: <K extends keyof DashboardFiltersValue>(key: K, value: DashboardFiltersValue[K]) => void;
  onDepartmentChange: (department: string) => void;
  onClear: () => void;
}

/**
 * Filter row for recruiter dashboard analytics.
 */
export const DashboardFilters = ({
  selected,
  departmentOptions,
  jobRoleOptions,
  availableJobRoleValue,
  onFieldChange,
  onDepartmentChange,
  onClear,
}: DashboardFiltersProps) => (
  <form className="w-full min-w-0">
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-5">
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
  </form>
);
