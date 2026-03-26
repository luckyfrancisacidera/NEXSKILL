import { useEffect, useState } from "react";
import { ArrowRight, Check, Loader2, MapPin, Bookmark } from "lucide-react";
import { Link } from "react-router-dom";
import type { Job } from "@shared/types";
import { Badge } from "@shared/components/Badge";
import { Button } from "@shared/components/Button";
import { Card } from "@shared/components/Card";
import { formatCurrencyAmount } from "@shared/data/currency";

interface JobCardProps {
  job: Job;
  isSaved?: boolean;
  onToggleSave?: (jobId: string, nextSavedState: boolean) => Promise<void> | void;
  applyLabel?: string;
}

export const JobCard = ({ job, isSaved = false, onToggleSave, applyLabel = 'Apply' }: JobCardProps) => {
  const [saved, setSaved] = useState(isSaved);
  const [isSaving, setIsSaving] = useState(false);

  const salaryLabel =
    job.salaryMin > 0 || job.salaryMax > 0
      ? `${formatCurrencyAmount(job.salaryMin, job.currency)} - ${formatCurrencyAmount(job.salaryMax, job.currency)}`
      : "Salary not specified";
  const locationLabel = job.location?.trim() || "Location not specified";
  const companyLabel = job.company?.trim() || "Company";
  const snippet = job.snippet?.trim() || "Role details will be available on the job page.";

  useEffect(() => {
    setSaved(isSaved);
  }, [isSaved]);

  const handleToggleSave = async () => {
    if (!onToggleSave || isSaving) return;
    const nextSavedState = !saved;
    setIsSaving(true);

    try {
      await onToggleSave(job.id, nextSavedState);
      setSaved(nextSavedState);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Card className="rounded-[22px] border border-zinc-200 bg-white p-3.5 shadow-sm dark:border-zinc-800 dark:bg-zinc-950 md:p-4">
      <div className="space-y-3">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h3
                className="max-w-full truncate text-base font-semibold text-zinc-900 dark:text-zinc-100 md:text-lg"
                title={job.title}
              >
                {job.title}
              </h3>
              <Badge>{job.type}</Badge>
            </div>
            <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-zinc-500 dark:text-zinc-400">
              <span className="truncate font-medium text-zinc-700 dark:text-zinc-300" title={companyLabel}>
                {companyLabel}
              </span>
              <span className="hidden text-zinc-300 dark:text-zinc-700 sm:inline">•</span>
              <span className="inline-flex items-center gap-1 truncate">
                <MapPin className="h-3.5 w-3.5" />
                {locationLabel}
              </span>
            </div>
          </div>
          {onToggleSave ? (
            <Button
              type="button"
              variant="secondary"
              disabled={isSaving}
              className={`shrink-0 px-3 py-1.5 text-xs ${
                saved
                  ? "border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 dark:border-emerald-900 dark:bg-emerald-950/30 dark:text-emerald-400 dark:hover:bg-emerald-950/50"
                  : ""
              }`}
              onClick={() => {
                void handleToggleSave();
              }}
            >
              <span className="inline-flex items-center gap-1.5">
                {isSaving ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : saved ? (
                  <Check className="h-3.5 w-3.5" />
                ) : (
                  <Bookmark className="h-3.5 w-3.5" />
                )}
                {saved ? "Saved" : "Save"}
              </span>
            </Button>
          ) : null}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Badge>{salaryLabel}</Badge>
          <Badge>{locationLabel}</Badge>
        </div>

        <p className="line-clamp-2 text-sm leading-6 text-zinc-600 dark:text-zinc-400">
          {snippet}
        </p>

        <div className="flex items-center justify-end gap-2">
          <Link to={`/jobs/${job.id}`} className="w-full sm:w-auto">
            <Button type="button" className="inline-flex w-full items-center justify-center gap-2 px-3.5 py-2 text-sm">
              {applyLabel}
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </div>
    </Card>
  );
};
