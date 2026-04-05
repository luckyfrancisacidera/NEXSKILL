import { Copy, Eye, Pencil, Trash2 } from 'lucide-react';
import { Link } from 'react-router-dom';

import type { JobListItem } from '@features/recruiter/types';
import { ActionButton, actionButtonClassName } from '@shared/components/actions/ActionButton';
import { DepartmentCell } from '@shared/components/data-display/DepartmentCell';
import { EmploymentTypeCell } from '@shared/components/data-display/EmploymentTypeCell';
import { JobTitleCell } from '@shared/components/data-display/JobTitleCell';
import { DataTable } from '@shared/components/data-display/data-table/DataTable';
import type { DataTableColumn } from '@shared/components/data-display/data-table/table-types';
import { StatusBadge } from '@shared/components/data-display/StatusBadge';
import { getJobStatusAccent } from '@shared/utils/jobStatusAccent';
import { formatJobLabel } from '@shared/utils/jobLabels';

export interface JobPostsTableProps {
  jobs: JobListItem[];
  isDeleting: boolean;
  isDuplicating: boolean;
  onDelete: (job: JobListItem) => void;
  onDuplicate: (job: JobListItem) => void;
  loading?: boolean;
}

/**
 * Presentational table for the recruiter job listing.
 */
export const JobPostsTable = ({
  jobs,
  isDeleting,
  isDuplicating,
  onDelete,
  onDuplicate,
  loading = false,
}: JobPostsTableProps) => {
  const compactCellClassName = 'min-w-0 max-w-full overflow-hidden whitespace-nowrap';
  const columns: Array<DataTableColumn<JobListItem>> = [
    {
      id: 'title',
      header: 'JOB TITLE',
      cell: (job) => <JobTitleCell title={job.title} subtitle={job.department ?? null} className="min-w-0 max-w-full" />,
      accessor: (job) => job.title,
      sortable: true,
      sortType: 'string',
      cellClassName: 'min-w-0',
    },
    {
      id: 'department',
      header: 'DEPARTMENT',
      cell: (job) => <DepartmentCell department={job.department} className="min-w-0 max-w-full" />,
      accessor: (job) => job.department ?? '',
      sortable: true,
      sortType: 'string',
      cellClassName: compactCellClassName,
    },
    {
      id: 'location',
      header: 'LOCATION',
      cell: (job) => <span className="block min-w-0 max-w-full truncate text-[12px] leading-5">{job.location}</span>,
      accessor: (job) => job.location,
      sortable: true,
      sortType: 'string',
      cellClassName: compactCellClassName,
    },
    {
      id: 'type',
      header: 'TYPE',
      cell: (job) => (
        <EmploymentTypeCell
          type={formatJobLabel(job.employment_type, 'Employment type not specified')}
          className="min-w-0 max-w-full"
        />
      ),
      accessor: (job) => job.employment_type,
      sortable: true,
      sortType: 'string',
      cellClassName: compactCellClassName,
    },
    {
      id: 'status',
      header: 'STATUS',
      cell: (job) => {
        const statusAccent = getJobStatusAccent(job.status);

        return (
          <StatusBadge
            label={statusAccent.label}
            appearanceClassName={statusAccent.className}
          />
        );
      },
      accessor: (job) => job.status,
      sortable: true,
      sortType: 'string',
      cellClassName: 'min-w-0 max-w-full whitespace-nowrap',
    },
    {
      id: 'actions',
      header: 'ACTIONS',
      align: 'right',
      cell: (job) => (
        <div className="flex min-w-0 max-w-full items-center justify-end gap-1.5 whitespace-nowrap sm:gap-2">
          <Link className={actionButtonClassName({ iconOnly: true })} to={`/recruiter/job-posts/${job.id}`} aria-label={`View ${job.title}`} title={`View ${job.title}`}>
            <Eye size={16} />
            <span className="sr-only">{`View ${job.title}`}</span>
          </Link>
          <Link className={actionButtonClassName({ iconOnly: true })} to={`/recruiter/job-posts/${job.id}/edit`} aria-label={`Edit ${job.title}`} title={`Edit ${job.title}`}>
            <Pencil size={16} />
            <span className="sr-only">{`Edit ${job.title}`}</span>
          </Link>
          <ActionButton
            onClick={() => onDuplicate(job)}
            disabled={isDeleting || isDuplicating}
            title="Create a copy of this job with all details pre-filled"
            label={`Duplicate ${job.title}`}
            icon={<Copy size={16} />}
            iconOnly
          />
          <ActionButton
            onClick={() => onDelete(job)}
            disabled={isDeleting || isDuplicating}
            label={`Delete ${job.title}`}
            icon={<Trash2 size={16} />}
            iconOnly
            destructive
          />
        </div>
      ),
      headerClassName: 'whitespace-nowrap',
      cellClassName: 'min-w-0 whitespace-nowrap',
    },
  ];

  return (
    <DataTable
      data={jobs}
      columns={columns}
      getRowKey={(job) => job.id}
      loading={loading}
      loadingRowCount={6}
    />
  );
};

