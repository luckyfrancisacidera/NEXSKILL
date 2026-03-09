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
  <form>
    <div className="flex min-w-0 flex-nowrap items-end gap-3 pb-1">
      <DatePicker label="Start Date" value={selected.startDate} onChange={(value) => onFieldChange('startDate', value)} className="min-w-42.5 flex-1" />
      <DatePicker label="End Date" value={selected.endDate} onChange={(value) => onFieldChange('endDate', value)} className="min-w-42.5 flex-1" />
      <div className="min-w-42.5 flex-1">
        <Dropdown label="Department" name="department" value={selected.department} options={departmentOptions} onChange={(event) => onDepartmentChange(event.target.value)} />
      </div>
      <div className="min-w-42.5 flex-1">
        <Dropdown label="Job Role" name="jobRole" value={availableJobRoleValue} options={jobRoleOptions} onChange={(event) => onFieldChange('jobRole', event.target.value)} />
      </div>
      <button type="button" className="h-11 whitespace-nowrap rounded-md border border-zinc-300 bg-white px-4 text-sm font-semibold text-zinc-700 transition hover:bg-zinc-50" onClick={onClear}>
        Clear Filters
      </button>
    </div>
  </form>
);
