import { useState } from 'react';
import { SlidersHorizontal } from 'lucide-react';
import { AppSelect, SearchInput } from '@shared/components/form';
import { FilterSnapSheet } from '@shared/components/overlay/FilterSnapSheet';

export interface JobPostsFiltersProps {
  currentDepartment: string;
  currentPageSize: number;
  currentSearch: string;
  departments: string[];
  onDepartmentChange: (department: string) => void;
  onPageSizeChange: (pageSize: string) => void;
  onSearchChange: (value: string) => void;
  onApplyMobileFilters: (filters: { department: string; pageSize: string }) => void;
}

/**
 * Shared filter row for the recruiter jobs list.
 */
export const JobPostsFilters = ({
  currentDepartment,
  currentPageSize,
  currentSearch,
  departments,
  onDepartmentChange,
  onPageSizeChange,
  onSearchChange,
  onApplyMobileFilters,
}: JobPostsFiltersProps) => {
  const [isSnapSheetOpen, setIsSnapSheetOpen] = useState(false);
  const [draftDepartment, setDraftDepartment] = useState(currentDepartment);
  const [draftPageSize, setDraftPageSize] = useState(String(currentPageSize));
  const activeFilterCount = Number(currentDepartment !== 'all');

  return (
    <div className="w-full min-w-0 max-w-full space-y-3">
      <div className="flex w-full min-w-0 items-end gap-2 lg:hidden">
        <div className="min-w-0 flex-1">
          <SearchInput
            label="Search"
            name="search"
            value={currentSearch}
            onValueChange={onSearchChange}
            placeholder="Search by title, department, or location"
          />
        </div>

        <button
          type="button"
          className="relative inline-flex h-10 shrink-0 items-center justify-center rounded-xl border border-zinc-300 bg-white px-2 text-sm font-medium text-zinc-700 shadow-sm transition hover:border-zinc-400 hover:bg-zinc-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-400 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 dark:hover:border-zinc-600 dark:hover:bg-zinc-800 md:px-2.5 lg:hidden"
          aria-label="Open job post filters"
          aria-expanded={isSnapSheetOpen}
          aria-controls="job-post-filter-snap-sheet"
          onClick={() => {
            setDraftDepartment(currentDepartment);
            setDraftPageSize(String(currentPageSize));
            setIsSnapSheetOpen(true);
          }}
        >
          <SlidersHorizontal className="h-4 w-4" />
          {activeFilterCount > 0 ? (
            <span className="absolute right-1 top-1 inline-flex min-h-4.5 min-w-4.5 items-center justify-center rounded-full bg-zinc-900 px-1 text-[10px] font-semibold leading-none text-zinc-50 dark:bg-zinc-100 dark:text-zinc-900">
              {activeFilterCount}
            </span>
          ) : null}
        </button>
      </div>

      <div className="hidden w-full min-w-0 max-w-full items-end gap-4 lg:flex lg:flex-wrap 2xl:flex-nowrap">
        <div className="min-w-0 flex-[1.6]">
          <SearchInput
            label="Search"
            name="search"
            value={currentSearch}
            compactOnMobile={false}
            onValueChange={onSearchChange}
            placeholder="Search by title, department, or location"
          />
        </div>

        <div className="min-w-0 flex-1 lg:basis-[16rem]">
          <AppSelect
            label="Department"
            name="department"
            value={currentDepartment}
            onChange={(event) => onDepartmentChange(event.target.value)}
            compactOnMobile={false}
            options={[
              { value: 'all', label: 'All departments', accentClassName: 'bg-violet-100 text-violet-700' },
              ...departments.map((department) => ({ value: department, label: department })),
            ]}
          />
        </div>

        <div className="min-w-0 lg:w-[11rem] lg:flex-none">
          <AppSelect
            label="Page Size"
            name="pageSize"
            value={String(currentPageSize)}
            onChange={(event) => onPageSizeChange(event.target.value)}
            compactOnMobile={false}
            options={['10', '20', '50'].map((value) => ({ value, label: `${value} per page` }))}
          />
        </div>
      </div>

      <FilterSnapSheet
        id="job-post-filter-snap-sheet"
        title="Filter job posts"
        description="Adjust the list, then apply the changes."
        isOpen={isSnapSheetOpen}
        contentClassName="space-y-3 text-sm"
        footer={
          <div className="flex gap-2">
            <button
              type="button"
              className="flex-1 rounded-xl border border-zinc-300 bg-white px-4 py-2.5 text-sm font-medium text-zinc-700 transition hover:border-zinc-400 hover:bg-zinc-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-400 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200 dark:hover:border-zinc-600 dark:hover:bg-zinc-800 dark:focus-visible:ring-zinc-600"
              onClick={() => {
                setDraftDepartment('all');
                setDraftPageSize('10');
              }}
            >
              Reset
            </button>
            <button
              type="button"
              className="flex-1 rounded-xl bg-zinc-800 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-zinc-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-400 dark:bg-zinc-100 dark:text-zinc-950 dark:hover:bg-zinc-200 dark:focus-visible:ring-zinc-600"
              onClick={() => {
                onApplyMobileFilters({
                  department: draftDepartment,
                  pageSize: draftPageSize,
                });
                setIsSnapSheetOpen(false);
              }}
            >
              Apply Filters
            </button>
          </div>
        }
        onClose={() => setIsSnapSheetOpen(false)}
      >
        <div className="space-y-1">
          <p className="text-[11px] font-medium uppercase tracking-[0.16em] text-zinc-500 dark:text-zinc-400">Filter options</p>
          <p className="text-[11px] text-zinc-500 dark:text-zinc-400">Compact controls for quick filtering on mobile.</p>
        </div>

        <AppSelect
          label="Department"
          name="department"
          value={draftDepartment}
          onChange={(event) => setDraftDepartment(event.target.value)}
          options={[
            { value: 'all', label: 'All departments', accentClassName: 'bg-violet-100 text-violet-700' },
            ...departments.map((department) => ({ value: department, label: department })),
          ]}
        />

        <AppSelect
          label="Page Size"
          name="pageSize"
          value={draftPageSize}
          onChange={(event) => setDraftPageSize(event.target.value)}
          options={['10', '20', '50'].map((value) => ({ value, label: `${value} per page` }))}
        />
      </FilterSnapSheet>
    </div>
  );
};
