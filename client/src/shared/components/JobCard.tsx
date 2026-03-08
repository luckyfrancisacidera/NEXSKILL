import { useEffect, useState } from "react";
import { Check, Loader2, MapPin, Bookmark } from "lucide-react";
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
    <Card className="space-y-4 p-4">
      <div className="flex items-start justify-between gap-2">
        <div>
          <h3 className="text-lg font-semibold text-zinc-900">{job.title}</h3>
          <p className="text-sm text-zinc-500">{job.company}</p>
        </div>
        <span className="rounded-md bg-zinc-100 px-2 py-1 text-xs text-zinc-600">{job.type}</span>
      </div>
      <p className="text-sm font-medium text-zinc-800">{formatCurrencyAmount(job.salaryMin, job.currency)} - {formatCurrencyAmount(job.salaryMax, job.currency)} / year</p>
      <p className="flex items-center gap-1 text-sm text-zinc-500"><MapPin className="h-4 w-4" /> {job.location}</p>
      <p className="text-sm text-zinc-600 truncate">{job.snippet}</p>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <Badge>{job.type}</Badge>
        <div className="flex items-center gap-2">
          {onToggleSave ? (
            <Button
              type="button"
              variant="secondary"
              disabled={isSaving}
              className={saved ? "border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100" : ""}
              onClick={() => { void handleToggleSave(); }}
            >
              {isSaving ? <Loader2 className="mr-1 h-4 w-4 animate-spin" /> : saved ? <Check className="mr-1 h-4 w-4" /> : <Bookmark className="mr-1 h-4 w-4" />}
              {saved ? "Saved" : "Save"}
            </Button>
          ) : null}
          <Link to={`/jobs/${job.id}`}>
            <Button type="button">{applyLabel}</Button>
          </Link>
        </div>
      </div>
    </Card>
  );
};
