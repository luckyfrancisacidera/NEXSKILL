import type { ComponentType, ReactNode } from 'react';
import { ChevronRight, type LucideIcon } from 'lucide-react';
import { Link } from 'react-router-dom';

import { Card } from '@shared/components/data-display/Card';
import { cn } from '@shared/utils/cn';

interface DashboardPageHeaderProps {
  eyebrow?: string;
  title: string;
  description: string;
  actions?: ReactNode;
}

export const DashboardPageHeader = ({
  eyebrow,
  title,
  description,
  actions,
}: DashboardPageHeaderProps) => (
  <section className="rounded-[24px] border border-zinc-200 bg-[radial-gradient(circle_at_top_left,rgba(15,23,42,0.06),transparent_45%),linear-gradient(135deg,#ffffff,#f8fafc)] p-4 shadow-sm dark:border-zinc-800 dark:bg-[radial-gradient(circle_at_top_left,rgba(148,163,184,0.09),transparent_40%),linear-gradient(135deg,#09090b,#18181b)] sm:p-5 lg:p-6">
    <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-start sm:justify-between">
      <div className="min-w-0 max-w-3xl">
        {eyebrow ? (
          <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-zinc-500 dark:text-zinc-400 sm:text-[11px] sm:tracking-[0.22em]">
            {eyebrow}
          </p>
        ) : null}
        <h1 className="mt-2 text-xl font-semibold tracking-tight text-zinc-950 dark:text-zinc-100 min-[420px]:text-[1.35rem] sm:mt-2.5 sm:text-[1.65rem] lg:text-[1.85rem]">
          {title}
        </h1>
        <p className="mt-1.5 text-xs leading-5 text-zinc-600 dark:text-zinc-400 min-[420px]:text-[13px] sm:mt-2 sm:text-sm sm:leading-6">
          {description}
        </p>
      </div>
      {actions ? <div className="flex min-w-0 flex-wrap gap-2 sm:justify-end sm:gap-2.5">{actions}</div> : null}
    </div>
  </section>
);

interface DashboardStatCardProps {
  label: string;
  value: number | string;
  helper: string;
  icon: LucideIcon;
  iconClassName?: string;
  valueClassName?: string;
}

export const DashboardStatCard = ({
  label,
  value,
  helper,
  icon: Icon,
  iconClassName,
  valueClassName,
}: DashboardStatCardProps) => (
  <Card className="rounded-[22px] border border-zinc-200/80 bg-white/95 p-3.5 shadow-[0_18px_40px_rgba(15,23,42,0.07)] backdrop-blur-sm dark:border-zinc-800 dark:bg-zinc-950/95 dark:shadow-[0_20px_45px_rgba(0,0,0,0.35)] sm:p-4">
    <div className="flex items-start justify-between gap-3">
      <div className="min-w-0 space-y-2">
        <p className="text-[11px] font-medium text-zinc-500 dark:text-zinc-400 sm:text-xs">{label}</p>
        <p className={cn('text-lg font-semibold tracking-tight text-zinc-950 dark:text-zinc-100 min-[420px]:text-[1.25rem] sm:text-[1.4rem] lg:text-[1.6rem]', valueClassName)}>
          {typeof value === 'number' ? value.toLocaleString() : value}
        </p>
        <p className="text-[11px] leading-[1.125rem] text-zinc-500 dark:text-zinc-400 sm:text-xs sm:leading-5">{helper}</p>
      </div>
      <div
        className={cn(
          'flex h-[2.125rem] w-[2.125rem] shrink-0 items-center justify-center rounded-xl bg-zinc-100 text-zinc-600 dark:bg-zinc-900 dark:text-zinc-300 sm:h-[2.375rem] sm:w-[2.375rem] lg:h-10 lg:w-10',
          iconClassName,
        )}
      >
        <Icon className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
      </div>
    </div>
  </Card>
);

interface DashboardSectionCardProps {
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
  contentClassName?: string;
  children: ReactNode;
}

