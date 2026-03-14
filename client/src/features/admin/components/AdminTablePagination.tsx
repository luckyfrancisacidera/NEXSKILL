import { Link } from 'react-router-dom';

interface AdminTablePaginationProps {
  pageNumber: number;
  totalPages: number;
  totalCount: number;
  pageSize: number;
  previousHref: string;
  nextHref: string;
  onPageSizeChange: (pageSize: string) => void;
}

export const AdminTablePagination = ({
  pageNumber,
  totalPages,
  totalCount,
  pageSize,
  previousHref,
  nextHref,
  onPageSizeChange,
}: AdminTablePaginationProps) => (
  <div className="flex flex-wrap items-center justify-between gap-3 border-t border-zinc-200 dark:border-zinc-800 px-6 py-4 text-sm text-zinc-600 dark:text-zinc-400">
    <span>
      {totalCount} total <span aria-hidden="true" className="px-1 text-zinc-400 dark:text-zinc-600">&bull;</span> Page {pageNumber} of {totalPages}
    </span>
    <div className="flex items-center gap-2">
      <select
        value={String(pageSize)}
        className="min-w-28 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-3 py-2 text-sm text-zinc-700 dark:text-zinc-300"
        onChange={(event) => onPageSizeChange(event.target.value)}
      >
        {[5, 10, 20, 50].map((size) => (
          <option key={size} value={size}>
            {size} / page
          </option>
        ))}
      </select>
      <Link to={previousHref} className="rounded-lg border border-zinc-200 dark:border-zinc-700 px-3 py-2 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800">
        Prev
      </Link>
      <Link to={nextHref} className="rounded-lg border border-zinc-200 dark:border-zinc-700 px-3 py-2 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800">
        Next
      </Link>
    </div>
  </div>
);