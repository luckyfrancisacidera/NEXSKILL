import { useMemo, useState } from "react";
import type { ReactNode } from "react";

import { SortableHeader } from "@shared/components/ui/data-table/SortableHeader";
import type {
  DataTableColumn,
  DataTableRowConfig,
  DataTableSortState,
  DataTableSortType,
} from "@shared/components/ui/data-table/table-types";
import { cn } from "@shared/utils/cn";

interface DataTableProps<T> {
  data: T[];
  columns: Array<DataTableColumn<T>>;
  getRowKey: (row: T, index: number) => string;
  defaultSort?: DataTableSortState | null;
  getRowConfig?: (row: T, index: number) => DataTableRowConfig | undefined;
  emptyState?: ReactNode;
  loading?: boolean;
  loadingRowCount?: number;
  surfaceClassName?: string;
  tableClassName?: string;
  toolbar?: ReactNode;
  footer?: ReactNode;
}

const getAriaSort = (columnId: string, sortState?: DataTableSortState | null) => {
  if (sortState?.columnId !== columnId) {
    return "none";
  }

  return sortState.direction === "asc" ? "ascending" : "descending";
};

const getColumnAlignmentClassName = (align?: DataTableColumn<unknown>["align"]) => {
  if (align === "center") {
    return "text-center";
  }

  if (align === "right") {
    return "text-right";
  }

  return "text-left";
};

const compareValues = <T,>(left: T, right: T, sortType: DataTableSortType<T>, accessor?: DataTableColumn<T>["accessor"]) => {
  if (typeof sortType === "function") {
    return sortType(left, right);
  }

  const leftValue = accessor?.(left);
  const rightValue = accessor?.(right);

  if (leftValue == null && rightValue == null) {
    return 0;
  }

  if (leftValue == null) {
    return 1;
  }

  if (rightValue == null) {
    return -1;
  }

  if (sortType === "number") {
    return Number(leftValue) - Number(rightValue);
  }

  if (sortType === "date") {
    return new Date(leftValue).getTime() - new Date(rightValue).getTime();
  }

  return String(leftValue).localeCompare(String(rightValue), undefined, {
    sensitivity: "base",
    numeric: true,
  });
};

export const DataTable = <T,>({
  data,
  columns,
  getRowKey,
  defaultSort = null,
  getRowConfig,
  emptyState,
  loading = false,
  loadingRowCount = 6,
  surfaceClassName,
  tableClassName,
  toolbar,
  footer,
}: DataTableProps<T>) => {
  const [sortState, setSortState] = useState<DataTableSortState | null>(defaultSort);

  const sortedData = useMemo(() => {
    if (!sortState) {
      return data;
    }

    const activeColumn = columns.find((column) => column.id === sortState.columnId);

    if (!activeColumn?.sortable || !activeColumn.sortType) {
      return data;
    }

    const directionMultiplier = sortState.direction === "asc" ? 1 : -1;

    return [...data].sort(
      (left, right) =>
        compareValues(left, right, activeColumn.sortType as DataTableSortType<T>, activeColumn.accessor) *
        directionMultiplier,
    );
  }, [columns, data, sortState]);

  const toggleSort = (columnId: string) => {
    setSortState((current) => {
      if (current?.columnId !== columnId) {
        return { columnId, direction: "asc" };
      }

      return {
        columnId,
        direction: current.direction === "asc" ? "desc" : "asc",
      };
    });
  };

  const renderSkeletonCell = (columnId: string) => (
    <div
      key={columnId}
      className="h-4 w-full max-w-[160px] animate-pulse rounded bg-zinc-200/80 dark:bg-zinc-800"
    />
  );

  return (
    <section
      className={cn(
        "overflow-hidden border border-zinc-200 bg-white font-inter dark:border-zinc-800 dark:bg-zinc-950",
        surfaceClassName,
      )}
    >
      {toolbar ? <div className="border-b border-zinc-200 px-4 py-4 dark:border-zinc-800 sm:px-5">{toolbar}</div> : null}
      <div className="w-full overflow-x-auto overscroll-x-contain">
        <table className={cn("min-w-max w-full table-auto", tableClassName)}>
          <thead className="border-b border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950">
            <tr>
              {columns.map((column) => {
                const alignClassName = getColumnAlignmentClassName(column.align);

                return (
                  <th
                    key={column.id}
                    scope="col"
                    aria-sort={column.sortable ? getAriaSort(column.id, sortState) : undefined}
                    className={cn(
                      "px-3 py-3.5 align-middle text-[10px] font-medium uppercase leading-4 text-zinc-500 first:pl-4 last:pr-4 dark:text-zinc-400 sm:px-4 sm:py-4.5 sm:text-[11px] sm:first:pl-6 sm:last:pr-7",
                      alignClassName,
                      column.widthClassName,
                      column.headerClassName,
                    )}
                  >
                    {column.sortable ? (
                      <SortableHeader
                        label={typeof column.header === "string" ? column.header : String(column.id)}
                        columnId={column.id}
                        sortState={sortState}
                        onToggleSort={toggleSort}
                      />
                    ) : (
                      column.header
                    )}
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {loading && data.length === 0
              ? Array.from({ length: loadingRowCount }, (_, rowIndex) => (
                <tr
                  key={`loading-${rowIndex}`}
                  className="transition-colors hover:bg-zinc-50 dark:hover:bg-zinc-900/60"
                >
                  {columns.map((column) => (
                      <td
                        key={column.id}
                        className="border-b border-zinc-200 px-3 py-3.5 align-middle first:pl-4 last:pr-4 dark:border-zinc-800 sm:px-4 sm:py-4.5 sm:first:pl-6 sm:last:pr-7"
                      >
                        {renderSkeletonCell(column.id)}
                      </td>
                    ))}
                </tr>
                ))
              : null}

            {sortedData.length > 0
              ? sortedData.map((row, index) => {
                  const rowConfig = getRowConfig?.(row, index);
                  const rowProps = rowConfig?.props;

                  return (
                    <tr
                      key={getRowKey(row, index)}
                      className={cn(
                        "transition-colors hover:bg-zinc-50 dark:hover:bg-zinc-900/60",
                        rowConfig?.className,
                        rowProps?.className,
                      )}
                      {...rowProps}
                    >
                      {columns.map((column) => {
                        const alignClassName = getColumnAlignmentClassName(column.align);
                        const cellClassName =
                          typeof column.cellClassName === "function"
                            ? column.cellClassName(row, index)
                            : column.cellClassName;

                        return (
                          <td
                            key={column.id}
                            className={cn(
                              "border-b border-zinc-200 px-3 py-3.5 align-middle text-[12px] leading-5 text-zinc-700 first:pl-4 last:pr-4 dark:border-zinc-800 dark:text-zinc-300 sm:px-4 sm:py-4.5 sm:first:pl-6 sm:last:pr-7",
                              alignClassName,
                              column.widthClassName,
                              cellClassName,
                            )}
                          >
                            {column.cell(row, index)}
                          </td>
                        );
                      })}
                    </tr>
                  );
                })
              : null}
          </tbody>
        </table>
      </div>

      {!loading && sortedData.length === 0 && emptyState ? emptyState : null}
      {footer}
    </section>
  );
};
