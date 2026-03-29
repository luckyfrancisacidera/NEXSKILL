import { SkeletonBlock } from "@shared/components/skeletons/SkeletonBlock";

interface TableRowsSkeletonProps {
  columns: Array<string>;
  rowCount?: number;
}

export const TableRowsSkeleton = ({
  columns,
  rowCount = 6,
}: TableRowsSkeletonProps) => (
  <div className="overflow-hidden border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950">
    <div className="border-b border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950">
      <div
        className="grid gap-3 px-4 py-4 sm:px-6"
        style={{ gridTemplateColumns: columns.join(" ") }}
      >
        {columns.map((_, index) => (
          <SkeletonBlock
            key={`header-${index}`}
            className={index === columns.length - 1 ? "ml-auto h-3 w-20" : "h-3 w-24"}
          />
        ))}
      </div>
    </div>
    <div>
      {Array.from({ length: rowCount }, (_, rowIndex) => (
        <div
          key={`row-${rowIndex}`}
          className="grid gap-3 border-b border-zinc-200 px-4 py-4 last:border-b-0 dark:border-zinc-800 sm:px-6"
          style={{ gridTemplateColumns: columns.join(" ") }}
        >
          {columns.map((_, columnIndex) => (
            <div
              key={`cell-${rowIndex}-${columnIndex}`}
              className={columnIndex === columns.length - 1 ? "flex justify-end" : "space-y-2"}
            >
              <SkeletonBlock
                className={
                  columnIndex === 0
                    ? "h-4 w-32 max-w-full"
                    : columnIndex === columns.length - 1
                      ? "h-9 w-24 rounded-xl"
                      : "h-4 w-24 max-w-full"
                }
              />
              {columnIndex === 0 ? <SkeletonBlock className="h-3 w-40 max-w-full" /> : null}
            </div>
          ))}
        </div>
      ))}
    </div>
  </div>
);
