import { SkeletonBlock } from "@shared/components/skeletons/SkeletonBlock";

export const InterviewCalendarSkeleton = () => (
  <div className="overflow-hidden rounded-3xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950">
    <div className="grid gap-0 lg:grid-cols-[300px_minmax(0,1fr)]">
      <div className="hidden border-r border-zinc-200 px-6 py-6 dark:border-zinc-800 lg:block">
        <SkeletonBlock className="h-12 w-full rounded-xl" />
        <div className="mt-6 space-y-4">
          <SkeletonBlock className="h-5 w-32" />
          <div className="grid grid-cols-7 gap-3">
            {Array.from({ length: 35 }, (_, index) => (
              <SkeletonBlock key={`calendar-mini-${index}`} className="h-9 w-9 rounded-xl" />
            ))}
          </div>
        </div>
        <div className="mt-8 space-y-3">
          <SkeletonBlock className="h-5 w-28" />
          {Array.from({ length: 5 }, (_, index) => (
            <SkeletonBlock key={`calendar-filter-${index}`} className="h-11 w-full rounded-xl" />
          ))}
        </div>
      </div>

      <div className="min-w-0">
        <div className="flex flex-col gap-5 border-b border-zinc-200 px-4 py-5 dark:border-zinc-800 sm:px-6 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-3">
            <SkeletonBlock className="h-10 w-10 rounded-xl lg:hidden" />
            <div className="flex items-center gap-2">
              <SkeletonBlock className="h-10 w-10 rounded-lg" />
              <SkeletonBlock className="h-10 w-10 rounded-lg" />
            </div>
            <SkeletonBlock className="h-8 w-40" />
          </div>
          <div className="flex min-w-max gap-2">
            {Array.from({ length: 4 }, (_, index) => (
              <SkeletonBlock key={`calendar-view-${index}`} className="h-10 w-20 rounded-lg" />
            ))}
          </div>
        </div>
        <div className="grid gap-4 p-6 md:grid-cols-7">
          {Array.from({ length: 14 }, (_, index) => (
            <SkeletonBlock key={`calendar-grid-${index}`} className="h-32 w-full rounded-2xl" />
          ))}
        </div>
      </div>
    </div>
  </div>
);
