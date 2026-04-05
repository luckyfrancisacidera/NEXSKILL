import { AppSelect } from "@shared/components/form";

type JobFilterOption = {
  value: string;
  label: string;
};

type SalaryFilterOption = {
  value: string;
  label: string;
};

type JobsFilterFieldsProps = {
  employmentTypeFilter: string;
  employmentTypeOptions: JobFilterOption[];
  salaryFilter: string;
  salaryOptions: readonly SalaryFilterOption[];
  selectButtonClassName?: string;
  compactOnMobile?: boolean;
  onEmploymentTypeChange: (value: string) => void;
  onSalaryChange: (value: string) => void;
};

export const JobsFilterFields = ({
  employmentTypeFilter,
  employmentTypeOptions,
  salaryFilter,
  salaryOptions,
  selectButtonClassName,
  compactOnMobile,
  onEmploymentTypeChange,
  onSalaryChange,
}: JobsFilterFieldsProps) => (
  <>
    <div>
      <AppSelect
        label="Salary Range"
        name="salaryFilter"
        value={salaryFilter}
        options={salaryOptions.map((option) => ({ value: option.value, label: option.label }))}
        buttonClassName={selectButtonClassName}
        compactOnMobile={compactOnMobile}
        onChange={(event) => onSalaryChange(event.target.value)}
      />
    </div>

    <div>
      <AppSelect
        label="Employment Type"
        name="employmentTypeFilter"
        value={employmentTypeFilter}
        options={employmentTypeOptions.map((option) => ({ value: option.value, label: option.label }))}
        buttonClassName={selectButtonClassName}
        compactOnMobile={compactOnMobile}
        onChange={(event) => onEmploymentTypeChange(event.target.value)}
      />
    </div>
  </>
);
