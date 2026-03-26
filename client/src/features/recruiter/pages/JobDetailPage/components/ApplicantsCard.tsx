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
    <h3 className="mb-2 font-semibold">Applicants ({applicants.length})</h3>
    {applicants.length ? (
      <ul className="space-y-2">
        {applicants.map((candidate) => (
          <li key={candidate.id} className="flex items-center justify-between rounded border border-zinc-200 p-2 text-sm">
            <Link to={`/recruiter/candidates/${candidate.id}`}>{candidate.name}</Link>
            <StatusBadge status={candidate.stage} />
          </li>
        ))}
      </ul>
    ) : (
      <div className="rounded-xl border border-dashed border-zinc-300 bg-zinc-50 px-4 py-6 text-sm text-zinc-500">
        No applicants have been recorded for this job yet.
      </div>
    )}
  </Card>
);
