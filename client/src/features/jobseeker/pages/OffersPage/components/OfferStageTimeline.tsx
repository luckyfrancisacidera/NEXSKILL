import { CircleCheck, CircleDot } from "lucide-react";

import type { JobseekerApplicationStage } from "@features/jobseeker/types";

const timelineStages = ["Applied", "Under Review", "Shortlisted", "Interview", "Offer", "Hired"] as const;

const stageIndexByStatus: Record<(typeof timelineStages)[number], number> = {
  Applied: 0,
  "Under Review": 1,
  Shortlisted: 2,
  Interview: 3,
  Offer: 4,
  Hired: 5,
};

export const resolveTimelineStage = (
  stage?: string,
): (typeof timelineStages)[number] => {
  if (stage && stage in stageIndexByStatus) {
    return stage as (typeof timelineStages)[number];
  }

  return "Applied";
};

export const OfferStageTimeline = ({
  activeStage,
  stageDates,
}: {
  activeStage: JobseekerApplicationStage | string;
  stageDates?: Partial<Record<(typeof timelineStages)[number], string | null | undefined>>;
}) => {
  const resolvedStage = resolveTimelineStage(activeStage);
  const activeIndex = stageIndexByStatus[resolvedStage];

  return (
    <div className="overflow-x-auto pb-1 [scrollbar-width:thin]">
      <div className="flex min-w-max items-stretch gap-2.5 snap-x snap-mandatory scroll-smooth">
        {timelineStages.map((stage, index) => {
          const isComplete = index <= activeIndex;
          const isCurrent = index === activeIndex;
          const dateLabel = stageDates?.[stage]
            ? new Date(stageDates[stage] as string).toLocaleDateString(undefined, {
                month: "short",
                day: "numeric",
                year: "numeric",
              })
            : isCurrent
              ? "Current"
              : index < activeIndex
                ? "Completed"
                : "Pending";

          return (
            <div key={stage} className="flex shrink-0 items-center gap-2">
              <div
                className={[
                  "min-w-[140px] snap-start rounded-2xl border px-3 py-2.5 transition",
                  isCurrent
                    ? "border-zinc-900 bg-zinc-900 text-white shadow-sm dark:border-zinc-100 dark:bg-zinc-100 dark:text-zinc-950"
                    : isComplete
                      ? "border-zinc-300 bg-white text-zinc-900 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100"
                      : "border-zinc-200 bg-white text-zinc-500 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-400",
                ].join(" ")}
              >
                <div className="flex items-center gap-2">
                  <span
                    className={[
                      "flex h-7 w-7 items-center justify-center rounded-full border text-[11px] font-semibold transition",
                      isCurrent
                        ? "border-white/30 bg-white/10 text-white dark:border-zinc-700 dark:bg-zinc-900/50 dark:text-zinc-950"
                        : isComplete
                          ? "border-zinc-900 bg-zinc-900 text-white dark:border-zinc-100 dark:bg-zinc-100 dark:text-zinc-950"
                          : "border-zinc-200 bg-zinc-100 text-zinc-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-400",
                    ].join(" ")}
                  >
                    {isCurrent ? (
                      <CircleDot className="h-3.5 w-3.5" />
                    ) : isComplete ? (
                      <CircleCheck className="h-3.5 w-3.5" />
                    ) : (
                      index + 1
                    )}
                  </span>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold">{stage}</p>
                    <p
                      className={[
                        "mt-0.5 text-[11px]",
                        isCurrent
                          ? "text-zinc-200 dark:text-zinc-700"
                          : "text-zinc-500 dark:text-zinc-400",
                      ].join(" ")}
                    >
                      {dateLabel}
                    </p>
                  </div>
                </div>
              </div>
              {index < timelineStages.length - 1 ? (
                <div
                  className={[
                    "h-px w-6 shrink-0 rounded-full",
                    isComplete
                      ? "bg-zinc-400 dark:bg-zinc-600"
                      : "bg-zinc-200 dark:bg-zinc-800",
                  ].join(" ")}
                />
              ) : null}
            </div>
          );
        })}
      </div>
    </div>
  );
};
