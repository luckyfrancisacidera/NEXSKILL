import type { HTMLAttributes, PropsWithChildren } from 'react';
import { cn } from '@shared/utils/cn';

export const Card = ({ children, className, ...props }: PropsWithChildren<HTMLAttributes<HTMLDivElement>>) => (
  <div
    className={cn('w-full min-w-0 rounded-xl border border-zinc-200 p-5 shadow-[0_8px_24px_rgba(0,0,0,0.04)] dark:border-zinc-800 dark:bg-zinc-950', className)}
    {...props}
  >
    {children}
  </div>
);
