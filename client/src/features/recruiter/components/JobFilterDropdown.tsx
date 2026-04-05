import Dropdown, { type DropdownOption } from '@shared/components/form/Dropdown';
import type {
  ApplicantJobFilterOption,
  ApplicantStageCounts,
  CandidateFilters,
} from '@features/recruiter/types';

interface JobFilterDropdownProps {
  jobs: ApplicantJobFilterOption[];
  filters: CandidateFilters;
  counts: ApplicantStageCounts;
  onChange?: (event: { target: { name: string; value: string } }) => void;
}

const getStageCount = (stage: string, source: ApplicantStageCounts) => {
  const normalized = stage.toLowerCase();
  if (normalized === 'recommended') return source.recommended;
  if (normalized === 'shortlisted') return source.shortlisted;
  if (normalized === 'interview') return source.interview;
  if (normalized === 'offer') return source.offer;

  return source.all_applicants;
};

export default function JobFilterDropdown({ jobs, filters, counts, onChange }: JobFilterDropdownProps) {
  const visibleJobs = filters.department === 'all'
    ? jobs
    : jobs.filter((job) => job.department.toLowerCase() === filters.department.toLowerCase());

  const options: DropdownOption[] = [
    {
      value: 'all',
      label: 'All jobs',
      count: getStageCount(filters.stage, counts),
      accentClassName: 'bg-violet-100 text-violet-700',
    },
    ...visibleJobs.map((job) => ({
      value: job.id,
      label: job.title,
      count: getStageCount(filters.stage, job),
      accentClassName: 'bg-zinc-100 text-zinc-700',
    })),
  ];

  return (
    <Dropdown
      label="Jobs"
      name="jobId"
      value={filters.jobId}
      options={options}
      onChange={onChange}
      className="w-full min-w-0"
    />
  );
}

