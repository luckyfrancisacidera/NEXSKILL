import { Link, useLoaderData } from 'react-router-dom';

import { InterviewsTable, type InterviewListItem } from '@features/recruiter/pages/InterviewsPage/components/InterviewsTable';
import { Card } from '@shared/components/Card';

interface InterviewsLoaderData {
  interviews: InterviewListItem[];
  candidates: Array<{ id: string; name: string }>;
  jobs: Array<{ id: string; title: string }>;
}

/**
 * Route component for recruiter interviews.
 */
export const InterviewsPage = () => {
  const { interviews, candidates, jobs } = useLoaderData() as InterviewsLoaderData;

  return (
    <Card className="border-0 bg-transparent p-0 shadow-none dark:border-0 dark:bg-transparent">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100">Interviews</h2>
        <Link className="rounded-sm bg-zinc-900 px-4 py-2 text-white hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-white" to="/recruiter/interviews/new">
          Create interview
        </Link>
      </div>
      <InterviewsTable interviews={interviews} candidates={candidates} jobs={jobs} />
    </Card>
  );
};
