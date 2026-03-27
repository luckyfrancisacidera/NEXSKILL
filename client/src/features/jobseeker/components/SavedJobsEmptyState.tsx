import { Bookmark, Search } from "lucide-react";
import { Link } from "react-router-dom";

import { cn } from "@shared/utils/cn";

type SavedJobsEmptyStateProps = {
  compact?: boolean;
  title?: string;
  description?: string;
  ctaLabel?: string;
  ctaTo?: string;
  className?: string;
};

export const SavedJobsEmptyState = ({
  compact = false,
  title = "No saved jobs yet",
  description = "Save interesting job posts so you can quickly return to them later.",
  ctaLabel = "Browse Jobs",
  ctaTo = "/jobs",
  className,
}: SavedJobsEmptyStateProps) => (
  <div
    className={cn(
      "flex w-full items-center justify-center rounded-[24px] border border-dashed border-zinc-300 bg-zinc-50/70 px-5 text-center dark:border-zinc-700 dark:bg-zinc-900/40",
      compact ? "py-7" : "py-10",
      className,
    )}
  >
    <div className={cn("mx-auto flex flex-col items-center", compact ? "max-w-xs gap-3" : "max-w-md gap-4")}>
      <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-zinc-200 bg-white text-zinc-500 shadow-sm dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-300">
        <Bookmark className={cn(compact ? "h-5 w-5" : "h-6 w-6")} />
      </div>
      <div className="space-y-1.5">
        <h3 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">{title}</h3>
        <p className={cn("text-zinc-500 dark:text-zinc-400", compact ? "text-sm leading-5" : "text-sm leading-6")}>
          {description}
        </p>
      </div>
      <Link
        to={ctaTo}
        className="inline-flex items-center gap-2 rounded-xl border border-zinc-300 bg-white px-4 py-2 text-sm font-medium text-zinc-800 transition hover:bg-zinc-100 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100 dark:hover:bg-zinc-900"
      >
        <Search className="h-4 w-4" />
        {ctaLabel}
      </Link>
    </div>
  </div>
);
