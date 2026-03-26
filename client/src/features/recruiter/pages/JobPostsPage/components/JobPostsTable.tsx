import { Copy, Eye, Pencil, Trash2 } from 'lucide-react';
import { Link } from 'react-router-dom';

import type { JobListItem } from '@features/recruiter/types';
import { ActionButton, actionButtonClassName } from '@shared/components/ActionButton';
import { getJobStatusAccent } from '@shared/utils/jobStatusAccent';
import { formatJobLabel } from '@shared/utils/jobLabels';

export interface JobPostsTableProps {
  jobs: JobListItem[];
  isDeleting: boolean;
  isDuplicating: boolean;
  onDelete: (job: JobListItem) => void;
  onDuplicate: (job: JobListItem) => void;
}

/**
 * Presentational table for the recruiter job listing.
 */
export const JobPostsTable = ({ jobs, isDeleting, isDuplicating, onDelete, onDuplicate }: JobPostsTableProps) => (
  <div className="overflow-x-auto">
    <table className="min-w-full text-sm">
      <thead className="bg-zinc-100 text-left dark:bg-zinc-900">
        <tr>
          {['Title', 'Department', 'Location', 'Type', 'Status', 'Actions'].map((column) => (
            <th key={column} className="px-4 py-3 font-medium text-zinc-700 dark:text-zinc-400">
              {column}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {jobs.map((job, index) => {
          const statusAccent = getJobStatusAccent(job.status);

          return (
            <tr key={job.id} className={index % 2 ? 'bg-zinc-50 dark:bg-zinc-900' : 'bg-white dark:bg-zinc-950'}>
              <td className="px-4 py-3 font-medium">{job.title}</td>
              <td className="px-4 py-3">{job.department ?? '-'}</td>
              <td className="px-4 py-3">{job.location}</td>
              <td className="px-4 py-3">{formatJobLabel(job.employment_type, 'Employment type not specified')}</td>
              <td className="px-4 py-3">
                <span className={`rounded-lg border px-3 py-1 text-sm font-medium ${statusAccent.className}`}>
                  {statusAccent.label}
                </span>
              </td>
              <td className="px-4 py-3">
                <div className="flex gap-2">
                  <Link className={actionButtonClassName({ iconOnly: true })} to={`/recruiter/job-posts/${job.id}`} aria-label={`View ${job.title}`} title={`View ${job.title}`}>
                    <Eye size={16} />
                    <span className="sr-only">{`View ${job.title}`}</span>
                  </Link>
                  <Link className={actionButtonClassName({ iconOnly: true })} to={`/recruiter/job-posts/${job.id}/edit`} aria-label={`Edit ${job.title}`} title={`Edit ${job.title}`}>
                    <Pencil size={16} />
                    <span className="sr-only">{`Edit ${job.title}`}</span>
                  </Link>
                  <ActionButton
                    onClick={(event) => {
                      event.stopPropagation();
                      onDuplicate(job);
                    }}
                    disabled={isDeleting || isDuplicating}
                    title="Create a copy of this job with all details pre-filled"
                    label={`Duplicate ${job.title}`}
                    icon={<Copy size={16} />}
                    iconOnly
                  >
                  </ActionButton>
                  <ActionButton
                    onClick={(event) => {
                      event.stopPropagation();
                      onDelete(job);
                    }}
                    disabled={isDeleting || isDuplicating}
                    label={`Delete ${job.title}`}
                    icon={<Trash2 size={16} />}
                    iconOnly
                    destructive
                  >
                  </ActionButton>
                </div>
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  </div>
);
