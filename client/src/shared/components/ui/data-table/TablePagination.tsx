import { ChevronLeft, ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";

import { cn } from "@shared/utils/cn";
import { TablePageSizeControl, type TablePageSizeOption } from "@shared/components/ui/data-table/TablePageSizeControl";

interface TablePaginationProps {
  page: number;
  totalPages: number;
  totalCount?: number;
  pageSize?: number | string;
  pageSizeOptions?: Array<number | string | TablePageSizeOption>;
  onPageChange?: (page: number) => void;
  getPageHref?: (page: number) => string;
  onPageSizeChange?: (pageSize: number) => void;
  itemLabel?: string;
  className?: string;
  showPageSizeSelector?: boolean;
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
  "inline-flex h-7 min-w-7 shrink-0 items-center justify-center rounded-md border border-zinc-200 bg-white px-2 text-xs text-zinc-600 transition hover:bg-zinc-50 disabled:pointer-events-none disabled:text-zinc-300 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-300 dark:hover:bg-zinc-900 dark:disabled:text-zinc-700 sm:h-8 sm:min-w-8 sm:px-2.5 sm:text-sm";

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
  showPageSizeSelector = true,
}: TablePaginationProps) => {
  const numericPageSize = pageSize !== undefined ? Number(pageSize) : undefined;
  const hasValidPageSize = numericPageSize !== undefined && Number.isFinite(numericPageSize) && numericPageSize > 0;
  const pageItems = buildPageItems(page, totalPages);
  const startResult = totalCount !== undefined && hasValidPageSize ? (totalCount === 0 ? 0 : (page - 1) * numericPageSize + 1) : undefined;
  const endResult = totalCount !== undefined && hasValidPageSize ? Math.min(page * numericPageSize, totalCount) : undefined;

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
        "flex items-center justify-between gap-2 border-t border-zinc-200 px-3 py-3 text-xs text-zinc-500 dark:border-zinc-800 dark:text-zinc-400 max-[399px]:flex-wrap sm:px-4 sm:py-3.5 sm:text-sm",
        className,
      )}
    >
      <div className="flex min-w-0 shrink items-center gap-2 overflow-hidden">
        <span className="truncate whitespace-nowrap">
          {startResult !== undefined && endResult !== undefined && totalCount !== undefined
            ? `Showing ${startResult} to ${endResult} of ${totalCount} ${itemLabel}`
            : `Page ${page} of ${totalPages}`}
        </span>
        {showPageSizeSelector && pageSize !== undefined && onPageSizeChange ? (
          <TablePageSizeControl
            value={pageSize}
            options={pageSizeOptions}
            onChange={onPageSizeChange}
          />
        ) : null}
      </div>

      <div className="w-auto max-w-full overflow-x-auto pb-0.5">
        <div className="flex min-w-max items-center gap-0.5 sm:gap-1">
          {renderPrevNext("prev")}
          {pageItems.map((item, index) =>
            item === "ellipsis" ? (
              <span key={`ellipsis-${index}`} className="px-1.5 text-zinc-400 dark:text-zinc-600">
                ...
              </span>
            ) : (
              renderPageButton(item, page, onPageChange, getPageHref)
            ),
          )}
          {renderPrevNext("next")}
        </div>
      </div>
    </div>
  );
};
