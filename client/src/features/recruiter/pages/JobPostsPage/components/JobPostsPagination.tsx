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
  <div className="flex items-center justify-between border-t border-zinc-200 dark:border-zinc-800 p-4 text-sm text-zinc-700 dark:text-zinc-400">
    <span>
      Page {page} of {pageCount}
    </span>
    <div className="flex items-center gap-2">
      <select value={String(pageSize)} className="min-w-30 rounded border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-2 py-1 text-sm text-zinc-900 dark:text-zinc-100" onChange={(event) => onPageSizeChange(event.target.value)} style={{ colorScheme: 'light dark' }}>
        {[10, 20, 50].map((size) => (
          <option key={size} value={size}>
            {size} / page
          </option>
        ))}
      </select>
      <Link to={previousHref} className="rounded border border-zinc-300 dark:border-zinc-700 px-3 py-1 text-zinc-700 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-900">Prev</Link>
      <Link to={nextHref} className="rounded border border-zinc-300 dark:border-zinc-700 px-3 py-1 text-zinc-700 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-900">Next</Link>
    </div>
  </div>
);
