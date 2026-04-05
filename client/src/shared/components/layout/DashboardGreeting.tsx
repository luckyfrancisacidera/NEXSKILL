import { useMemo } from 'react';
import type { ReactNode } from 'react';
import type { LucideIcon } from 'lucide-react';
import { Sparkles } from 'lucide-react';

import { useAuth } from '@app/providers/AuthProvider';
import { cn } from '@shared/utils/cn';

interface DashboardGreetingStat {
  label: string;
  value: string | number;
}

interface DashboardGreetingProps {
  subtitle: string;
  title?: ReactNode;
  name?: string;
  badge?: string;
  icon?: LucideIcon;
  stats?: DashboardGreetingStat[];
  action?: ReactNode;
  className?: string;
}

const toDisplayName = (value?: string | null) => {
  if (!value) {
    return 'there';
  }

  const candidate = value.trim();
  if (!candidate) {
    return 'there';
  }

  const firstName = candidate.split(' ').filter(Boolean)[0];
  if (!firstName) {
    return 'there';
  }

  return firstName.charAt(0).toUpperCase() + firstName.slice(1);
};

export const DashboardGreeting = ({
  subtitle,
  title,
  name,
  badge,
  icon: Icon = Sparkles,
  stats = [],
  action,
  className,
}: DashboardGreetingProps) => {
  const { user } = useAuth();

  const displayName = useMemo(
    () => toDisplayName(name ?? user?.firstName),
    [name, user?.firstName],
  );

  return (
    <section
      className={cn(
        'relative overflow-hidden rounded-[24px] border border-zinc-200/80 bg-[radial-gradient(circle_at_top_left,rgba(63,63,70,0.18),transparent_34%),radial-gradient(circle_at_bottom_right,rgba(82,82,91,0.14),transparent_28%),linear-gradient(135deg,rgba(39,39,42,0.96),rgba(24,24,27,0.94))] p-3.5 shadow-[0_18px_50px_rgba(15,23,42,0.16)] dark:border-zinc-700 dark:bg-[radial-gradient(circle_at_top_left,rgba(63,63,70,0.24),transparent_30%),radial-gradient(circle_at_bottom_right,rgba(82,82,91,0.18),transparent_24%),linear-gradient(135deg,rgba(39,39,42,0.98),rgba(24,24,27,0.96))] dark:shadow-[0_24px_60px_rgba(0,0,0,0.4)] sm:p-4 md:p-5 lg:p-6',
        className,
      )}
    >
      <div className="absolute inset-y-0 right-0 hidden w-40 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.12),transparent_65%)] dark:bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.08),transparent_65%)] lg:block" />
      <div className="relative flex flex-col gap-4 sm:gap-5 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0 max-w-3xl">
          <div className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/10 px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-zinc-100 shadow-sm backdrop-blur dark:border-white/10 dark:bg-white/5 dark:text-zinc-200 sm:px-2.5 sm:text-[11px] sm:tracking-[0.16em]">
            <Icon className="h-3 w-3" />
            {badge ?? 'Daily overview'}
          </div>
          <h2 className="mt-2.5 text-lg font-semibold tracking-tight text-zinc-50 min-[420px]:text-[1.25rem] sm:mt-3 sm:text-[1.45rem] lg:text-[1.7rem]">
            {title ?? `Hi, ${displayName}`}
          </h2>
          <p className="mt-1.5 max-w-2xl text-xs leading-5 text-zinc-300 dark:text-zinc-400 min-[420px]:text-[13px] sm:mt-2 sm:text-sm sm:leading-6">{subtitle}</p>
        </div>

        <div className="flex flex-col gap-2.5 sm:gap-3 lg:min-w-64 lg:items-end">
          {stats.length > 0 ? (
            <div className="grid w-full gap-2 min-[440px]:grid-cols-2 sm:gap-2.5 lg:w-auto">
              {stats.map((stat) => (
                <div
                  key={stat.label}
                  className="rounded-[18px] border border-white/10 bg-white/10 px-3 py-2 shadow-sm backdrop-blur dark:border-white/10 dark:bg-white/5 sm:px-3.5 sm:py-2.5"
                >
                  <p className="text-[10px] font-medium uppercase tracking-[0.1em] text-zinc-300 dark:text-zinc-400 sm:text-[11px] sm:tracking-[0.12em]">
                    {stat.label}
                  </p>
                  <p className="mt-1 text-base font-semibold text-zinc-50 sm:mt-1.5 sm:text-xl">
                    {typeof stat.value === 'number' ? stat.value.toLocaleString() : stat.value}
                  </p>
                </div>
              ))}
            </div>
          ) : null}
          {action ? <div className="flex w-full flex-wrap gap-2 sm:gap-2.5 lg:w-auto lg:justify-end">{action}</div> : null}
        </div>
      </div>
    </section>
  );
};
