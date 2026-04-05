import type { ChangeEventHandler, InputHTMLAttributes, ReactNode } from 'react';
import { Search } from 'lucide-react';

import { cn } from '@shared/utils/cn';

import { FormControlShell } from './FormControlShell';

const baseInputClassName =
  'w-full rounded-xl border border-zinc-300 bg-white text-sm text-zinc-700 shadow-sm outline-none transition placeholder:text-zinc-400 hover:border-zinc-400 focus:border-violet-500 focus:ring-4 focus:ring-violet-100 disabled:cursor-not-allowed disabled:opacity-60 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 dark:placeholder:text-zinc-600 dark:hover:border-zinc-600 dark:focus:border-violet-600 dark:focus:ring-violet-900';

export interface SearchInputProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size' | 'onChange'> {
  label?: ReactNode;
  ariaLabel?: string;
  wrapperClassName?: string;
  inputClassName?: string;
  labelClassName?: string;
  icon?: ReactNode;
  onChange?: ChangeEventHandler<HTMLInputElement>;
  onValueChange?: (value: string) => void;
  compactOnMobile?: boolean;
}

export const searchInputClassName = baseInputClassName;

export function SearchInput({
  id,
  name,
  label,
  ariaLabel,
  wrapperClassName,
  inputClassName,
  labelClassName,
  icon,
  onChange,
  onValueChange,
  compactOnMobile = true,
  type = 'search',
  ...props
}: SearchInputProps) {
  const leadingIcon = icon === undefined ? null : icon;
  const hasLeadingIcon = Boolean(leadingIcon);

  const handleChange: ChangeEventHandler<HTMLInputElement> = (event) => {
    onChange?.(event);
    onValueChange?.(event.target.value);
  };

  return (
    <FormControlShell
      label={label}
      htmlFor={id}
      className={wrapperClassName}
      labelClassName={labelClassName}
    >
      <div className="relative">
        {hasLeadingIcon ? (
          <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400 dark:text-zinc-500">
            {leadingIcon}
          </span>
        ) : null}
        <input
          {...props}
          id={id}
          name={name}
          type={type}
          aria-label={ariaLabel ?? (typeof label === 'string' ? label : undefined)}
          className={cn(
            baseInputClassName,
            compactOnMobile ? 'h-10 px-3.5 md:h-11' : 'h-11 px-3.5',
            hasLeadingIcon && 'pl-10',
            inputClassName,
          )}
          onChange={handleChange}
        />
      </div>
    </FormControlShell>
  );
}

export const SearchInputIcon = Search;

