import { Link } from 'react-router-dom';

export interface JobPostsPaginationProps {
  page: number;
  pageCount: number;
  pageSize: number;
  onPageSizeChange: (pageSize: string) => void;
  previousHref: string;
  nextHref: string;
}

/**
 * Shared pagination footer for the jobs list.
 */
export const JobPostsPagination = ({ page, pageCount, pageSize, onPageSizeChange, previousHref, nextHref }: JobPostsPaginationProps) => (
  <div className="flex items-center justify-between border-t border-zinc-200 p-4 text-sm">
    <span>
      Page {page} of {pageCount}
    </span>
    <div className="flex items-center gap-2">
      <select value={String(pageSize)} className="min-w-30 rounded border border-zinc-300 px-2 py-1 text-sm" onChange={(event) => onPageSizeChange(event.target.value)}>
        {[10, 20, 50].map((size) => (
          <option key={size} value={size}>
            {size} / page
          </option>
        ))}
      </select>
      <Link to={previousHref} className="rounded border border-zinc-300 px-3 py-1">Prev</Link>
      <Link to={nextHref} className="rounded border border-zinc-300 px-3 py-1">Next</Link>
    </div>
  </div>
);
