import { Form, Link } from 'react-router-dom';

import type { RecruiterInterview } from '@features/recruiter/types';
import { DataTable } from '@shared/components/ui/data-table/DataTable';
import { IdentityCell } from '@shared/components/ui/data-table/IdentityCell';
import type { DataTableColumn } from '@shared/components/ui/data-table/table-types';

export interface InterviewListItem
  extends Pick<RecruiterInterview, 'id' | 'candidateId' | 'jobId' | 'interviewer' | 'startsAt' | 'status' | 'location'> {}

export interface InterviewsTableProps {
  interviews: InterviewListItem[];
  candidates: Array<{ id: string; name: string }>;
  jobs: Array<{ id: string; title: string }>;
}

/**
 * Recruiter interviews table with built-in row actions.
 */
export const InterviewsTable = ({ interviews, candidates, jobs }: InterviewsTableProps) => {
  const candidateMap = new Map(candidates.map((candidate) => [candidate.id, candidate.name]));
  const jobMap = new Map(jobs.map((job) => [job.id, job.title]));

  const columns: Array<DataTableColumn<InterviewListItem>> = [
    {
      id: 'candidate',
      header: 'Candidate',
      cell: (item) => (
        <IdentityCell
          name={candidateMap.get(item.candidateId) ?? 'Candidate'}
          email={item.interviewer}
        />
      ),
      accessor: (item) => candidateMap.get(item.candidateId) ?? '',
      sortable: true,
      sortType: 'string',
      widthClassName: 'min-w-[240px]',
    },
    {
      id: 'job',
      header: 'Job',
      cell: (item) => jobMap.get(item.jobId) ?? 'Unknown job',
      accessor: (item) => jobMap.get(item.jobId) ?? '',
      sortable: true,
      sortType: 'string',
    },
    {
      id: 'scheduled',
      header: 'Date / Time',
      cell: (item) => new Date(item.startsAt).toLocaleString(),
      accessor: (item) => new Date(item.startsAt),
      sortable: true,
      sortType: 'date',
    },
    {
      id: 'location',
      header: 'Location',
      cell: (item) => item.location,
      accessor: (item) => item.location,
      sortable: true,
      sortType: 'string',
    },
    {
      id: 'status',
      header: 'Status',
      cell: (item) => item.status,
      accessor: (item) => item.status,
      sortable: true,
      sortType: 'string',
    },
    {
      id: 'actions',
      header: 'Actions',
      align: 'right',
      cell: (item) => (
        <div className="flex justify-end gap-3 text-sm">
          <Link className="text-zinc-700 hover:text-zinc-900 hover:underline dark:text-zinc-300 dark:hover:text-zinc-100" to={`/recruiter/interviews/${item.id}/edit`}>Reschedule</Link>
          <Form method="post" action={`/recruiter/interviews/${item.id}/cancel`}>
            <input type="hidden" name="cancelReason" value="Canceled by recruiter" />
            <button className="text-rose-600 hover:underline dark:text-rose-400" type="submit">Cancel</button>
          </Form>
        </div>
      ),
      cellClassName: 'w-[180px]',
    },
  ];

  return <DataTable data={interviews} columns={columns} getRowKey={(item) => item.id} />;
};
