import type { KeyboardEvent as ReactKeyboardEvent } from 'react';
import type { ReactNode } from 'react';
import { useEffect, useId, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Check, ChevronDown } from 'lucide-react';

import { cn } from '@shared/utils/cn';

import { FormControlShell } from './FormControlShell';

export type AppSelectOption = {
  value: string;
  label: ReactNode;
  triggerLabel?: ReactNode;
  count?: number;
  accentClassName?: string;
  disabled?: boolean;
};

export type AppSelectProps = {
  label?: string;
  name: string;
  value: string;
  options: AppSelectOption[];
  id?: string;
  ariaLabel?: string;
  disabled?: boolean;
  onChange?: (event: { target: { name: string; value: string } }) => void;
  className?: string;
  labelClassName?: string;
  buttonClassName?: string;
  listboxClassName?: string;
  compactOnMobile?: boolean;
  size?: 'default' | 'compact' | 'pagination';
};

type DropdownPosition = {
  top: number;
  left: number;
  width: number;
  maxWidth: number;
};

const baseButtonClassName =
  'flex w-full items-center justify-between rounded-xl border border-zinc-300 bg-white font-inter text-left text-xs text-zinc-700 shadow-sm outline-none transition hover:border-zinc-400 focus:border-zinc-400 focus:ring-4 focus:ring-zinc-200 disabled:cursor-not-allowed disabled:opacity-60 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200 dark:hover:border-zinc-600 dark:hover:bg-zinc-800/80 dark:focus:border-zinc-400 dark:focus:ring-white/15 sm:text-sm';

const defaultBadgeClassName = 'bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300';

