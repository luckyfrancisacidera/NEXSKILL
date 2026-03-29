import { ChevronDown, ChevronUp } from "lucide-react";

import { cn } from "@shared/utils/cn";
import type { DataTableSortState } from "@shared/components/ui/data-table/table-types";

interface SortableHeaderProps {
  label: string;
  columnId: string;
  sortState?: DataTableSortState | null;
  onToggleSort: (columnId: string) => void;
}

export const SortableHeader = ({
  label,
  columnId,
  sortState,
  onToggleSort,
}: SortableHeaderProps) => {
  const isAscending = sortState?.columnId === columnId && sortState.direction === "asc";
  const isDescending = sortState?.columnId === columnId && sortState.direction === "desc";

  return (
    <button
      type="button"
      className="group inline-flex w-full items-center gap-1.5 text-left text-[10px] font-medium uppercase leading-4 sm:text-[11px]"
      onClick={() => onToggleSort(columnId)}
    >
      <span className="truncate">{label}</span>
      <span className="flex flex-col items-center justify-center text-zinc-400 transition-colors group-hover:text-zinc-500 dark:text-zinc-600 dark:group-hover:text-zinc-400">
        <ChevronUp
          className={cn(
            "-mb-1 h-3 w-3 sm:h-3.5 sm:w-3.5",
            isAscending && "text-zinc-800 dark:text-zinc-100",
          )}
        />
        <ChevronDown
          className={cn(
            "-mt-1 h-3 w-3 sm:h-3.5 sm:w-3.5",
            isDescending && "text-zinc-800 dark:text-zinc-100",
          )}
        />
      </span>
    </button>
  );
};
