import type { KeyboardEvent, MouseEvent } from 'react';
import { Eye } from 'lucide-react';
import { Link } from 'react-router-dom';

import type { ApplicantScoreItemDto } from '@features/recruiter/types';
import { actionButtonClassName } from '@shared/components/ActionButton';
import { Checkbox } from '@shared/components/Checkbox';
import { JobTitleCell } from '@shared/components/JobTitleCell';
import { DataTable } from '@shared/components/ui/data-table/DataTable';
import { IdentityCell } from '@shared/components/ui/data-table/IdentityCell';
import type { DataTableColumn } from '@shared/components/ui/data-table/table-types';
import { StatusBadge } from '@shared/components/StatusBadge';

type CandidateTableStage = 'all' | 'applied' | 'recommended' | 'shortlisted' | 'interview' | 'offer' | 'hire' | 'hired' | 'rejected';

export interface CandidatesTableProps {
  candidates: ApplicantScoreItemDto[];
  stage: string;
  isAllChecked: boolean;
  selectedSet: Set<string>;
  onToggleAllRows: () => void;
  onToggleSingleRow: (id: string) => void;
  loading?: boolean;
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

export const CandidatesTable = ({
  candidates,
  stage,
  isAllChecked,
  selectedSet,
  onToggleAllRows,
  onToggleSingleRow,
  loading = false,
}: CandidatesTableProps) => {
  const normalizedStage = normalizeStage(stage);
  const columns: Array<DataTableColumn<ApplicantScoreItemDto>> = [
    {
      id: 'select',
      header: (
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
      ),
      cell: (candidate) => {
        const candidateId = candidate.resume_submission_id;

        return (
          <Checkbox
            id={`candidate-${candidateId}`}
            aria-label={`Select ${candidate.applicant_name}`}
            checked={selectedSet.has(candidateId)}
            onChange={() => onToggleSingleRow(candidateId)}
            onClick={stopRowToggle}
            label={<span className="sr-only">{`Select ${candidate.applicant_name}`}</span>}
            className="gap-0 text-transparent"
            boxClassName="h-4 w-4 rounded border-zinc-400 dark:border-zinc-600"
          />
        );
      },
      widthClassName: 'w-12',
      headerClassName: 'pr-0',
      cellClassName: 'pr-0',
    },
    {
      id: 'candidate',
      header: 'Candidate',
      cell: (candidate) => (
        <IdentityCell
          name={candidate.applicant_name}
          email={candidate.applicant_email}
        />
      ),
      accessor: (candidate) => candidate.applicant_name,
      sortable: true,
      sortType: 'string',
      widthClassName: 'min-w-[260px]',
    },
    {
      id: 'job',
      header: 'Job',
      cell: (candidate) => (
        <JobTitleCell title={candidate.job_title} />
      ),
      accessor: (candidate) => candidate.job_title,
      sortable: true,
      sortType: 'string',
      widthClassName: 'min-w-[180px]',
    },
  ];

  if (normalizedStage === 'interview') {
    columns.push(
      {
        id: 'interview-status',
        header: 'Interview Status',
        cell: (candidate) => <StatusBadge status={candidate.latest_interview_status ?? 'Pending'} />,
        accessor: (candidate) => candidate.latest_interview_status ?? 'Pending',
        sortable: true,
        sortType: 'string',
      },
      {
        id: 'interview-date',
        header: 'Interview Date',
        cell: (candidate) => <span className="text-[12px] leading-5">{formatDate(candidate.latest_interview_scheduled_date_time_utc)}</span>,
        accessor: (candidate) =>
          candidate.latest_interview_scheduled_date_time_utc
            ? new Date(candidate.latest_interview_scheduled_date_time_utc)
            : null,
        sortable: true,
        sortType: 'date',
      },
    );
  } else if (normalizedStage === 'offer') {
    columns.push(
      {
        id: 'offer-status',
        header: 'Offer Status',
        cell: (candidate) => (
          <StatusBadge status={candidate.offer_status ?? candidate.offer?.status ?? 'Pending'} />
        ),
        accessor: (candidate) => candidate.offer_status ?? candidate.offer?.status ?? 'Pending',
        sortable: true,
        sortType: 'string',
      },
      {
        id: 'offered',
        header: 'Offered',
        cell: (candidate) => <span className="text-[12px] leading-5">{formatDate(candidate.offer_sent_at_utc ?? candidate.offer?.sent_at_utc)}</span>,
        accessor: (candidate) =>
          candidate.offer_sent_at_utc ?? candidate.offer?.sent_at_utc
            ? new Date(candidate.offer_sent_at_utc ?? candidate.offer?.sent_at_utc ?? '')
            : null,
        sortable: true,
        sortType: 'date',
      },
    );
  } else {
    columns.push(
      {
        id: 'status',
        header: 'Status',
        cell: (candidate) => <StatusBadge status={candidate.submission_status} />,
        accessor: (candidate) => candidate.submission_status,
        sortable: true,
        sortType: 'string',
      },
      {
        id: 'score',
        header: 'Score',
        cell: (candidate) => (
          <span className="text-[12px] font-semibold leading-5 text-zinc-900 dark:text-zinc-100">{candidate.score}</span>
        ),
        accessor: (candidate) => candidate.score,
        sortable: true,
        sortType: 'number',
      },
      {
        id: 'applied',
        header: 'Applied',
        cell: (candidate) => <span className="text-[12px] leading-5">{formatDate(candidate.created_at_utc)}</span>,
        accessor: (candidate) => new Date(candidate.created_at_utc),
        sortable: true,
        sortType: 'date',
      },
    );
  }

  columns.push({
    id: 'actions',
    header: 'Actions',
    align: 'right',
      cell: (candidate) => (
        <div className="flex items-center justify-end" onClick={stopRowToggle}>
          <Link
            to={`/recruiter/candidates/${candidate.resume_submission_id}`}
            className={actionButtonClassName({ iconOnly: true })}
          title="View candidate"
          aria-label={`View ${candidate.applicant_name}`}
          onClick={stopRowToggle}
        >
          <Eye size={16} />
          <span className="sr-only">{`View ${candidate.applicant_name}`}</span>
        </Link>
        </div>
      ),
    headerClassName: 'w-[96px]',
    cellClassName: 'w-[96px]',
  });

  return (
    <DataTable
      data={candidates}
      columns={columns}
      getRowKey={(candidate) => candidate.resume_submission_id}
      loading={loading}
      loadingRowCount={6}
      getRowConfig={(candidate) => {
        const candidateId = candidate.resume_submission_id;
        const isSelected = selectedSet.has(candidateId);

        return {
          className: isSelected
            ? 'bg-zinc-100/80 hover:[&>td]:bg-zinc-100 dark:bg-zinc-900 dark:hover:[&>td]:bg-zinc-900'
            : 'hover:[&>td]:bg-zinc-50 dark:hover:[&>td]:bg-zinc-900/60',
          props: {
            tabIndex: 0,
            'aria-selected': isSelected,
            className: 'cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-500 focus-visible:ring-inset',
            onClick: () => onToggleSingleRow(candidateId),
            onKeyDown: onRowKeyDown(candidateId, onToggleSingleRow),
          },
        };
      }}
    />
  );
};
