import { SkeletonBlock } from "@shared/components/skeletons/SkeletonBlock";

export const DashboardStatsSkeleton = () => (
  <div className="space-y-6">
    <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {Array.from({ length: 4 }, (_, index) => (
        <div
          key={`dashboard-stat-skeleton-${index}`}
          className="rounded-3xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-950"
        >
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <SkeletonBlock className="h-4 w-24" />
              <SkeletonBlock className="h-10 w-10 rounded-2xl" />
            </div>
            <SkeletonBlock className="h-8 w-16" />
            <SkeletonBlock className="h-3 w-36" />
          </div>
        </div>
      ))}
    </section>

    <section className="grid gap-6 xl:grid-cols-[minmax(0,1.8fr)_minmax(320px,1fr)]">
      <div className="rounded-3xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-950">
        <div className="mb-6 flex items-start justify-between gap-4">
          <div className="space-y-2">
            <SkeletonBlock className="h-5 w-44" />
            <SkeletonBlock className="h-3 w-64 max-w-full" />
          </div>
          <SkeletonBlock className="h-10 w-32 rounded-xl" />
        </div>
        <SkeletonBlock className="h-[280px] w-full rounded-3xl" />
      </div>

      <div className="rounded-3xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-950">
        <div className="mb-6 flex items-start justify-between gap-4">
          <div className="space-y-2">
            <SkeletonBlock className="h-5 w-40" />
            <SkeletonBlock className="h-3 w-48 max-w-full" />
          </div>
          <SkeletonBlock className="h-4 w-16" />
        </div>
        <div className="space-y-3">
          {Array.from({ length: 3 }, (_, index) => (
            <div
              key={`dashboard-interview-skeleton-${index}`}
              className="rounded-2xl border border-zinc-200 bg-zinc-50/70 p-4 dark:border-zinc-800 dark:bg-zinc-900/60"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-2">
                    <SkeletonBlock className="h-3 w-24" />
                    <SkeletonBlock className="h-5 w-32" />
                    <SkeletonBlock className="h-3 w-28" />
                  </div>
                  <SkeletonBlock className="h-5 w-18 rounded-full" />
                </div>
                <SkeletonBlock className="h-3 w-36" />
                <SkeletonBlock className="h-3 w-28" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  </div>
);
