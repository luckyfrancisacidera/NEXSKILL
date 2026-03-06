import Dropdown, { type DropdownOption } from "@shared/components/Dropdown";

type Job = {
  id: string;
  title: string;
  all_applicants: number;
  recommended: number;
  shortlisted: number;
  interview: number;
  offer: number;
  hire: number;
};

type Counts = {
  all_applicants: number;
  recommended: number;
  shortlisted: number;
  interview: number;
  offer: number;
  hire: number;
};

type Filters = {
  search: string;
  stage: string;
  jobId: string;
  recommendedTopPercent: string;
};

type Props = {
  jobs: Job[];
  filters: Filters;
  counts: Counts;
  onChange?: (e: { target: { name: string; value: string } }) => void;
};

const getStageCount = (
  stage: string,
  source: { all_applicants: number; recommended: number; shortlisted: number; interview: number; offer: number; hire: number },
) => {
  const normalized = stage.toLowerCase();
  if (normalized === "recommended") return source.recommended;
  if (normalized === "shortlisted") return source.shortlisted;
  if (normalized === "interview") return source.interview;
  if (normalized === "offer") return source.offer;
  if (normalized === "hire") return source.hire;

  return source.all_applicants;
};

export default function JobFilterDropdown({ jobs, filters, counts, onChange }: Props) {
  const options: DropdownOption[] = [
    {
      value: "all",
      label: "All jobs",
      count: getStageCount(filters.stage, counts),
      accentClassName: "bg-violet-100 text-violet-700",
    },
    ...jobs.map((job) => ({
      value: job.id,
      label: job.title,
      count: getStageCount(filters.stage, job),
      accentClassName: "bg-zinc-100 text-zinc-700",
    })),
  ];

  return (
    <Dropdown
      label="Jobs"
      name="jobId"
      value={filters.jobId}
      options={options}
      onChange={onChange}
      className="min-w-70"
    />
  );
}