import type { ReactNode } from 'react';

import { cn } from '@shared/utils/cn';

interface FormControlShellProps {
  label?: ReactNode;
  htmlFor?: string;
  className?: string;
  labelClassName?: string;
  children: ReactNode;
}

export const defaultFormControlLabelClassName =
  'mb-1.5 block text-xs font-medium text-zinc-600 dark:text-zinc-400';

export function FormControlShell({
  label,
  htmlFor,
  className,
  labelClassName,
  children,
}: FormControlShellProps) {
  return (
    <div className={cn('w-full min-w-0', className)}>
      {label ? (
        <label htmlFor={htmlFor} className={cn(defaultFormControlLabelClassName, labelClassName)}>
          {label}
        </label>
      ) : null}
      {children}
    </div>
  );
}

