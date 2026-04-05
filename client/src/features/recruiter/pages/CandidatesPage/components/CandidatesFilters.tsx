/* eslint-disable react-hooks/set-state-in-effect */
import { useEffect, useState } from 'react';
import { SlidersHorizontal } from 'lucide-react';

import JobFilterDropdown from '@features/recruiter/components/JobFilterDropdown';
import type { ApplicantJobFilterOption, ApplicantStageCounts, CandidateFilters } from '@features/recruiter/types';
import { Dropdown, SearchInput, type DropdownOption } from '@shared/components/form';
import { FilterSnapSheet } from '@shared/components/overlay/FilterSnapSheet';
import { useDebounce } from '@shared/hooks/useDebounce';

export interface CandidatesFiltersProps {
  filters: CandidateFilters;
  jobs: ApplicantJobFilterOption[];
  departments: string[];
  counts: ApplicantStageCounts;
  isRecommendationFilterVisible: boolean;
  recommendedCutoffOptions: DropdownOption[];
  onSearchChange: (value: string) => void;
  onFieldChange: (name: keyof CandidateFilters, value: string) => void;
  onApplyFilters: (nextFilters: CandidateFilters) => void;
}

type SnapSheetFilters = Pick<
  CandidateFilters,
  'department' | 'jobId' | 'recommendedTopPercent' | 'pageSize'
>;

