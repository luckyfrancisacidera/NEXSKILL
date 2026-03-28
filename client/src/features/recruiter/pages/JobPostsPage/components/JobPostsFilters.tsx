export interface JobPostsFiltersProps {
  currentDepartment: string;
  currentSearch: string;
  departments: string[];
  onDepartmentChange: (department: string) => void;
  onSearchChange: (value: string) => void;
}

/**
 * Shared filter row for the recruiter jobs list.
 */
export const JobPostsFilters = ({
  currentDepartment,
  currentSearch,
  departments,
  onDepartmentChange,
  onSearchChange,
}: JobPostsFiltersProps) => (
  <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-[minmax(0,1fr)_240px]">
    <div>
      <label className="mb-1.5 block text-xs font-medium text-zinc-500 dark:text-zinc-400">
        Search
      </label>
      <input
        name="search"
        value={currentSearch}
        onChange={(event) => onSearchChange(event.target.value)}
        className="h-11 w-full rounded-sm border border-zinc-200 bg-white px-3.5 text-sm text-zinc-900 outline-none transition hover:border-zinc-300 focus:border-zinc-400 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 dark:hover:border-zinc-600 dark:focus:border-zinc-500"
        placeholder="Search by title, department, or location"
      />
    </div>
    <div>
      <label className="mb-1.5 block text-xs font-medium text-zinc-500 dark:text-zinc-400">
        Department
      </label>
      <select
        value={currentDepartment}
        onChange={(event) => onDepartmentChange(event.target.value)}
        className="h-11 w-full rounded-sm border border-zinc-200 bg-white px-3.5 text-sm text-zinc-900 outline-none transition hover:border-zinc-300 focus:border-zinc-400 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 dark:hover:border-zinc-600 dark:focus:border-zinc-500"
        style={{ colorScheme: 'light dark' }}
      >
        <option value="all">All departments</option>
        {departments.map((department) => (
          <option key={department} value={department}>
            {department}
          </option>
        ))}
      </select>
    </div>
  </div>
);
