import type { ButtonHTMLAttributes, PropsWithChildren } from 'react';
import { cn } from '@shared/utils/cn';

type ButtonProps = PropsWithChildren<ButtonHTMLAttributes<HTMLButtonElement>> & {
  variant?: 'primary' | 'secondary';
};

export const Button = ({ children, className, variant = 'primary', ...props }: ButtonProps) => (
  <button
    className={cn(
      'rounded-lg px-4 py-2 text-sm font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-500 disabled:cursor-not-allowed disabled:opacity-60',
      variant === 'primary'
        ? 'bg-zinc-900 text-zinc-50 hover:bg-zinc-700'
        : 'border border-zinc-200 bg-white text-zinc-800 hover:bg-zinc-100',
      className,
    )}
    {...props}
  >
    {children}
  </button>
);