export const DashboardSectionCard = ({
  title,
  description,
  action,
  className,
  contentClassName,
  children,
}: DashboardSectionCardProps) => (
  <Card className={cn('rounded-[22px] border border-zinc-200 bg-white p-0 shadow-sm dark:border-zinc-800 dark:bg-zinc-950', className)}>
    <div className="flex flex-col gap-2.5 border-b border-zinc-200 px-3.5 py-3.5 dark:border-zinc-800 sm:flex-row sm:flex-wrap sm:items-start sm:justify-between sm:gap-3 sm:px-4 sm:py-4 lg:px-5">
      <div className="min-w-0 space-y-1">
        <h2 className="text-sm font-semibold text-zinc-950 dark:text-zinc-100 sm:text-base">{title}</h2>
        {description ? (
          <p className="text-xs leading-5 text-zinc-500 dark:text-zinc-400 sm:text-sm">{description}</p>
        ) : null}
      </div>
      {action}
    </div>
    <div className={cn('min-w-0 p-3.5 sm:p-4 lg:p-5', contentClassName)}>{children}</div>
  </Card>
);

interface DashboardEmptyStateProps {
  title: string;
  description: string;
  icon: ComponentType<{ className?: string }>;
  action?: ReactNode;
  compact?: boolean;
}

export const DashboardEmptyState = ({
  title,
  description,
  icon: Icon,
  action,
  compact = false,
}: DashboardEmptyStateProps) => (
  <div
    className={cn(
      'flex flex-col items-center justify-center rounded-[22px] border border-dashed border-zinc-300 bg-zinc-50/90 px-4 text-center dark:border-zinc-700 dark:bg-zinc-900/60',
      compact ? 'py-8' : 'py-12',
    )}
  >
    <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-full bg-white text-zinc-500 shadow-sm dark:bg-zinc-950 dark:text-zinc-300">
      <Icon className="h-5 w-5" />
    </div>
    <h3 className="text-sm font-semibold text-zinc-950 dark:text-zinc-100 sm:text-base">{title}</h3>
    <p className="mt-1.5 max-w-md text-xs leading-5 text-zinc-500 dark:text-zinc-400 sm:text-sm sm:leading-6">{description}</p>
    {action ? <div className="mt-4">{action}</div> : null}
  </div>
);

interface DashboardRankItemProps {
  title: string;
  subtitle?: string;
  meta?: string[];
  rank: number;
  avatar?: ReactNode;
  trailing?: ReactNode;
}

export const DashboardRankItem = ({
  title,
  subtitle,
  meta = [],
  rank,
  avatar,
  trailing,
}: DashboardRankItemProps) => (
  <div className="flex items-start gap-3 rounded-[18px] border border-zinc-200 bg-zinc-50/70 p-3 transition hover:border-zinc-300 hover:bg-white dark:border-zinc-800 dark:bg-zinc-900/70 dark:hover:border-zinc-700 dark:hover:bg-zinc-900 sm:gap-3.5 sm:p-3.5">
    {avatar ? <div className="shrink-0">{avatar}</div> : null}
    <div className="min-w-0 flex-1">
      <div className="flex min-w-0 items-center gap-2">
        <span className="inline-flex h-5 min-w-5 shrink-0 items-center justify-center rounded-full border border-zinc-200 bg-white px-1.5 text-[10px] font-semibold text-zinc-500 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-400">
          #{rank}
        </span>
        <p className="truncate text-[13px] font-semibold text-zinc-950 dark:text-zinc-100 sm:text-sm">{title}</p>
      </div>
      {subtitle ? <p className="mt-0.5 truncate text-[11px] text-zinc-500 dark:text-zinc-400 sm:text-xs">{subtitle}</p> : null}
      {meta.length > 0 ? (
        <div className="mt-2.5 flex flex-wrap gap-1.5">
          {meta.map((item) => (
            <span
              key={item}
              className="rounded-full border border-zinc-200 bg-white px-2 py-0.5 text-[10px] font-medium text-zinc-600 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-300 sm:text-[11px]"
            >
              {item}
            </span>
          ))}
        </div>
      ) : null}
    </div>
    {trailing ? <div className="sm:shrink-0">{trailing}</div> : null}
  </div>
);

interface DashboardListLinkProps {
  to: string;
  children: ReactNode;
}

export const DashboardListLink = ({ to, children }: DashboardListLinkProps) => (
  <Link
    to={to}
    className="inline-flex items-center gap-1 text-xs font-medium text-zinc-600 transition hover:text-zinc-950 dark:text-zinc-400 dark:hover:text-zinc-200 sm:text-sm"
  >
    {children}
    <ChevronRight className="h-3.5 w-3.5" />
  </Link>
);

