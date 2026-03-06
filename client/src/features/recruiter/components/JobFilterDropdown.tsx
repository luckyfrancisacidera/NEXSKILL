import Dropdown, {
  type DropdownOption,
} from "@shared/components/Dropdown";

type Job = {
  id: string;
  title: string;
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
  jobOptionCounts: Map<string, number>;
  onChange?: (e: { target: { name: string; value: string } }) => void;
};

export default function JobFilterDropdown({
  jobs,
  filters,
  counts,
  jobOptionCounts,
  onChange,
}: Props) {
  const options: DropdownOption[] = [
    {
      value: "all",
      label: "All jobs",
      count: counts.all_applicants,
      accentClassName: "bg-violet-100 text-violet-700",
    },
    ...jobs.map((job) => ({
      value: job.id,
      label: job.title,
      count: jobOptionCounts.get(job.id) ?? 0,
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