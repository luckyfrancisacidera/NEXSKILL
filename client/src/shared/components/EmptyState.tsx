import type { ReactNode } from 'react';
import type { LucideIcon } from 'lucide-react';

import { Button } from '@shared/components/Button';
import { cn } from '@shared/utils/cn';

export interface EmptyStateProps {
  icon?: LucideIcon;
  iconNode?: ReactNode;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
}

export const EmptyState = ({
  icon: Icon,
  iconNode,
  title,
  description,
  actionLabel,
  onAction,
  className,
}: EmptyStateProps) => (
  <div
    className={cn(
      'flex min-h-[280px] w-full items-center justify-center rounded-2xl border border-dashed border-zinc-300 bg-zinc-50/70 px-6 py-10 text-center dark:border-zinc-700 dark:bg-zinc-900/40',
      className,
    )}
  >
    <div className="mx-auto flex max-w-md flex-col items-center gap-4">
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-zinc-200 bg-white text-zinc-400 shadow-sm dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-500">
        {iconNode ?? (Icon ? <Icon className="h-6 w-6" strokeWidth={1.8} /> : null)}
      </div>
      <div className="space-y-2">
        <h3 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">{title}</h3>
        <p className="text-sm leading-6 text-zinc-500 dark:text-zinc-400">{description}</p>
      </div>
      {actionLabel && onAction ? (
        <Button type="button" variant="secondary" onClick={onAction} className="mt-1 border-zinc-300 dark:border-zinc-700">
          {actionLabel}
        </Button>
      ) : null}
    </div>
  </div>
);
