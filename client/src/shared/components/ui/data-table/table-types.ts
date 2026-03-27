import type { HTMLAttributes, ReactNode } from "react";

export type DataTableSortDirection = "asc" | "desc";

export interface DataTableSortState {
  columnId: string;
  direction: DataTableSortDirection;
}

export type DataTableSortType<T> =
  | "string"
  | "number"
  | "date"
  | ((left: T, right: T) => number);

export interface DataTableColumn<T> {
  id: string;
  header: ReactNode;
  cell: (row: T, index: number) => ReactNode;
  accessor?: (row: T) => string | number | Date | null | undefined;
  sortable?: boolean;
  sortType?: DataTableSortType<T>;
  widthClassName?: string;
  headerClassName?: string;
  cellClassName?: string | ((row: T, index: number) => string | undefined);
  align?: "left" | "center" | "right";
}

export interface DataTableRowConfig {
  className?: string;
  props?: HTMLAttributes<HTMLTableRowElement>;
}
