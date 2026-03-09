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
  <div className="mt-4 flex items-center justify-between border-t border-zinc-200 pt-4 text-sm">
    <span>
      Page {page} of {totalPages} - {total} candidates
    </span>
    <div className="flex gap-2">
      <Link to={previousHref} className="rounded border border-zinc-300 px-3 py-1">Prev</Link>
      <Link to={nextHref} className="rounded border border-zinc-300 px-3 py-1">Next</Link>
    </div>
  </div>
);
