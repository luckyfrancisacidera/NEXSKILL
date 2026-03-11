import { CircleCheck } from "lucide-react";

import type { JobseekerApplicationStage } from "@features/jobseeker/types";

const timelineStages = ["Applied", "Shortlisted", "Interview", "Offer", "Hire"] as const;

const stageIndexByStatus: Record<(typeof timelineStages)[number], number> = {
  Applied: 0,
  Shortlisted: 1,
  Interview: 2,
  Offer: 3,
  Hire: 4,
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
}: {
  activeStage: JobseekerApplicationStage | string;
}) => {
  const resolvedStage = resolveTimelineStage(activeStage);
  const activeIndex = stageIndexByStatus[resolvedStage];

  return (
    <div className="overflow-x-auto pb-1">
      <div className="flex min-w-[640px] items-center gap-2">
        {timelineStages.map((stage, index) => {
          const isComplete = index <= activeIndex;
          const isCurrent = index === activeIndex;

          return (
            <div key={stage} className="flex min-w-0 flex-1 items-center gap-2">
              <div className="flex items-center gap-2">
                <span
                  className={[
                    "flex h-9 w-9 items-center justify-center rounded-full border text-xs font-semibold transition",
                    isComplete
                      ? "border-zinc-900 bg-zinc-900 text-white"
                      : "border-zinc-200 bg-white text-zinc-400",
                    isCurrent ? "ring-4 ring-zinc-200" : "",
                  ].join(" ")}
                >
                  {isComplete ? <CircleCheck className="h-4 w-4" /> : index + 1}
                </span>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-zinc-400">
                    Step {index + 1}
                  </p>
                  <p
                    className={
                      isComplete
                        ? "text-sm font-semibold text-zinc-900"
                        : "text-sm font-medium text-zinc-500"
                    }
                  >
                    {stage}
                  </p>
                </div>
              </div>
              {index < timelineStages.length - 1 ? (
                <div
                  className={
                    isComplete ? "h-px flex-1 bg-zinc-900" : "h-px flex-1 bg-zinc-200"
                  }
                />
              ) : null}
            </div>
          );
        })}
      </div>
    </div>
  );
};
