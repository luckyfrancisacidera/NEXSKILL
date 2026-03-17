import { BriefcaseBusiness } from "lucide-react";

type ApplicationsEmptyStateProps = {
  hasFilters: boolean;
};

export const ApplicationsEmptyState = ({
  hasFilters,
}: ApplicationsEmptyStateProps) => (
  <div className="flex min-h-72 flex-col items-center justify-center gap-3 px-6 py-12 text-center">
    <div className="flex h-12 w-12 items-center justify-center bg-zinc-100 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400">
      <BriefcaseBusiness className="h-5 w-5" />
    </div>
    <div className="space-y-1">
      <h3 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">
        {hasFilters ? "No matching applications" : "No applications yet"}
      </h3>
      <p className="max-w-md text-sm text-zinc-500 dark:text-zinc-400">
        {hasFilters
          ? "Try adjusting your search or status filter to find the application you need."
          : "Applications you submit will appear here so you can track progress, dates, and next steps."}
      </p>
    </div>
  </div>
);