export function AppSelect({
  label,
  name,
  value,
  options,
  id,
  ariaLabel,
  disabled = false,
  onChange,
  className,
  labelClassName,
  buttonClassName,
  listboxClassName,
  compactOnMobile = true,
  size = 'default',
}: AppSelectProps) {
  const generatedId = useId();
  const triggerId = id ?? `${name}-${generatedId}`;
  const listboxId = `${triggerId}-listbox`;
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const dropdownRef = useRef<HTMLDivElement | null>(null);
  const triggerRef = useRef<HTMLButtonElement | null>(null);
  const listboxRef = useRef<HTMLDivElement | null>(null);
  const optionRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const [dropdownPosition, setDropdownPosition] = useState<DropdownPosition | null>(null);

  const selectedIndex = useMemo(() => {
    const index = options.findIndex((option) => option.value === value);
    return index >= 0 ? index : 0;
  }, [options, value]);

  const selectedOption = options[selectedIndex];
  const selectedTriggerLabel = selectedOption?.triggerLabel ?? selectedOption?.label ?? options[0]?.triggerLabel ?? options[0]?.label ?? '';

  useEffect(() => {
    setActiveIndex(selectedIndex);
  }, [selectedIndex]);

  useEffect(() => {
    if (!open) {
      return;
    }

    optionRefs.current[activeIndex]?.focus();
  }, [activeIndex, open]);

  useEffect(() => {
    if (!open || typeof window === 'undefined') {
      return;
    }

    const updateDropdownPosition = () => {
      const triggerRect = triggerRef.current?.getBoundingClientRect();
      if (!triggerRect) {
        return;
      }

      const viewportPadding = 8;
      const availableWidth = Math.max(240, window.innerWidth - viewportPadding * 2);

      setDropdownPosition({
        top: triggerRect.bottom + 8,
        left: Math.min(
          Math.max(viewportPadding, triggerRect.left),
          window.innerWidth - viewportPadding - Math.min(320, Math.max(triggerRect.width, 240)),
        ),
        width: triggerRect.width,
        maxWidth: availableWidth,
      });
    };

    updateDropdownPosition();

    window.addEventListener('resize', updateDropdownPosition);
    window.addEventListener('scroll', updateDropdownPosition, true);

    return () => {
      window.removeEventListener('resize', updateDropdownPosition);
      window.removeEventListener('scroll', updateDropdownPosition, true);
    };
  }, [open]);

  useEffect(() => {
    if (open) {
      return;
    }

    setDropdownPosition(null);
  }, [open]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(target) &&
        listboxRef.current &&
        !listboxRef.current.contains(target)
      ) {
        setOpen(false);
      }
    };

    const handleEscape = (event: globalThis.KeyboardEvent) => {
      if (event.key === 'Escape') {
        setOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscape);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, []);

  const emitChange = (nextValue: string) => {
    onChange?.({
      target: {
        name,
        value: nextValue,
      },
    });
  };

  const handleSelect = (nextIndex: number) => {
    const nextOption = options[nextIndex];
    if (!nextOption || nextOption.disabled) {
      return;
    }

    emitChange(nextOption.value);
    setActiveIndex(nextIndex);
    setOpen(false);
  };

  const focusNextOption = (direction: 1 | -1) => {
    if (!options.length) {
      return;
    }

    let nextIndex = activeIndex;

    for (let step = 0; step < options.length; step += 1) {
      nextIndex = (nextIndex + direction + options.length) % options.length;
      if (!options[nextIndex].disabled) {
        setActiveIndex(nextIndex);
        return;
      }
    }
  };

  const openMenu = () => {
    if (disabled || options.length === 0) {
      return;
    }

    setActiveIndex(selectedIndex);
    setOpen(true);
  };

  const handleTriggerKeyDown = (event: ReactKeyboardEvent<HTMLButtonElement>) => {
    if (disabled) {
      return;
    }

    if (event.key === 'ArrowDown' || event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      openMenu();
    }

    if (event.key === 'ArrowUp') {
      event.preventDefault();
      openMenu();
      focusNextOption(-1);
    }
  };

  const handleOptionKeyDown = (event: ReactKeyboardEvent<HTMLButtonElement>, optionIndex: number) => {
    if (event.key === 'ArrowDown') {
      event.preventDefault();
      focusNextOption(1);
    }

    if (event.key === 'ArrowUp') {
      event.preventDefault();
      focusNextOption(-1);
    }

    if (event.key === 'Home') {
      event.preventDefault();
      setActiveIndex(0);
    }

    if (event.key === 'End') {
      event.preventDefault();
      setActiveIndex(options.length - 1);
    }

    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      handleSelect(optionIndex);
    }

    if (event.key === 'Escape') {
      event.preventDefault();
      setOpen(false);
    }
  };

  return (
    <FormControlShell label={label} htmlFor={triggerId} className={className} labelClassName={labelClassName}>
      <div ref={dropdownRef} className="relative min-w-0 max-w-full">
        <input type="hidden" name={name} value={selectedOption?.value ?? value} />
        <button
          ref={triggerRef}
          id={triggerId}
          type="button"
          aria-label={ariaLabel ?? label}
          aria-haspopup="listbox"
          aria-expanded={open}
          aria-controls={listboxId}
          disabled={disabled}
          onClick={() => (open ? setOpen(false) : openMenu())}
          onKeyDown={handleTriggerKeyDown}
          className={cn(
            baseButtonClassName,
            'max-w-full',
            size === 'pagination'
              ? 'h-8 px-2.5 text-xs sm:h-10 sm:px-3 sm:text-sm'
              : size === 'compact'
                ? 'h-9 px-2.5 text-xs sm:h-10 sm:px-3 sm:text-sm'
                : compactOnMobile
                  ? 'h-[38px] px-3 text-xs sm:h-10 sm:text-sm md:h-11 md:px-3.5'
                  : 'h-[38px] px-3 text-xs sm:h-11 sm:px-3.5 sm:text-sm',
            buttonClassName,
          )}
        >
          <div className="flex min-w-0 items-center gap-2">
            <span className="truncate">{selectedTriggerLabel}</span>
            {typeof selectedOption?.count === 'number' ? (
              <span
                className={cn(
                  'flex h-6 min-w-6 items-center justify-center rounded-full px-2 text-xs font-semibold',
                  selectedOption.accentClassName ?? defaultBadgeClassName,
                )}
              >
                {selectedOption.count}
              </span>
            ) : null}
          </div>
          <ChevronDown
            className={cn(
              size === 'pagination' ? 'ml-1.5 h-3.5 w-3.5 sm:ml-2 sm:h-4 sm:w-4' : 'ml-2 h-4 w-4',
              'shrink-0 text-zinc-500 transition-transform dark:text-zinc-500',
              open && 'rotate-180',
            )}
          />
        </button>

        {open && dropdownPosition && typeof document !== 'undefined'
          ? createPortal(
              <div
                ref={listboxRef}
                id={listboxId}
                role="listbox"
                aria-labelledby={triggerId}
                className={cn(
                  'fixed z-[90] max-h-80 overflow-x-hidden overflow-y-auto rounded-2xl border border-zinc-200 bg-white p-1.5 font-inter shadow-xl dark:border-zinc-800 dark:bg-zinc-900',
                  listboxClassName,
                )}
                style={{
                  top: dropdownPosition.top,
                  left: dropdownPosition.left,
                  minWidth: dropdownPosition.width,
                  maxWidth: dropdownPosition.maxWidth,
                }}
              >
                {options.map((option, optionIndex) => {
                  const isSelected = option.value === (selectedOption?.value ?? value);

                  return (
                    <button
                      key={option.value}
                      ref={(node) => {
                        optionRefs.current[optionIndex] = node;
                      }}
                      type="button"
                      role="option"
                      aria-selected={isSelected}
                      disabled={option.disabled}
                      onClick={() => handleSelect(optionIndex)}
                      onKeyDown={(event) => handleOptionKeyDown(event, optionIndex)}
                      className={cn(
                        'flex w-full max-w-full items-center justify-between rounded-xl px-2.5 py-2.5 text-left text-sm transition-colors disabled:cursor-not-allowed disabled:opacity-60',
                        isSelected
                          ? 'bg-zinc-100 text-zinc-800 dark:bg-white/10 dark:text-zinc-100'
                          : 'text-zinc-700 hover:bg-zinc-50 dark:text-zinc-200 dark:hover:bg-white/5',
                      )}
                    >
                      <div className="flex min-w-0 items-center gap-2">
                        <span className="truncate">{option.label}</span>
                        {typeof option.count === 'number' ? (
                          <span
                            className={cn(
                              'flex h-6 min-w-6 items-center justify-center rounded-full px-2 text-xs font-semibold',
                              option.accentClassName ?? defaultBadgeClassName,
                            )}
                          >
                            {option.count}
                          </span>
                        ) : null}
                      </div>
                      {isSelected ? <Check className="ml-2 h-4 w-4 shrink-0" /> : null}
                    </button>
                  );
                })}
              </div>,
              document.body,
            )
          : null}
      </div>
    </FormControlShell>
  );
}
