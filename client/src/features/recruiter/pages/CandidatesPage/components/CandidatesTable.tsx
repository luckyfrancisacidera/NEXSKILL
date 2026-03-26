import { Eye } from 'lucide-react';
import { Link } from 'react-router-dom';

import type { ApplicantScoreItemDto } from '@features/recruiter/types';
import { StatusBadge } from '@shared/components/StatusBadge';
import { getJobActionButtonClassName } from '@shared/utils/jobActionButtonStyles';

export interface CandidatesTableProps {
  candidates: ApplicantScoreItemDto[];
  isAllChecked: boolean;
  selectedSet: Set<string>;
  onToggleAllRows: () => void;
  onToggleSingleRow: (id: string) => void;
}

/**
 * Tabular candidate listing with page-scoped bulk selection.
 */
export const CandidatesTable = ({ candidates, isAllChecked, selectedSet, onToggleAllRows, onToggleSingleRow }: CandidatesTableProps) => (
  <div className="overflow-x-auto rounded-2xl border border-zinc-200 dark:border-zinc-800">
    <table className="min-w-full text-sm">
      <thead className="bg-zinc-100 text-zinc-700 dark:bg-zinc-900 dark:text-zinc-400">
        <tr>
          <th className="w-12 px-3 py-3 text-left">
            <input type="checkbox" aria-label="select all candidates" checked={isAllChecked} onChange={onToggleAllRows} className="h-4 w-4 rounded border-zinc-400 dark:border-zinc-600" />
          </th>
          {['Name', 'Email', 'Job', 'Status', 'Score', 'Applied', 'Actions'].map((column) => (
            <th key={column} className="px-3 py-3 text-left font-semibold">
              {column}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {candidates.map((candidate, index) => (
          <tr key={candidate.resume_submission_id} className={`border-t border-zinc-100 ${index % 2 ? 'bg-zinc-50/60 dark:bg-zinc-900/40' : 'bg-white dark:bg-zinc-950'} dark:border-zinc-800`}>
            <td className="px-3 py-3">
              <input type="checkbox" aria-label={`select ${candidate.applicant_name}`} checked={selectedSet.has(candidate.resume_submission_id)} onChange={() => onToggleSingleRow(candidate.resume_submission_id)} className="h-4 w-4 rounded border-zinc-400 dark:border-zinc-600" />
            </td>
            <td className="px-3 py-3 font-medium text-zinc-900 dark:text-zinc-100">{candidate.applicant_name}</td>
            <td className="px-3 py-3 text-zinc-700 dark:text-zinc-400">{candidate.applicant_email}</td>
            <td className="px-3 py-3 text-zinc-700 dark:text-zinc-400">{candidate.job_title}</td>
            <td className="px-3 py-3">
              <StatusBadge status={candidate.submission_status} />
            </td>
            <td className="px-3 py-3 font-semibold text-zinc-900 dark:text-zinc-100">{candidate.score}</td>
            <td className="px-3 py-3 text-zinc-700 dark:text-zinc-400">{new Date(candidate.created_at_utc).toLocaleDateString()}</td>
            <td className="px-3 py-3">
              <Link
                to={`/recruiter/candidates/${candidate.resume_submission_id}`}
                className={getJobActionButtonClassName({ iconOnly: true })}
                title="View candidate"
              >
                <Eye size={16} />
              </Link>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);
