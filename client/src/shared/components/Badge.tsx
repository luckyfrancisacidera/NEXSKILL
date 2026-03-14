import type { PropsWithChildren } from 'react';

export const Badge = ({ children }: PropsWithChildren) => (
  <span className="inline-flex items-center rounded-md border border-zinc-300 dark:border-zinc-700 bg-zinc-100 dark:bg-zinc-900 px-2 py-1 text-xs font-medium text-zinc-700 dark:text-zinc-300">
    {children}
  </span>
);
