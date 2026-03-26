import { cn } from '@shared/utils/cn';

interface JobActionButtonOptions {
  destructive?: boolean;
  iconOnly?: boolean;
  fullWidth?: boolean;
}

const neutralBaseClassName =
  'inline-flex items-center justify-center gap-2 rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm font-medium text-zinc-100 shadow-sm transition hover:border-zinc-600 hover:bg-zinc-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-500 disabled:cursor-not-allowed disabled:opacity-50';

const destructiveClassName =
  'border-rose-700 bg-rose-950/60 text-rose-200 hover:border-rose-600 hover:bg-rose-900/70 focus-visible:ring-rose-500';

export const getJobActionButtonClassName = ({
  destructive = false,
  iconOnly = false,
  fullWidth = false,
}: JobActionButtonOptions = {}) =>
  cn(
    neutralBaseClassName,
    destructive && destructiveClassName,
    iconOnly && 'h-9 w-9 px-0',
    fullWidth && 'flex w-full px-4 py-3 text-base font-semibold',
  );


  