export const CandidatesFilters = ({
  filters,
  jobs,
  departments,
  counts,
  isRecommendationFilterVisible,
  recommendedCutoffOptions,
  onSearchChange,
  onFieldChange,
  onApplyFilters,
}: CandidatesFiltersProps) => {
  const [searchValue, setSearchValue] = useState(filters.search);
  const [isFilterSnapSheetOpen, setIsFilterSnapSheetOpen] = useState(false);
  const [draftFilters, setDraftFilters] = useState<SnapSheetFilters>({
    department: filters.department,
    jobId: filters.jobId,
    recommendedTopPercent: filters.recommendedTopPercent,
    pageSize: filters.pageSize,
  });
  const debouncedSearchValue = useDebounce(searchValue, 250);

  useEffect(() => {
    setSearchValue(filters.search);
  }, [filters.search]);

  useEffect(() => {
    if (debouncedSearchValue === filters.search) {
      return;
    }

    onSearchChange(debouncedSearchValue);
  }, [debouncedSearchValue, filters.search, onSearchChange]);

  const activeFilterCount =
    Number(filters.department !== 'all') +
    Number(filters.jobId !== 'all') +
    Number(isRecommendationFilterVisible && filters.recommendedTopPercent !== '10');

  const departmentOptions = [
    { value: 'all', label: 'All departments', accentClassName: 'bg-violet-100 text-violet-700' },
    ...departments.map((department) => ({
      value: department,
      label: department,
      accentClassName: 'bg-zinc-100 text-zinc-700',
    })),
  ];

  const pageSizeOptions = ['10', '20', '50'].map((value) => ({
    value,
    label: `${value} per page`,
    accentClassName: 'bg-zinc-100 text-zinc-700',
  }));

  const openSnapSheet = () => {
    setDraftFilters({
      department: filters.department,
      jobId: filters.jobId,
      recommendedTopPercent: filters.recommendedTopPercent,
      pageSize: filters.pageSize,
    });
    setIsFilterSnapSheetOpen(true);
  };

  return (
    <div className="mt-4 w-full min-w-0 max-w-full space-y-3">
      <div className="flex w-full min-w-0 items-end gap-2 lg:hidden">
        <div className="min-w-0 flex-1">
          <SearchInput
            label="Search"
            ariaLabel="search"
            name="search"
            value={searchValue}
            onValueChange={setSearchValue}
            placeholder="Search name or email"
          />
        </div>

        <button
          type="button"
          className="relative inline-flex h-10 shrink-0 items-center justify-center rounded-xl border border-zinc-300 bg-white px-2 text-sm font-medium text-zinc-700 shadow-sm transition hover:border-zinc-400 hover:bg-zinc-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-400 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 dark:hover:border-zinc-600 dark:hover:bg-zinc-800 md:px-2.5"
          aria-label="Open candidate filters"
          aria-expanded={isFilterSnapSheetOpen}
          aria-controls="candidate-filter-snap-sheet"
          onClick={openSnapSheet}
        >
          <SlidersHorizontal className="h-4 w-4" />
          {activeFilterCount > 0 ? (
            <span className="absolute right-1 top-1 inline-flex min-h-4.5 min-w-4.5 items-center justify-center rounded-full bg-zinc-900 px-1 text-[10px] font-semibold leading-none text-zinc-50 dark:bg-zinc-100 dark:text-zinc-900">
              {activeFilterCount}
            </span>
          ) : null}
        </button>
      </div>

      <div className="hidden w-full min-w-0 max-w-full items-end gap-3 lg:flex lg:flex-wrap lg:gap-4 2xl:flex-nowrap">
        <div className="min-w-0 flex-[1.6]">
          <SearchInput
            label="Search"
            ariaLabel="search"
            name="search"
            value={searchValue}
            onValueChange={setSearchValue}
            placeholder="Search name or email"
            compactOnMobile={false}
          />
        </div>

        <div className="min-w-0 flex-1 lg:basis-[14rem]">
          <Dropdown
            label="Department"
            name="department"
            value={filters.department}
            options={departmentOptions}
            className="w-full min-w-0"
            onChange={(event) => onFieldChange(event.target.name as keyof CandidateFilters, event.target.value)}
          />
        </div>

        <div className="min-w-0 flex-1 lg:basis-[14rem]">
          <JobFilterDropdown
            jobs={jobs}
            filters={filters}
            counts={counts}
            onChange={(event) => onFieldChange(event.target.name as keyof CandidateFilters, event.target.value)}
          />
        </div>

        {isRecommendationFilterVisible ? (
          <div className="min-w-0 flex-1 lg:basis-[14rem]">
            <Dropdown
              label="Recommended Cutoff"
              name="recommendedTopPercent"
              value={filters.recommendedTopPercent}
              options={recommendedCutoffOptions}
              className="w-full min-w-0"
              onChange={(event) => onFieldChange(event.target.name as keyof CandidateFilters, event.target.value)}
            />
          </div>
        ) : null}

        <div className="min-w-0 lg:w-[11rem] lg:flex-none">
          <Dropdown
            label="Page Size"
            name="pageSize"
            value={filters.pageSize}
            options={pageSizeOptions}
            className="w-full min-w-0"
            onChange={(event) => onFieldChange(event.target.name as keyof CandidateFilters, event.target.value)}
          />
        </div>
      </div>

      <FilterSnapSheet
        id="candidate-filter-snap-sheet"
        title="Filters"
        description="Refine the candidate list, then apply the changes."
        isOpen={isFilterSnapSheetOpen}
        contentClassName="space-y-3 text-sm"
        footer={
          <div className="flex gap-2">
            <button
              type="button"
              className="flex-1 rounded-xl border border-zinc-300 bg-white px-4 py-2.5 text-sm font-medium text-zinc-700 transition hover:border-zinc-400 hover:bg-zinc-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-400 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200 dark:hover:border-zinc-600 dark:hover:bg-zinc-800 dark:focus-visible:ring-zinc-600"
              onClick={() =>
                setDraftFilters({
                  department: 'all',
                  jobId: 'all',
                  recommendedTopPercent: '10',
                  pageSize: '10',
                })
              }
            >
              Reset
            </button>
            <button
              type="button"
              className="flex-1 rounded-xl bg-zinc-800 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-zinc-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-400 dark:bg-zinc-100 dark:text-zinc-950 dark:hover:bg-zinc-200 dark:focus-visible:ring-zinc-600"
              onClick={() => {
                onApplyFilters({
                  ...filters,
                  ...draftFilters,
                });
                setIsFilterSnapSheetOpen(false);
              }}
            >
              Apply Filters
            </button>
          </div>
        }
        onClose={() => setIsFilterSnapSheetOpen(false)}
      >
        <div className="space-y-1">
          <p className="text-[11px] font-medium uppercase tracking-[0.16em] text-zinc-500 dark:text-zinc-400">Filter options</p>
          <p className="text-[11px] text-zinc-500 dark:text-zinc-400">Compact controls for quick filtering on mobile.</p>
        </div>

        <Dropdown
          label="Department"
          name="department"
          value={draftFilters.department}
          options={departmentOptions}
          className="w-full min-w-0"
          buttonClassName="h-10 text-sm"
          compactOnMobile={false}
          onChange={(event) =>
            setDraftFilters((current) => ({
              ...current,
              department: event.target.value,
              jobId:
                current.jobId !== 'all' &&
                !jobs.some(
                  (job) =>
                    job.id === current.jobId &&
                    event.target.value !== 'all' &&
                    job.department.toLowerCase() === event.target.value.toLowerCase(),
                )
                  ? 'all'
                  : current.jobId,
            }))
          }
        />

        <JobFilterDropdown
          jobs={jobs}
          filters={{ ...filters, ...draftFilters }}
          counts={counts}
          onChange={(event) =>
            setDraftFilters((current) => ({
              ...current,
              jobId: event.target.value,
            }))
          }
        />

        {isRecommendationFilterVisible ? (
          <Dropdown
            label="Recommended Cutoff"
            name="recommendedTopPercent"
            value={draftFilters.recommendedTopPercent}
            options={recommendedCutoffOptions}
            className="w-full min-w-0"
            buttonClassName="h-10 text-sm"
            compactOnMobile={false}
            onChange={(event) =>
              setDraftFilters((current) => ({
                ...current,
                recommendedTopPercent: event.target.value,
              }))
            }
          />
        ) : null}

        <Dropdown
          label="Page Size"
          name="pageSize"
          value={draftFilters.pageSize}
          options={pageSizeOptions}
          className="w-full min-w-0"
          buttonClassName="h-10 text-sm"
          compactOnMobile={false}
          onChange={(event) =>
            setDraftFilters((current) => ({
              ...current,
              pageSize: event.target.value,
            }))
          }
        />
      </FilterSnapSheet>
    </div>
  );
};
