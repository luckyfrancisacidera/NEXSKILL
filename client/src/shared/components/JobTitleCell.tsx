import { cn } from "@shared/utils/cn";
import { getJobIcon } from "@shared/utils/jobIcons";

interface JobTitleCellProps {
  title: string;
  subtitle?: string | null;
  className?: string;
  titleClassName?: string;
  subtitleClassName?: string;
}

export const JobTitleCell = ({
  title,
  subtitle,
  className,
  titleClassName,
  subtitleClassName,
}: JobTitleCellProps) => {
  const Icon = getJobIcon(title);

  return (
    <div className={cn("flex min-w-0 items-center gap-3", className)}>
      <span className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-zinc-200 bg-zinc-100 text-zinc-600 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-300">
        <Icon className="h-4 w-4" />
      </span>
      <div className="min-w-0">
        <p className={cn("truncate text-[12px] font-medium leading-5 text-zinc-800 dark:text-zinc-100", titleClassName)}>
          {title}
        </p>
        {subtitle ? (
          <p className={cn("truncate text-[12px] leading-5 text-zinc-500 dark:text-zinc-400", subtitleClassName)}>
            {subtitle}
          </p>
        ) : null}
      </div>
    </div>
  );
};
