export interface JobPostsFiltersProps {
  currentDepartment: string;
  currentSearch: string;
  departments: string[];
  onDepartmentChange: (department: string) => void;
  onSearchCommit: (value: string) => void;
}

/**
 * Shared filter row for the recruiter jobs list.
 */
export const JobPostsFilters = ({ currentDepartment, currentSearch, departments, onDepartmentChange, onSearchCommit }: JobPostsFiltersProps) => (
  <div className="mb-4 grid gap-3 md:grid-cols-[minmax(0,1fr)_240px]">
    <input name="search" defaultValue={currentSearch} onBlur={(event) => onSearchCommit(event.target.value.trim())} className="rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-3 py-2 text-sm text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-500 dark:placeholder:text-zinc-500" placeholder="Search by title or location" />
    <select value={currentDepartment} onChange={(event) => onDepartmentChange(event.target.value)} className="rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-3 py-2 text-sm text-zinc-900 dark:text-zinc-100" style={{ colorScheme: 'light dark' }}>
      <option value="all">All departments</option>
      {departments.map((department) => (
        <option key={department} value={department}>
          {department}
        </option>
      ))}
    </select>
  </div>
);
