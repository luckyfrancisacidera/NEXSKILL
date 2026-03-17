type ApplicationsPaginationProps = {
  pageNumber: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (pageSize: number) => void;
};

const buildPageItems = (pageNumber: number, totalPages: number) => {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, index) => index + 1);
  }

  const pages = new Set<number>([
    1,
    totalPages,
    pageNumber - 1,
    pageNumber,
    pageNumber + 1,
  ]);
  const normalized = Array.from(pages)
    .filter((page) => page >= 1 && page <= totalPages)
    .sort((a, b) => a - b);
  const items: Array<number | "ellipsis"> = [];

  normalized.forEach((page, index) => {
    const previous = normalized[index - 1];

    if (previous && page - previous > 1) {
      items.push("ellipsis");
    }

    items.push(page);
  });

  return items;
};

export const ApplicationsPagination = ({
  pageNumber,
  pageSize,
  totalCount,
  totalPages,
  onPageChange,
  onPageSizeChange,
}: ApplicationsPaginationProps) => {
  const pageItems = buildPageItems(pageNumber, totalPages);
  const startResult = totalCount === 0 ? 0 : (pageNumber - 1) * pageSize + 1;
  const endResult = Math.min(pageNumber * pageSize, totalCount);

  return (
    <div className="flex flex-col gap-4 border-t border-zinc-200 px-4 py-4 text-sm text-zinc-600 dark:border-zinc-800 dark:text-zinc-400 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex flex-wrap items-center gap-3">
        <span>
          Showing {startResult}-{endResult} of {totalCount}
        </span>
        <label className="flex items-center gap-2">
          <span>Rows</span>
          <select
            value={pageSize}
            className="h-9 border border-zinc-200 bg-white px-3 text-sm text-zinc-700 outline-none transition hover:border-zinc-300 focus:border-zinc-400 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:border-zinc-600 dark:focus:border-zinc-500"
            onChange={(event) => onPageSizeChange(Number(event.target.value))}
          >
            {[5, 10, 20, 50].map((size) => (
              <option key={size} value={size}>
                {size}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="flex flex-wrap items-center gap-1">
        <button
          type="button"
          disabled={pageNumber <= 1}
          className="h-9 border border-zinc-200 px-3 text-zinc-700 transition hover:bg-zinc-50 disabled:cursor-not-allowed disabled:text-zinc-400 disabled:hover:bg-transparent dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800 dark:disabled:text-zinc-600 dark:disabled:hover:bg-transparent"
          onClick={() => onPageChange(pageNumber - 1)}
        >
          Previous
        </button>

        {pageItems.map((item, index) =>
          item === "ellipsis" ? (
            <span key={`ellipsis-${index}`} className="px-2 text-zinc-400">
              ...
            </span>
          ) : (
            <button
              key={item}
              type="button"
              aria-current={item === pageNumber ? "page" : undefined}
              className={`h-9 min-w-9 border px-3 transition ${
                item === pageNumber
                  ? "border-zinc-900 bg-zinc-900 text-white dark:border-zinc-100 dark:bg-zinc-100 dark:text-zinc-950"
                  : "border-zinc-200 text-zinc-700 hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
              }`}
              onClick={() => onPageChange(item)}
            >
              {item}
            </button>
          ),
        )}

        <button
          type="button"
          disabled={pageNumber >= totalPages}
          className="h-9 border border-zinc-200 px-3 text-zinc-700 transition hover:bg-zinc-50 disabled:cursor-not-allowed disabled:text-zinc-400 disabled:hover:bg-transparent dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800 dark:disabled:text-zinc-600 dark:disabled:hover:bg-transparent"
          onClick={() => onPageChange(pageNumber + 1)}
        >
          Next
        </button>
      </div>
    </div>
  );
};
