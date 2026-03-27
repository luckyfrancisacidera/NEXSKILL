import { ChevronLeft, ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";

import { cn } from "@shared/utils/cn";

interface TablePaginationProps {
  page: number;
  totalPages: number;
  totalCount?: number;
  pageSize?: number;
  pageSizeOptions?: number[];
  onPageChange?: (page: number) => void;
  getPageHref?: (page: number) => string;
  onPageSizeChange?: (pageSize: number) => void;
  itemLabel?: string;
  className?: string;
}

const buildPageItems = (page: number, totalPages: number) => {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, index) => index + 1);
  }

  const pages = new Set([1, totalPages, page - 1, page, page + 1]);
  const normalized = Array.from(pages)
    .filter((value) => value >= 1 && value <= totalPages)
    .sort((left, right) => left - right);

  return normalized.reduce<Array<number | "ellipsis">>((items, value, index) => {
    const previous = normalized[index - 1];

    if (previous && value - previous > 1) {
      items.push("ellipsis");
    }

    items.push(value);
    return items;
  }, []);
};

const paginationButtonClassName =
  "inline-flex h-8 min-w-8 items-center justify-center border border-zinc-200 bg-white px-2.5 text-sm text-zinc-600 transition hover:bg-zinc-50 disabled:pointer-events-none disabled:text-zinc-300 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-300 dark:hover:bg-zinc-900 dark:disabled:text-zinc-700";

const renderPageButton = (
  page: number,
  currentPage: number,
  onPageChange?: (nextPage: number) => void,
  getPageHref?: (nextPage: number) => string,
) => {
  const isCurrent = page === currentPage;
  const className = cn(
    paginationButtonClassName,
    isCurrent &&
      "border-zinc-800 bg-zinc-800 text-white hover:bg-zinc-700 dark:border-zinc-100 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-white",
  );

  if (getPageHref) {
    return (
      <Link
        key={page}
        to={getPageHref(page)}
        aria-current={isCurrent ? "page" : undefined}
        className={className}
      >
        {page}
      </Link>
    );
  }

  return (
    <button
      key={page}
      type="button"
      aria-current={isCurrent ? "page" : undefined}
      className={className}
      onClick={() => onPageChange?.(page)}
    >
      {page}
    </button>
  );
};

export const TablePagination = ({
  page,
  totalPages,
  totalCount,
  pageSize,
  pageSizeOptions = [10, 20, 50],
  onPageChange,
  getPageHref,
  onPageSizeChange,
  itemLabel = "entries",
  className,
}: TablePaginationProps) => {
  const pageItems = buildPageItems(page, totalPages);
  const startResult = totalCount && pageSize ? (totalCount === 0 ? 0 : (page - 1) * pageSize + 1) : undefined;
  const endResult = totalCount && pageSize ? Math.min(page * pageSize, totalCount) : undefined;

  const renderPrevNext = (direction: "prev" | "next") => {
    const isPrevious = direction === "prev";
    const targetPage = isPrevious ? page - 1 : page + 1;
    const isDisabled = isPrevious ? page <= 1 : page >= totalPages;
    const label = isPrevious ? "Previous page" : "Next page";
    const icon = isPrevious ? <ChevronLeft className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />;

    if (getPageHref && !isDisabled) {
      return (
        <Link
          to={getPageHref(targetPage)}
          aria-label={label}
          className={paginationButtonClassName}
        >
          {icon}
        </Link>
      );
    }

    return (
      <button
        type="button"
        aria-label={label}
        disabled={isDisabled}
        className={paginationButtonClassName}
        onClick={() => onPageChange?.(targetPage)}
      >
        {icon}
      </button>
    );
  };

  return (
    <div
      className={cn(
        "flex flex-col gap-3 border-t border-zinc-200 px-4 py-4 text-sm text-zinc-500 dark:border-zinc-800 dark:text-zinc-400 sm:flex-row sm:items-center sm:justify-between",
        className,
      )}
    >
      <div className="flex flex-wrap items-center gap-3">
        <span>
          {startResult !== undefined && endResult !== undefined && totalCount !== undefined
            ? `Showing ${startResult} to ${endResult} of ${totalCount} ${itemLabel}`
            : `Page ${page} of ${totalPages}`}
        </span>
        {pageSize !== undefined && onPageSizeChange ? (
          <label className="flex items-center gap-2">
            <span>Rows</span>
            <select
              value={pageSize}
              className="h-8 border border-zinc-200 bg-white px-2.5 text-sm text-zinc-700 outline-none transition hover:border-zinc-300 focus:border-zinc-400 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-300 dark:hover:border-zinc-700 dark:focus:border-zinc-600"
              onChange={(event) => onPageSizeChange(Number(event.target.value))}
            >
              {pageSizeOptions.map((size) => (
                <option key={size} value={size}>
                  {size}
                </option>
              ))}
            </select>
          </label>
        ) : null}
      </div>

      <div className="flex flex-wrap items-center gap-1">
        {renderPrevNext("prev")}
        {pageItems.map((item, index) =>
          item === "ellipsis" ? (
            <span key={`ellipsis-${index}`} className="px-2 text-zinc-400 dark:text-zinc-600">
              ...
            </span>
          ) : (
            renderPageButton(item, page, onPageChange, getPageHref)
          ),
        )}
        {renderPrevNext("next")}
      </div>
    </div>
  );
};
