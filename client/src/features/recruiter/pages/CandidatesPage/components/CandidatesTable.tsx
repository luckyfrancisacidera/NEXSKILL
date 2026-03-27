import type { KeyboardEvent, MouseEvent } from 'react';
import { Eye } from 'lucide-react';
import { Link } from 'react-router-dom';

import type { ApplicantScoreItemDto } from '@features/recruiter/types';
import { actionButtonClassName } from '@shared/components/ActionButton';
import { Checkbox } from '@shared/components/Checkbox';
import { StatusBadge } from '@shared/components/StatusBadge';

const TABLE_HEADERS = {
  default: ['Name', 'Email', 'Job', 'Status', 'Score', 'Applied', 'Actions'],
  interview: ['Name', 'Email', 'Job', 'Interview Status', 'Interview Date', 'Actions'],
  offer: ['Name', 'Email', 'Job', 'Offer Status', 'Offered', 'Actions'],
} as const;

type CandidateTableStage = 'all' | 'applied' | 'recommended' | 'shortlisted' | 'interview' | 'offer' | 'hire' | 'hired' | 'rejected';

export interface CandidatesTableProps {
  candidates: ApplicantScoreItemDto[];
  stage: string;
  isAllChecked: boolean;
  selectedSet: Set<string>;
  onToggleAllRows: () => void;
  onToggleSingleRow: (id: string) => void;
}

/**
 * Tabular candidate listing with page-scoped bulk selection.
 */
const stopRowToggle = (event: MouseEvent<HTMLElement>) => {
  event.stopPropagation();
};

const onRowKeyDown =
  (candidateId: string, onToggleSingleRow: (id: string) => void) =>
  (event: KeyboardEvent<HTMLTableRowElement>) => {
    if (event.key !== 'Enter' && event.key !== ' ') {
      return;
    }

    event.preventDefault();
    onToggleSingleRow(candidateId);
  };

const normalizeStage = (stage: string): CandidateTableStage => {
  const normalized = stage.trim().toLowerCase();

  switch (normalized) {
    case 'applied':
    case 'recommended':
    case 'shortlisted':
    case 'interview':
    case 'offer':
    case 'hire':
    case 'hired':
    case 'rejected':
      return normalized;
    default:
      return 'all';
  }
};

const formatDate = (value?: string | null) => (value ? new Date(value).toLocaleDateString() : 'Not set');

const getHeadersForStage = (stage: CandidateTableStage) => {
  if (stage === 'interview') {
    return TABLE_HEADERS.interview;
  }

  if (stage === 'offer') {
    return TABLE_HEADERS.offer;
  }

  return TABLE_HEADERS.default;
};

export const CandidatesTable = ({
  candidates,
  stage,
  isAllChecked,
  selectedSet,
  onToggleAllRows,
  onToggleSingleRow,
}: CandidatesTableProps) => {
  const normalizedStage = normalizeStage(stage);
  const headers = getHeadersForStage(normalizedStage);

  return (
    <div className="overflow-x-auto rounded-2xl border border-zinc-200 dark:border-zinc-800">
      <table className="min-w-full text-sm">
        <thead className="bg-zinc-100 text-zinc-700 dark:bg-zinc-900 dark:text-zinc-400">
          <tr>
            <th className="w-12 px-3 py-3 text-left">
              <Checkbox
                id="select-all-candidates"
                aria-label="Select all candidates"
                checked={isAllChecked}
                onChange={onToggleAllRows}
                onClick={stopRowToggle}
                label={<span className="sr-only">Select all candidates</span>}
                className="gap-0 text-transparent"
                boxClassName="h-4 w-4 rounded border-zinc-400 dark:border-zinc-600"
              />
            </th>
            {headers.map((header) => (
              <th key={header} className="px-3 py-3 text-left font-semibold">
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {candidates.map((candidate, index) => {
            const candidateId = candidate.resume_submission_id;
            const isSelected = selectedSet.has(candidateId);

            return (
              <tr
                key={candidateId}
                tabIndex={0}
                aria-selected={isSelected}
                className={`cursor-pointer border-t border-zinc-100 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-400 focus-visible:ring-inset ${index % 2 ? 'bg-zinc-50/60 dark:bg-zinc-900/40' : 'bg-white dark:bg-zinc-950'} ${isSelected ? 'bg-violet-50 dark:bg-violet-950/20' : ''} dark:border-zinc-800`}
                onClick={() => onToggleSingleRow(candidateId)}
                onKeyDown={onRowKeyDown(candidateId, onToggleSingleRow)}
              >
                <td className="px-3 py-3">
                  <Checkbox
                    id={`candidate-${candidateId}`}
                    aria-label={`Select ${candidate.applicant_name}`}
                    checked={isSelected}
                    onChange={() => onToggleSingleRow(candidateId)}
                    onClick={stopRowToggle}
                    label={<span className="sr-only">{`Select ${candidate.applicant_name}`}</span>}
                    className="gap-0 text-transparent"
                    boxClassName="h-4 w-4 rounded border-zinc-400 dark:border-zinc-600"
                  />
                </td>
                <td className="px-3 py-3 font-medium text-zinc-900 dark:text-zinc-100">{candidate.applicant_name}</td>
                <td className="px-3 py-3 text-zinc-700 dark:text-zinc-400">{candidate.applicant_email}</td>
                <td className="px-3 py-3 text-zinc-700 dark:text-zinc-400">{candidate.job_title}</td>
                {normalizedStage === 'interview' ? (
                  <>
                    <td className="px-3 py-3">
                      <StatusBadge status={candidate.latest_interview_status ?? 'Pending'} />
                    </td>
                    <td className="px-3 py-3 text-zinc-700 dark:text-zinc-400">
                      {formatDate(candidate.latest_interview_scheduled_date_time_utc)}
                    </td>
                  </>
                ) : normalizedStage === 'offer' ? (
                  <>
                    <td className="px-3 py-3">
                      <StatusBadge status={candidate.offer_status ?? candidate.offer?.status ?? 'Pending'} />
                    </td>
                    <td className="px-3 py-3 text-zinc-700 dark:text-zinc-400">
                      {formatDate(candidate.offer_sent_at_utc ?? candidate.offer?.sent_at_utc)}
                    </td>
                  </>
                ) : (
                  <>
                    <td className="px-3 py-3">
                      <StatusBadge status={candidate.submission_status} />
                    </td>
                    <td className="px-3 py-3 font-semibold text-zinc-900 dark:text-zinc-100">{candidate.score}</td>
                    <td className="px-3 py-3 text-zinc-700 dark:text-zinc-400">
                      {formatDate(candidate.created_at_utc)}
                    </td>
                  </>
                )}
                <td className="px-3 py-3" onClick={stopRowToggle}>
                  <Link
                    to={`/recruiter/candidates/${candidateId}`}
                    className={actionButtonClassName({ iconOnly: true })}
                    title="View candidate"
                    aria-label={`View ${candidate.applicant_name}`}
                    onClick={stopRowToggle}
                  >
                    <Eye size={16} />
                    <span className="sr-only">{`View ${candidate.applicant_name}`}</span>
                  </Link>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};
