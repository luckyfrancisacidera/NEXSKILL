import { Eye, Pencil, Trash2 } from 'lucide-react';
import { Link } from 'react-router-dom';

import type { JobListItem } from '@features/recruiter/types';
import { getJobStatusAccent } from '@shared/utils/jobStatusAccent';

export interface JobPostsTableProps {
  jobs: JobListItem[];
  isDeleting: boolean;
  onDelete: (job: JobListItem) => void;
}

/**
 * Presentational table for the recruiter job listing.
 */
export const JobPostsTable = ({ jobs, isDeleting, onDelete }: JobPostsTableProps) => (
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
              <td className="px-4 py-3">{job.employment_type}</td>
              <td className="px-4 py-3">
                <span className={`rounded-lg border px-3 py-1 text-sm font-medium ${statusAccent.className}`}>
                  {statusAccent.label}
                </span>
              </td>
              <td className="px-4 py-3">
                <div className="flex gap-2">
                  <Link className="rounded border border-zinc-300 dark:border-zinc-700 px-2 py-1 text-zinc-700 dark:text-zinc-400" to={`/recruiter/job-posts/${job.id}`}><Eye size={16} /></Link>
                  <Link className="rounded border border-zinc-300 dark:border-zinc-700 px-2 py-1 text-zinc-700 dark:text-zinc-400" to={`/recruiter/job-posts/${job.id}/edit`}><Pencil size={16} /></Link>
                  <button
                    type="button"
                    className="rounded border border-rose-300 dark:border-rose-900 px-2 py-1 text-rose-700 dark:text-rose-400"
                    onClick={(event) => {
                      // Stop propagation so delete only opens one controlled verification modal.
                      event.stopPropagation();
                      onDelete(job);
                    }}
                    disabled={isDeleting}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  </div>
);
