import type { ComponentType, ReactNode } from 'react';

import { Card } from '@shared/components/Card';

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
      <Card className="p-4 sm:p-5">
        <h3 className="border-b border-zinc-200 dark:border-zinc-800 pb-2 text-[1.05rem] font-semibold text-zinc-800 dark:text-zinc-200">{title}</h3>
        <div className="pt-3">{children}</div>
      </Card>
    );
  }

  return (
    <section className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-4 shadow-sm">
      <div className="mb-3 flex items-start gap-2">
        {Icon ? <Icon className="mt-0.5 h-4 w-4 text-violet-700" /> : null}
        <div>
          <h3 className="text-base font-semibold text-zinc-900">{title}</h3>
          {description ? <p className="mt-1 text-sm text-zinc-500">{description}</p> : null}
        </div>
      </div>
      {children}
    </section>
  );
};

