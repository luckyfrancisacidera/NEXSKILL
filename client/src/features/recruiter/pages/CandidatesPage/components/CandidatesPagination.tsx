import { Link } from 'react-router-dom';

export interface CandidatesPaginationProps {
  page: number;
  totalPages: number;
  total: number;
  previousHref: string;
  nextHref: string;
}

/**
 * Pagination footer for the recruiter candidates list.
 */
export const CandidatesPagination = ({ page, totalPages, total, previousHref, nextHref }: CandidatesPaginationProps) => (
  <div className="mt-4 flex items-center justify-between border-t border-zinc-200 dark:border-zinc-800 pt-4 text-sm text-zinc-700 dark:text-zinc-400">
    <span>
      Page {page} of {totalPages} - {total} candidates
    </span>
    <div className="flex gap-2">
      <Link to={previousHref} className="rounded border border-zinc-300 dark:border-zinc-700 px-3 py-1 text-zinc-700 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-900">Prev</Link>
      <Link to={nextHref} className="rounded border border-zinc-300 dark:border-zinc-700 px-3 py-1 text-zinc-700 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-900">Next</Link>
    </div>
  </div>
);
