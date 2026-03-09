import type { RefObject } from 'react';
import { Form } from 'react-router-dom';

import JobFilterDropdown from '@features/recruiter/components/JobFilterDropdown';
import type { ApplicantJobFilterOption, ApplicantStageCounts, CandidateFilters } from '@features/recruiter/types';
import Dropdown, { type DropdownOption } from '@shared/components/Dropdown';
import SearchField from '@shared/components/SearchField';

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
export const CandidatesFilters = ({ filters, jobs, departments, counts, isRecommendationFilterVisible, recommendedCutoffOptions, formRef, onSubmitFilters }: CandidatesFiltersProps) => (
  <Form method="get" ref={formRef} onChange={() => onSubmitFilters()} className="mb-5 mt-4 flex flex-wrap items-end gap-3">
    <SearchField label="Search" name="search" defaultValue={filters.search} placeholder="Search name or email" className="min-w-65 flex-1" />

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
      className="min-w-60"
      onChange={onSubmitFilters}
    />

    <JobFilterDropdown jobs={jobs} filters={filters} counts={counts} onChange={onSubmitFilters} />

    {isRecommendationFilterVisible ? (
      <Dropdown label="Recommended Cutoff" name="recommendedTopPercent" value={filters.recommendedTopPercent} options={recommendedCutoffOptions} className="min-w-6" buttonClassName="min-w-[240px]" onChange={onSubmitFilters} />
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
      className="min-w-44"
      onChange={onSubmitFilters}
    />
  </Form>
);
