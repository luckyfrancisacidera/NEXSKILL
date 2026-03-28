import { Link } from 'react-router-dom';

import type { JobApplicantListItem } from '@features/recruiter/types';
import { Card } from '@shared/components/Card';
import { StatusBadge } from '@shared/components/StatusBadge';

export interface ApplicantsCardProps {
  applicants: JobApplicantListItem[];
}

/**
 * Lists candidates tied to the job posting.
 */
export const ApplicantsCard = ({ applicants }: ApplicantsCardProps) => (
  <Card>
    <h3 className="mb-2 font-semibold text-zinc-900 dark:text-zinc-100">Applicants ({applicants.length})</h3>
    {applicants.length ? (
      <ul className="space-y-2">
        {applicants.map((candidate) => (
          <li key={candidate.id} className="flex flex-col gap-2 rounded border border-zinc-200 bg-white p-3 text-sm dark:border-zinc-800 dark:bg-zinc-950 sm:flex-row sm:items-center sm:justify-between">
            <Link className="text-zinc-900 transition hover:text-zinc-700 dark:text-zinc-100 dark:hover:text-zinc-300" to={`/recruiter/candidates/${candidate.id}`}>{candidate.name}</Link>
            <StatusBadge status={candidate.stage} />
          </li>
        ))}
      </ul>
    ) : (
      <div className="rounded-xl border border-dashed border-zinc-300 bg-zinc-50 px-4 py-6 text-sm text-zinc-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-400">
        No applicants have been recorded for this job yet.
      </div>
    )}
  </Card>
);
