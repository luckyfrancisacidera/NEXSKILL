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
      'group inline-flex items-start gap-3 text-sm text-zinc-300',
      className,
    )}
  >
    <label htmlFor={id} className="relative mt-0.5 inline-flex shrink-0 cursor-pointer">
      <input id={id} type="checkbox" className="peer sr-only" {...props} />
      <span
        aria-hidden="true"
        className={cn(
          'inline-flex h-5 w-5 items-center justify-center rounded-md border border-zinc-500 bg-white text-transparent shadow-sm transition-all duration-200 group-hover:border-zinc-300 peer-checked:border-zinc-400 peer-checked:bg-zinc-500 peer-checked:text-white peer-focus-visible:outline-none peer-focus-visible:ring-2 peer-focus-visible:ring-violet-300 peer-focus-visible:ring-offset-2 peer-focus-visible:ring-offset-zinc-800 dark:border-zinc-600 dark:bg-zinc-950/80 dark:group-hover:border-zinc-400 dark:peer-checked:border-zinc-300 dark:peer-checked:bg-zinc-400 dark:peer-checked:text-zinc-950 dark:peer-focus-visible:ring-white-400 dark:peer-focus-visible:ring-offset-zinc-950',
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
