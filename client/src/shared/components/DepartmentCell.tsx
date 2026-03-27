import { cn } from "@shared/utils/cn";
import { getDepartmentIcon } from "@shared/utils/departmentIcons";

interface DepartmentCellProps {
  department?: string | null;
  fallbackLabel?: string;
  className?: string;
  labelClassName?: string;
}

export const DepartmentCell = ({
  department,
  fallbackLabel = "-",
  className,
  labelClassName,
}: DepartmentCellProps) => {
  const label = department?.trim() || fallbackLabel;
  const Icon = getDepartmentIcon(department);

  return (
    <div className={cn("flex min-w-0 items-center gap-3", className)}>
      <span className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-zinc-200 bg-zinc-50 text-zinc-600 dark:border-zinc-700 dark:bg-zinc-900/80 dark:text-zinc-300">
        <Icon className="h-4 w-4" />
      </span>
      <span className={cn("truncate text-[12px] leading-5 text-zinc-700 dark:text-zinc-300", labelClassName)}>
        {label}
      </span>
    </div>
  );
};
