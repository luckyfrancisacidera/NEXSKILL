import type { ComponentType, ReactNode } from 'react';

import { Card } from '@shared/components/data-display/Card';

export interface RecruiterSectionCardProps {
  title: string;
  children: ReactNode;
  description?: string;
  icon?: ComponentType<{ className?: string }>;
  variant?: 'default' | 'compact';
}

/**
 * Feature-shared section container for recruiter pages with support for existing page variants.
 */
export const RecruiterSectionCard = ({
  title,
  children,
  description,
  icon: Icon,
  variant = 'default',
}: RecruiterSectionCardProps) => {
  if (variant === 'compact') {
    return (
      <Card className="w-full min-w-0 p-3.5 sm:p-5">
        <h3 className="border-b border-zinc-200 pb-2 text-sm font-semibold text-zinc-800 dark:border-zinc-800 dark:text-zinc-200 sm:text-[1.05rem]">{title}</h3>
        <div className="pt-3">{children}</div>
      </Card>
    );
  }

  return (
    <section className="w-full min-w-0 border-b border-zinc-200/80 pb-6 last:border-b-0 last:pb-0 dark:border-zinc-800/80">
      <div className="mb-4 flex min-w-0 items-start gap-2.5">
        {Icon ? <Icon className="mt-1 h-4 w-4 text-zinc-600 dark:text-zinc-400" /> : null}
        <div className="min-w-0">
          <h3 className="text-sm font-semibold text-zinc-900 dark:text-white sm:text-base">{title}</h3>
          {description ? <p className="mt-1 text-[13px] text-zinc-500 dark:text-zinc-400 sm:text-sm">{description}</p> : null}
        </div>
      </div>
      {children}
    </section>
  );
};

