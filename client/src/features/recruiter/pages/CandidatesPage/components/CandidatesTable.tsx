import { Eye } from 'lucide-react';
import { Link } from 'react-router-dom';

import type { ApplicantScoreItemDto } from '@features/recruiter/types';

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
  <div className="overflow-x-auto rounded-2xl border border-zinc-200">
    <table className="min-w-full text-sm">
      <thead className="bg-zinc-100 text-zinc-700">
        <tr>
          <th className="w-12 px-3 py-3 text-left">
            <input type="checkbox" aria-label="select all candidates" checked={isAllChecked} onChange={onToggleAllRows} className="h-4 w-4 rounded border-zinc-400" />
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
          <tr key={candidate.resume_submission_id} className={`border-t border-zinc-100 ${index % 2 ? 'bg-zinc-50/60' : 'bg-white'}`}>
            <td className="px-3 py-3">
              <input type="checkbox" aria-label={`select ${candidate.applicant_name}`} checked={selectedSet.has(candidate.resume_submission_id)} onChange={() => onToggleSingleRow(candidate.resume_submission_id)} className="h-4 w-4 rounded border-zinc-400" />
            </td>
            <td className="px-3 py-3 font-medium text-zinc-900">{candidate.applicant_name}</td>
            <td className="px-3 py-3 text-zinc-700">{candidate.applicant_email}</td>
            <td className="px-3 py-3 text-zinc-700">{candidate.job_title}</td>
            <td className="px-3 py-3">
              <span className="rounded-full bg-zinc-200 px-2.5 py-1 text-xs font-medium text-zinc-700">
                {candidate.submission_status}
              </span>
            </td>
            <td className="px-3 py-3 font-semibold text-zinc-900">{candidate.score}</td>
            <td className="px-3 py-3 text-zinc-700">{new Date(candidate.created_at_utc).toLocaleDateString()}</td>
            <td className="px-3 py-3">
              <Link
                to={`/recruiter/candidates/${candidate.resume_submission_id}`}
                className="inline-flex items-center gap-2 rounded-lg border border-zinc-300 px-3 py-1.5 text-zinc-700 transition hover:bg-zinc-100"
                title="View candidate"
              >
                <Eye size={16} />
                <span>View Candidate</span>
              </Link>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);
