import type { PropsWithChildren } from 'react';

export const Badge = ({ children }: PropsWithChildren) => (
  <span className="inline-flex items-center rounded-md border border-zinc-300 bg-zinc-100 px-1.5 py-0.5 text-[10px] font-medium text-zinc-700 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-300 sm:px-2 sm:py-1 sm:text-xs">
    {children}
  </span>
);
