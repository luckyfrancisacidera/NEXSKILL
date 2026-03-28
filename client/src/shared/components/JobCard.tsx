import { useEffect, useState } from "react";
import {
  ArrowRight,
  Bookmark,
  BookmarkCheck,
  BriefcaseBusiness,
  Loader2,
  MapPin,
  Wallet,
} from "lucide-react";
import { Link } from "react-router-dom";

import { ActionButton } from "@shared/components/ActionButton";
import { Badge } from "@shared/components/Badge";
import { Button } from "@shared/components/Button";
import { Card } from "@shared/components/Card";
import { formatCurrencyAmount } from "@shared/data/currency";
import type { Job } from "@shared/types";

interface JobCardProps {
  job: Job;
  isSaved?: boolean;
  onToggleSave?: (jobId: string, nextSavedState: boolean) => Promise<void> | void;
  applyLabel?: string;
}

export const JobCard = ({ job, isSaved = false, onToggleSave, applyLabel = "Apply" }: JobCardProps) => {
  const [saved, setSaved] = useState(isSaved);
  const [isSaving, setIsSaving] = useState(false);

  const salaryLabel =
    job.salaryMin > 0 || job.salaryMax > 0
      ? `${formatCurrencyAmount(job.salaryMin, job.currency)} - ${formatCurrencyAmount(job.salaryMax, job.currency)} / yr`
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
    setSaved(nextSavedState);
    setIsSaving(true);

    try {
      await onToggleSave(job.id, nextSavedState);
    } catch {
      setSaved(!nextSavedState);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Card className="h-full bg-white p-4 transition-transform duration-200 ease-out hover:-translate-y-0.5 hover:scale-[1.015] dark:border-zinc-800 dark:bg-zinc-950 sm:p-5">
      <div className="flex h-full flex-col gap-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-start gap-2">
              <h3
                className="max-w-full truncate text-base font-semibold text-zinc-900 dark:text-zinc-100 sm:text-lg"
                title={job.title}
              >
                {job.title}
              </h3>
              <Badge>{job.type}</Badge>
            </div>
            <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1.5 text-sm text-zinc-500 dark:text-zinc-400">
              <span className="truncate font-medium text-zinc-700 dark:text-zinc-300" title={companyLabel}>
                {companyLabel}
              </span>
              <span className="hidden text-zinc-300 dark:text-zinc-700 sm:inline">&bull;</span>
              <span className="inline-flex items-center gap-1 truncate">
                <MapPin className="h-3.5 w-3.5" />
                {locationLabel}
              </span>
            </div>
          </div>
          {onToggleSave ? (
            <ActionButton
              icon={
                isSaving ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : saved ? (
                  <BookmarkCheck className="h-4 w-4" />
                ) : (
                  <Bookmark className="h-4 w-4" />
                )
              }
              label={isSaving ? "Updating saved job" : saved ? "Saved job" : "Save job"}
              iconOnly
              disabled={isSaving}
              className="shrink-0"
              onClick={() => {
                void handleToggleSave();
              }}
            />
          ) : null}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Badge>
            <span className="inline-flex items-center gap-1.5">
              <Wallet className="h-3.5 w-3.5" />
              {salaryLabel}
            </span>
          </Badge>
          <Badge>
            <span className="inline-flex items-center gap-1.5">
              <BriefcaseBusiness className="h-3.5 w-3.5" />
              {job.type}
            </span>
          </Badge>
        </div>

        <p className="line-clamp-3 text-sm leading-6 text-zinc-600 dark:text-zinc-400">
          {snippet}
        </p>

        <div className="mt-auto flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-[11px] font-medium uppercase tracking-[0.16em] text-zinc-400 dark:text-zinc-500">
            Saved role
          </p>
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
