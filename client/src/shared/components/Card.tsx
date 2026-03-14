import type { HTMLAttributes, PropsWithChildren } from 'react';
import { cn } from '@shared/utils/cn';

export const Card = ({ children, className, ...props }: PropsWithChildren<HTMLAttributes<HTMLDivElement>>) => (
  <div
    className={cn('rounded-xl border border-zinc-200 dark:bg-zinc-900 dark:border-zinc-800 p-5 shadow-[0_8px_24px_rgba(0,0,0,0.04)]', className)}
    {...props}
  >
    {children}
  </div>
);
