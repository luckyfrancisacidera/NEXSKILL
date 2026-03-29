import type { ButtonHTMLAttributes, PropsWithChildren } from 'react';
import { LoaderCircle } from 'lucide-react';
import { cn } from '@shared/utils/cn';

type ButtonProps = PropsWithChildren<ButtonHTMLAttributes<HTMLButtonElement>> & {
  variant?: 'primary' | 'secondary';
  loading?: boolean;
  loadingText?: string;
};

export const Button = ({
  children,
  className,
  variant = 'primary',
  loading = false,
  loadingText,
  disabled,
  ...props
}: ButtonProps) => (
  <button
    className={cn(
      'relative inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-500 disabled:cursor-not-allowed disabled:opacity-60',
      variant === 'primary'
        ? 'bg-zinc-900 text-zinc-50 hover:bg-zinc-700 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200'
        : 'border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-800 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800',
      className,
    )}
    disabled={disabled || loading}
    aria-busy={loading}
    {...props}
  >
    <span className={cn('inline-flex items-center justify-center gap-2', loading && 'opacity-0')}>
      {children}
    </span>
    {loading ? (
      <span className="absolute inset-0 inline-flex items-center justify-center gap-2">
        <LoaderCircle className="h-4 w-4 animate-spin" />
        {loadingText ? <span>{loadingText}</span> : null}
      </span>
    ) : null}
  </button>
);
