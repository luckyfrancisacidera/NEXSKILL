import { ChevronDown } from "lucide-react";

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
    <label
      className={cn(
        "inline-flex min-w-0 shrink-0 items-center justify-end gap-2 text-[11px] font-medium text-zinc-500 dark:text-zinc-400 sm:text-xs",
        className,
      )}
    >
      <span className="whitespace-nowrap">{label}</span>
      <span className="relative inline-flex min-w-[4.5rem] max-w-full items-center">
        <select
          value={String(value)}
          aria-label={`${label} per page`}
          className={cn(
            "h-8 w-full appearance-none rounded-lg border border-zinc-200 bg-white pl-2.5 pr-8 text-[11px] font-medium text-zinc-700 outline-none transition hover:border-zinc-300 focus:border-zinc-500 focus:ring-2 focus:ring-zinc-200 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-200 dark:hover:border-zinc-700 dark:focus:border-zinc-600 dark:focus:ring-zinc-800 sm:h-8.5 sm:pl-3 sm:pr-9 sm:text-xs",
            selectClassName,
          )}
          onChange={(event) => onChange(Number(event.target.value))}
        >
          {normalizedOptions.map((option) => (
            <option key={String(option.value)} value={String(option.value)}>
              {option.label}
            </option>
          ))}
        </select>
        <ChevronDown className="pointer-events-none absolute right-2.5 h-3.5 w-3.5 text-zinc-400 dark:text-zinc-500" />
      </span>
    </label>
  );
};
