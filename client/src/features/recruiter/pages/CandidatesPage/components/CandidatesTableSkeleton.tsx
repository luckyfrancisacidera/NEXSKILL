const skeletonRows = Array.from({ length: 5 }, (_, index) => index);

export const CandidatesTableSkeleton = () => (
  <div className="overflow-x-auto rounded-2xl border border-zinc-200 dark:border-zinc-800">
    <table className="min-w-full text-sm">
      <thead className="bg-zinc-100 text-zinc-700 dark:bg-zinc-900 dark:text-zinc-400">
        <tr>
          <th className="w-12 px-3 py-3 text-left">
            <div className="h-4 w-4 animate-pulse rounded border border-zinc-300 bg-zinc-100 dark:border-zinc-700 dark:bg-zinc-800" />
          </th>
          {['Name', 'Email', 'Job', 'Status', 'Score', 'Applied', 'Actions'].map((column) => (
            <th key={column} className="px-3 py-3 text-left font-semibold">
              {column}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {skeletonRows.map((row) => (
          <tr key={row} className="border-t border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950">
            <td className="px-3 py-4">
              <div className="h-4 w-4 animate-pulse rounded border border-zinc-300 bg-zinc-100 dark:border-zinc-700 dark:bg-zinc-800" />
            </td>
            <td className="px-3 py-4">
              <div className="h-4 w-32 animate-pulse rounded bg-zinc-200 dark:bg-zinc-800" />
            </td>
            <td className="px-3 py-4">
              <div className="h-4 w-40 animate-pulse rounded bg-zinc-100 dark:bg-zinc-900" />
            </td>
            <td className="px-3 py-4">
              <div className="h-4 w-28 animate-pulse rounded bg-zinc-100 dark:bg-zinc-900" />
            </td>
            <td className="px-3 py-4">
              <div className="h-7 w-24 animate-pulse rounded-lg bg-zinc-100 dark:bg-zinc-900" />
            </td>
            <td className="px-3 py-4">
              <div className="h-4 w-12 animate-pulse rounded bg-zinc-100 dark:bg-zinc-900" />
            </td>
            <td className="px-3 py-4">
              <div className="h-4 w-24 animate-pulse rounded bg-zinc-100 dark:bg-zinc-900" />
            </td>
            <td className="px-3 py-4">
              <div className="h-9 w-9 animate-pulse rounded-lg bg-zinc-100 dark:bg-zinc-900" />
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);
