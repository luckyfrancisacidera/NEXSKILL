import { SkeletonBlock } from "@shared/components/feedback/skeletons/SkeletonBlock";

export const JobCardSkeleton = () => (
  <div className="rounded-3xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-950 sm:p-5">
    <div className="flex h-full flex-col gap-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1 space-y-3">
          <SkeletonBlock className="h-6 w-40 max-w-full" />
          <div className="flex flex-wrap gap-2">
            <SkeletonBlock className="h-5 w-20 rounded-full" />
            <SkeletonBlock className="h-5 w-28 rounded-full" />
          </div>
        </div>
        <SkeletonBlock className="h-9 w-9 rounded-xl" />
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <SkeletonBlock className="h-6 w-38 rounded-full" />
        <SkeletonBlock className="h-6 w-24 rounded-full" />
      </div>

      <div className="space-y-2">
        <SkeletonBlock className="h-4 w-full" />
        <SkeletonBlock className="h-4 w-11/12" />
        <SkeletonBlock className="h-4 w-4/5" />
      </div>

      <div className="mt-auto flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <SkeletonBlock className="h-3 w-20" />
        <SkeletonBlock className="h-10 w-full rounded-xl sm:w-28" />
      </div>
    </div>
  </div>
);

