const skeletonRows = Array.from({ length: 5 }, (_, index) => index);

export const ApplicationsTableSkeleton = () => (
  <div className="overflow-x-auto">
    <table className="min-w-full table-fixed">
      <thead className="bg-zinc-50 dark:bg-zinc-900/70">
        <tr className="border-b border-zinc-200 dark:border-zinc-800">
          {["Role", "Applied", "Status", "Actions"].map((header) => (
            <th
              key={header}
              className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.12em] text-zinc-500 dark:text-zinc-400"
            >
              {header}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {skeletonRows.map((row) => (
          <tr key={row} className="border-b border-zinc-200 dark:border-zinc-800">
            <td className="px-4 py-4">
              <div className="space-y-2">
                <div className="h-4 w-40 animate-pulse bg-zinc-200 dark:bg-zinc-800" />
                <div className="h-3 w-28 animate-pulse bg-zinc-100 dark:bg-zinc-900" />
              </div>
            </td>
            <td className="px-4 py-4">
              <div className="h-4 w-24 animate-pulse bg-zinc-100 dark:bg-zinc-900" />
            </td>
            <td className="px-4 py-4">
              <div className="h-7 w-24 animate-pulse bg-zinc-100 dark:bg-zinc-900" />
            </td>
            <td className="px-4 py-4">
              <div className="flex gap-2">
                <div className="h-9 w-20 animate-pulse bg-zinc-100 dark:bg-zinc-900" />
                <div className="h-9 w-24 animate-pulse bg-zinc-100 dark:bg-zinc-900" />
              </div>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);
