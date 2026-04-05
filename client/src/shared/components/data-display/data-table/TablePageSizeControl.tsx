import { AppSelect } from "@shared/components/form";
import { cn } from "@shared/utils/cn";

export interface TablePageSizeOption {
  value: number | string;
  label?: string;
}

interface TablePageSizeControlProps {
  value: number | string;
  options?: Array<number | string | TablePageSizeOption>;
  onChange: (pageSize: number) => void;
  label?: string;
  className?: string;
  selectClassName?: string;
}

const defaultOptions: TablePageSizeOption[] = [
  { value: 10 },
  { value: 20 },
  { value: 50 },
];

const normalizeOptions = (options?: Array<number | string | TablePageSizeOption>) =>
  (options ?? defaultOptions).map((option) => {
    if (typeof option === "object") {
      return {
        value: option.value,
        label: option.label ?? String(option.value),
      };
    }

    return {
      value: option,
      label: String(option),
    };
  });

export const TablePageSizeControl = ({
  value,
  options,
  onChange,
  label = "Rows",
  className,
  selectClassName,
}: TablePageSizeControlProps) => {
  const normalizedOptions = normalizeOptions(options);

  return (
    <div
      className={cn(
        "inline-flex min-w-0 max-w-full shrink items-center justify-end",
        className,
      )}
    >
      <span className="inline-flex min-w-0 max-w-full shrink items-center">
        <AppSelect
          name={`${label.toLowerCase().replace(/\s+/g, "-")}-page-size`}
          value={String(value)}
          ariaLabel={`${label} per page`}
          className="w-auto min-w-0 max-w-full shrink"
          buttonClassName={cn("w-auto min-w-[3.25rem] max-w-full shrink sm:min-w-[8.5rem]", selectClassName)}
          size="pagination"
          options={normalizedOptions.map((option) => ({
            value: String(option.value),
            label: option.label ? (
              <span className="block truncate">{option.label}</span>
            ) : (
              String(option.value)
            ),
            triggerLabel: (
              <>
                <span className="block truncate sm:hidden">{String(option.value)}</span>
                <span className="hidden truncate sm:block">{option.label ?? `${option.value} per page`}</span>
              </>
            ),
          }))}
          onChange={(event) => onChange(Number(event.target.value))}
        />
      </span>
    </div>
  );
};
