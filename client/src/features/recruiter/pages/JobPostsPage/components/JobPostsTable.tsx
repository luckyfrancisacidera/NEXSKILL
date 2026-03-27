import { Copy, Eye, Pencil, Trash2 } from 'lucide-react';
import { Link } from 'react-router-dom';

import type { JobListItem } from '@features/recruiter/types';
import { ActionButton, actionButtonClassName } from '@shared/components/ActionButton';
import { DepartmentCell } from '@shared/components/DepartmentCell';
import { EmploymentTypeCell } from '@shared/components/EmploymentTypeCell';
import { JobTitleCell } from '@shared/components/JobTitleCell';
import { DataTable } from '@shared/components/ui/data-table/DataTable';
import type { DataTableColumn } from '@shared/components/ui/data-table/table-types';
import { StatusBadge } from '@shared/components/StatusBadge';
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
  const columns: Array<DataTableColumn<JobListItem>> = [
    {
      id: 'title',
      header: 'JOB TITLE',
      cell: (job) => <JobTitleCell title={job.title} subtitle={job.department ?? null} />,
      accessor: (job) => job.title,
      sortable: true,
      sortType: 'string',
      widthClassName: 'min-w-[240px]',
    },
    {
      id: 'department',
      header: 'DEPARTMENT',
      cell: (job) => <DepartmentCell department={job.department} />,
      accessor: (job) => job.department ?? '',
      sortable: true,
      sortType: 'string',
    },
    {
      id: 'location',
      header: 'LOCATION',
      cell: (job) => <span className="text-[12px] leading-5">{job.location}</span>,
      accessor: (job) => job.location,
      sortable: true,
      sortType: 'string',
    },
    {
      id: 'type',
      header: 'TYPE',
      cell: (job) => (
        <EmploymentTypeCell
          type={formatJobLabel(job.employment_type, 'Employment type not specified')}
        />
      ),
      accessor: (job) => job.employment_type,
      sortable: true,
      sortType: 'string',
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
    },
    {
      id: 'actions',
      header: 'ACTIONS',
      align: 'right',
      cell: (job) => (
        <div className="flex items-center justify-end gap-2">
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
      headerClassName: 'w-[236px]',
      cellClassName: 'w-[236px]',
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
