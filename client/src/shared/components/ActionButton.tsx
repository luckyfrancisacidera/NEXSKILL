import type { ButtonHTMLAttributes, ReactNode } from 'react';

import { cn } from '@shared/utils/cn';

export interface ActionButtonClassNameOptions {
  destructive?: boolean;
  iconOnly?: boolean;
  fullWidth?: boolean;
}

export interface ActionButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement>,
    ActionButtonClassNameOptions {
  icon?: ReactNode;
  label?: string;
}

const neutralBaseClassName =
  'inline-flex items-center justify-center gap-2 rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm font-medium text-zinc-100 shadow-sm transition hover:border-zinc-600 hover:bg-zinc-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-500 disabled:cursor-not-allowed disabled:opacity-50';

const destructiveClassName =
  'border-rose-700 bg-rose-950/60 text-rose-200 hover:border-rose-600 hover:bg-rose-900/70 focus-visible:ring-rose-500';

export const actionButtonClassName = ({
  destructive = false,
  iconOnly = false,
  fullWidth = false,
}: ActionButtonClassNameOptions = {}) =>
  cn(
    neutralBaseClassName,
    destructive && destructiveClassName,
    iconOnly && 'h-10 w-10 px-0',
    fullWidth && 'flex w-full px-4 py-3 text-base font-semibold',
  );

export const ActionButton = ({
  icon,
  label,
  children,
  destructive = false,
  iconOnly = false,
  fullWidth = false,
  className,
  title,
  type = 'button',
  ...props
}: ActionButtonProps) => {
  if (iconOnly && !label) {
    throw new Error('ActionButton requires `label` when `iconOnly` is true.');
  }

  const accessibleLabel = label ?? (typeof children === 'string' ? children : undefined);

  return (
    <button
      type={type}
      className={cn(
        actionButtonClassName({ destructive, iconOnly, fullWidth }),
        className,
      )}
      aria-label={iconOnly ? accessibleLabel : props['aria-label']}
      title={title ?? accessibleLabel}
      {...props}
    >
      {icon}
      {iconOnly ? (
        <span className="sr-only">{accessibleLabel}</span>
      ) : (
        children
      )}
    </button>
  );
};
