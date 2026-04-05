import type { InputHTMLAttributes, ReactNode } from 'react';
import { Check } from 'lucide-react';

import { cn } from '@shared/utils/cn';

export type CheckboxProps = Omit<
  InputHTMLAttributes<HTMLInputElement>,
  'type' | 'children'
> & {
  label: ReactNode;
  boxClassName?: string;
  labelClickable?: boolean;
};

export const Checkbox = ({
  id,
  label,
  className,
  boxClassName,
  labelClickable = true,
  ...props
}: CheckboxProps) => (
  <div
    className={cn(
      'group inline-flex items-start gap-3 text-sm text-zinc-700 dark:text-zinc-300',
      className,
    )}
  >
    <label htmlFor={id} className="relative mt-0.5 inline-flex shrink-0 cursor-pointer">
      <input id={id} type="checkbox" className="peer sr-only" {...props} />
      <span
        aria-hidden="true"
        className={cn(
          'inline-flex h-5 w-5 items-center justify-center rounded-md border border-zinc-300 bg-white text-transparent shadow-sm transition-all duration-200 group-hover:border-zinc-400 peer-checked:border-zinc-800 peer-checked:bg-zinc-800 peer-checked:text-white peer-focus-visible:outline-none peer-focus-visible:ring-2 peer-focus-visible:ring-violet-400 peer-focus-visible:ring-offset-2 peer-focus-visible:ring-offset-white dark:border-zinc-700 dark:bg-zinc-900 dark:group-hover:border-zinc-500 dark:peer-checked:border-zinc-200 dark:peer-checked:bg-zinc-100 dark:peer-checked:text-zinc-950 dark:peer-focus-visible:ring-violet-500 dark:peer-focus-visible:ring-offset-zinc-950',
          boxClassName,
        )}
      >
        <Check className="h-3.5 w-3.5 stroke-3" />
      </span>
    </label>
    {labelClickable ? (
      <label htmlFor={id} className="cursor-pointer leading-6">
        {label}
      </label>
    ) : (
      <span className="leading-6">{label}</span>
    )}
  </div>
);
