const skeletonRows = Array.from({ length: 5 }, (_, index) => index);

export const JobPostsTableSkeleton = () => (
  <div className="overflow-x-auto rounded-2xl border border-zinc-200 dark:border-zinc-800">
    <table className="min-w-full text-sm">
      <thead className="bg-zinc-100 text-left dark:bg-zinc-900">
        <tr>
          {['Title', 'Department', 'Location', 'Type', 'Status', 'Actions'].map((column) => (
            <th key={column} className="px-4 py-3 font-medium text-zinc-700 dark:text-zinc-400">
              {column}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {skeletonRows.map((row) => (
          <tr key={row} className="border-t border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950">
            <td className="px-4 py-4">
              <div className="h-4 w-40 animate-pulse rounded bg-zinc-200 dark:bg-zinc-800" />
            </td>
            <td className="px-4 py-4">
              <div className="h-4 w-24 animate-pulse rounded bg-zinc-100 dark:bg-zinc-900" />
            </td>
            <td className="px-4 py-4">
              <div className="h-4 w-28 animate-pulse rounded bg-zinc-100 dark:bg-zinc-900" />
            </td>
            <td className="px-4 py-4">
              <div className="h-4 w-20 animate-pulse rounded bg-zinc-100 dark:bg-zinc-900" />
            </td>
            <td className="px-4 py-4">
              <div className="h-7 w-24 animate-pulse rounded-lg bg-zinc-100 dark:bg-zinc-900" />
            </td>
            <td className="px-4 py-4">
              <div className="flex gap-2">
                <div className="h-9 w-9 animate-pulse rounded-lg bg-zinc-100 dark:bg-zinc-900" />
                <div className="h-9 w-9 animate-pulse rounded-lg bg-zinc-100 dark:bg-zinc-900" />
                <div className="h-9 w-9 animate-pulse rounded-lg bg-zinc-100 dark:bg-zinc-900" />
                <div className="h-9 w-9 animate-pulse rounded-lg bg-zinc-100 dark:bg-zinc-900" />
              </div>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);
