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
  <div className="flex flex-wrap items-center justify-between gap-3 border-t border-zinc-200 px-6 py-4 text-sm text-zinc-600">
    <span>
      {totalCount} total <span aria-hidden="true" className="px-1 text-zinc-400">&bull;</span> Page {pageNumber} of {totalPages}
    </span>
    <div className="flex items-center gap-2">
      <select
        value={String(pageSize)}
        className="min-w-28 rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-700"
        onChange={(event) => onPageSizeChange(event.target.value)}
      >
        {[5, 10, 20, 50].map((size) => (
          <option key={size} value={size}>
            {size} / page
          </option>
        ))}
      </select>
      <Link to={previousHref} className="rounded-lg border border-zinc-200 px-3 py-2 text-zinc-700 hover:bg-zinc-50">
        Prev
      </Link>
      <Link to={nextHref} className="rounded-lg border border-zinc-200 px-3 py-2 text-zinc-700 hover:bg-zinc-50">
        Next
      </Link>
    </div>
  </div>
);