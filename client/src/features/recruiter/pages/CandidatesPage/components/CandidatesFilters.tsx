import { useEffect, useState, type RefObject } from 'react';
import { Form } from 'react-router-dom';

import JobFilterDropdown from '@features/recruiter/components/JobFilterDropdown';
import type { ApplicantJobFilterOption, ApplicantStageCounts, CandidateFilters } from '@features/recruiter/types';
import Dropdown, { type DropdownOption } from '@shared/components/Dropdown';
import { useDebounce } from '@shared/hooks/useDebounce';

export interface CandidatesFiltersProps {
  filters: CandidateFilters;
  jobs: ApplicantJobFilterOption[];
  departments: string[];
  counts: ApplicantStageCounts;
  isRecommendationFilterVisible: boolean;
  recommendedCutoffOptions: DropdownOption[];
  formRef: RefObject<HTMLFormElement | null>;
  onSubmitFilters: (event?: { target: { name: string; value: string } }) => void;
}

/**
 * Query-backed candidate filter form.
 */
export const CandidatesFilters = ({ filters, jobs, departments, counts, isRecommendationFilterVisible, recommendedCutoffOptions, formRef, onSubmitFilters }: CandidatesFiltersProps) => {
  const [searchValue, setSearchValue] = useState(filters.search);
  const debouncedSearchValue = useDebounce(searchValue, 250);

  useEffect(() => {
    setSearchValue(filters.search);
  }, [filters.search]);

  useEffect(() => {
    if (debouncedSearchValue === filters.search) {
      return;
    }

    onSubmitFilters({ target: { name: 'search', value: debouncedSearchValue } });
  }, [debouncedSearchValue, filters.search, onSubmitFilters]);

  return (
    <Form
      method="get"
      ref={formRef}
      onChange={(event) => {
        const target = event.target as unknown as HTMLInputElement | HTMLSelectElement;

        if (target.name === 'search') {
          return;
        }

        onSubmitFilters({ target: { name: target.name, value: target.value } });
      }}
      className="mt-4 mb-5 grid w-full grid-cols-1 gap-2.5 sm:grid-cols-2 sm:gap-3 xl:grid-cols-4 2xl:grid-cols-5"
    >
    <div className="w-full min-w-0">
      <label className="mb-1.5 block text-xs font-medium text-zinc-600 dark:text-zinc-400">
        Search
      </label>
      <input
        aria-label="search"
        name="search"
        value={searchValue}
        onChange={(event) => setSearchValue(event.target.value)}
        placeholder="Search name or email"
        className="h-11 w-full rounded-xl border border-zinc-300 bg-white px-3.5 text-sm text-zinc-700 shadow-sm outline-none transition placeholder:text-zinc-400 hover:border-zinc-400 focus:border-violet-500 focus:ring-4 focus:ring-violet-100 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 dark:placeholder:text-zinc-600 dark:hover:border-zinc-600 dark:focus:border-violet-600 dark:focus:ring-violet-900"
      />
    </div>

    <Dropdown
      label="Department"
      name="department"
      value={filters.department}
      options={[
        { value: 'all', label: 'All departments', accentClassName: 'bg-violet-100 text-violet-700' },
        ...departments.map((department) => ({
          value: department,
          label: department,
          accentClassName: 'bg-zinc-100 text-zinc-700',
        })),
      ]}
      className="w-full min-w-0"
      onChange={onSubmitFilters}
    />

    <JobFilterDropdown jobs={jobs} filters={filters} counts={counts} onChange={onSubmitFilters} />

    {isRecommendationFilterVisible ? (
      <Dropdown label="Recommended Cutoff" name="recommendedTopPercent" value={filters.recommendedTopPercent} options={recommendedCutoffOptions} className="w-full min-w-0" onChange={onSubmitFilters} />
    ) : (
      <input type="hidden" name="recommendedTopPercent" value={filters.recommendedTopPercent} />
    )}

    <input type="hidden" name="stage" value={filters.stage} />
    <input type="hidden" name="page" value="1" />

    <Dropdown
      label="Page Size"
      name="pageSize"
      value={filters.pageSize}
      options={['10', '20', '50'].map((value) => ({
        value,
        label: `${value} per page`,
        accentClassName: 'bg-zinc-100 text-zinc-700',
      }))}
      className="w-full min-w-0"
      onChange={onSubmitFilters}
    />
  </Form>
  );
};
