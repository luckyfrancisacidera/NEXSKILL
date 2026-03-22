import type { ComponentType, ReactNode } from 'react';
import { ChevronRight, type LucideIcon } from 'lucide-react';
import { Link } from 'react-router-dom';

import { Card } from '@shared/components/Card';
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
  <section className="rounded-[28px] border border-zinc-200 bg-[radial-gradient(circle_at_top_left,rgba(15,23,42,0.06),transparent_45%),linear-gradient(135deg,#ffffff,#f8fafc)] p-6 shadow-sm dark:border-zinc-800 dark:bg-[radial-gradient(circle_at_top_left,rgba(148,163,184,0.09),transparent_40%),linear-gradient(135deg,#09090b,#18181b)] md:p-8">
    <div className="flex flex-wrap items-start justify-between gap-4">
      <div className="min-w-0 max-w-3xl">
        {eyebrow ? (
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-zinc-500 dark:text-zinc-400">
            {eyebrow}
          </p>
        ) : null}
        <h1 className="mt-3 text-3xl font-semibold tracking-tight text-zinc-950 dark:text-zinc-100">
          {title}
        </h1>
        <p className="mt-3 text-sm leading-6 text-zinc-600 dark:text-zinc-400">
          {description}
        </p>
      </div>
      {actions ? <div className="flex min-w-0 flex-wrap gap-3">{actions}</div> : null}
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
  <Card className="rounded-3xl border border-zinc-200/80 bg-white/95 p-5 shadow-[0_18px_40px_rgba(15,23,42,0.07)] backdrop-blur-sm dark:border-zinc-800 dark:bg-zinc-950/95 dark:shadow-[0_20px_45px_rgba(0,0,0,0.35)]">
    <div className="flex items-start justify-between gap-4">
      <div className="min-w-0 space-y-3">
        <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">{label}</p>
        <p className={cn('text-3xl font-semibold tracking-tight text-zinc-950 dark:text-zinc-100', valueClassName)}>
          {typeof value === 'number' ? value.toLocaleString() : value}
        </p>
        <p className="text-xs leading-5 text-zinc-500 dark:text-zinc-400">{helper}</p>
      </div>
      <div
        className={cn(
          'flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-zinc-100 text-zinc-600 dark:bg-zinc-900 dark:text-zinc-300',
          iconClassName,
        )}
      >
        <Icon className="h-5 w-5" />
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
  <Card className={cn('rounded-3xl border border-zinc-200 bg-white p-0 shadow-sm dark:border-zinc-800 dark:bg-zinc-950', className)}>
    <div className="flex flex-wrap items-start justify-between gap-4 border-b border-zinc-200 px-6 py-5 dark:border-zinc-800">
      <div className="min-w-0 space-y-1">
        <h2 className="text-lg font-semibold text-zinc-950 dark:text-zinc-100">{title}</h2>
        {description ? (
          <p className="text-sm leading-6 text-zinc-500 dark:text-zinc-400">{description}</p>
        ) : null}
      </div>
      {action}
    </div>
    <div className={cn('min-w-0 p-6', contentClassName)}>{children}</div>
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
      'flex flex-col items-center justify-center rounded-3xl border border-dashed border-zinc-300 bg-zinc-50/90 px-6 text-center dark:border-zinc-700 dark:bg-zinc-900/60',
      compact ? 'py-10' : 'py-14',
    )}
  >
    <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-white text-zinc-500 shadow-sm dark:bg-zinc-950 dark:text-zinc-300">
      <Icon className="h-6 w-6" />
    </div>
    <h3 className="text-base font-semibold text-zinc-950 dark:text-zinc-100">{title}</h3>
    <p className="mt-2 max-w-md text-sm leading-6 text-zinc-500 dark:text-zinc-400">{description}</p>
    {action ? <div className="mt-5">{action}</div> : null}
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
  <div className="flex items-start gap-4 rounded-2xl border border-zinc-200 bg-zinc-50/70 p-4 transition hover:border-zinc-300 hover:bg-white dark:border-zinc-800 dark:bg-zinc-900/70 dark:hover:border-zinc-700 dark:hover:bg-zinc-900">
    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white text-sm font-semibold text-zinc-600 shadow-sm dark:bg-zinc-950 dark:text-zinc-300">
      {rank}
    </div>
    {avatar}
    <div className="min-w-0 flex-1">
      <p className="truncate font-semibold text-zinc-950 dark:text-zinc-100">{title}</p>
      {subtitle ? <p className="mt-0.5 text-sm text-zinc-500 dark:text-zinc-400">{subtitle}</p> : null}
      {meta.length > 0 ? (
        <div className="mt-3 flex flex-wrap gap-2">
          {meta.map((item) => (
            <span
              key={item}
              className="rounded-full border border-zinc-200 bg-white px-2.5 py-1 text-xs font-medium text-zinc-600 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-300"
            >
              {item}
            </span>
          ))}
        </div>
      ) : null}
    </div>
    {trailing}
  </div>
);

interface DashboardListLinkProps {
  to: string;
  children: ReactNode;
}

export const DashboardListLink = ({ to, children }: DashboardListLinkProps) => (
  <Link
    to={to}
    className="inline-flex items-center gap-1 text-sm font-medium text-zinc-600 transition hover:text-zinc-950 dark:text-zinc-400 dark:hover:text-zinc-200"
  >
    {children}
    <ChevronRight className="h-4 w-4" />
  </Link>
);
