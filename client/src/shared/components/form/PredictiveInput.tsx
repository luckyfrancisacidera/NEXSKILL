/* eslint-disable react-hooks/set-state-in-effect */
import { useEffect, useId, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

import { recruiterInputClassName } from '@features/recruiter/components/recruiterForm.shared';

const dedupeOptions = (values: string[]) => {
  const seen = new Set<string>();

  return values.filter((value) => {
    const key = value.trim().toLowerCase();
    if (!key || seen.has(key)) {
      return false;
    }

    seen.add(key);
    return true;
  });
};

export interface PredictiveInputProps {
  id?: string;
  name?: string;
  placeholder: string;
  options: string[];
  fetchOptions?: (query: string) => Promise<string[]>;
  debounceMs?: number;
  className?: string;
  value?: string;
  defaultValue?: string;
  required?: boolean;
  isRequired?: boolean;
  disabled?: boolean;
  error?: string;
  loading?: boolean;
  emptyState?: string;
  onChange?: (value: string) => void;
  onSelect?: (value: string) => void;
}

interface DropdownPosition {
  top: number;
  left: number;
  width: number;
  openUpward: boolean;
}

const dropdownOffset = 8;
const dropdownHeight = 208;

export const PredictiveInput = ({
  id,
  name,
  placeholder,
  options,
  fetchOptions,
  debounceMs = 350,
  className,
  value,
  defaultValue = '',
  required = false,
  isRequired = false,
  disabled = false,
  error,
  loading = false,
  emptyState = 'No matches found.',
  onChange,
  onSelect,
}: PredictiveInputProps) => {
  const generatedId = useId();
  const inputId = id ?? generatedId;
  const isControlled = value !== undefined;
  const [internalValue, setInternalValue] = useState(defaultValue);
  const [isOpen, setIsOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [remoteOptions, setRemoteOptions] = useState<string[]>([]);
  const [isFetching, setIsFetching] = useState(false);
  const [position, setPosition] = useState<DropdownPosition | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const displayValue = isControlled ? value : internalValue;

  useEffect(() => {
    if (!isControlled) {
      setInternalValue(defaultValue);
    }
  }, [defaultValue, isControlled]);

  useEffect(() => {
    if (!fetchOptions) {
      setRemoteOptions([]);
      return;
    }

    let isActive = true;
    const normalized = displayValue.trim();

    const timeoutId = window.setTimeout(async () => {
      setIsFetching(true);
      try {
        const fetched = await fetchOptions(normalized);
        if (!isActive) {
          return;
        }

        setRemoteOptions(dedupeOptions(Array.isArray(fetched) ? fetched : []));
      } catch {
        if (isActive) {
          setRemoteOptions([]);
        }
      } finally {
        if (isActive) {
          setIsFetching(false);
        }
      }
    }, Math.max(0, debounceMs));

    return () => {
      isActive = false;
      window.clearTimeout(timeoutId);
    };
  }, [debounceMs, displayValue, fetchOptions]);

  const availableOptions = useMemo(() => dedupeOptions([...options, ...remoteOptions]), [options, remoteOptions]);

  const suggestions = useMemo(() => {
    const normalized = displayValue.trim().toLowerCase();
    if (!normalized) {
      return availableOptions;
    }

    return availableOptions.filter((option) => option.toLowerCase().includes(normalized));
  }, [availableOptions, displayValue]);

  const updateDropdownPosition = () => {
    const input = inputRef.current;
    if (!input) {
      return;
    }

    const rect = input.getBoundingClientRect();
    const spaceBelow = window.innerHeight - rect.bottom;
    const openUpward = spaceBelow < dropdownHeight && rect.top > spaceBelow;

    setPosition({
      top: openUpward ? rect.top - dropdownOffset : rect.bottom + dropdownOffset,
      left: rect.left,
      width: rect.width,
      openUpward,
    });
  };

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    updateDropdownPosition();

    const handleWindowChange = () => {
      updateDropdownPosition();
    };

    window.addEventListener('resize', handleWindowChange);
    window.addEventListener('scroll', handleWindowChange, true);

    return () => {
      window.removeEventListener('resize', handleWindowChange);
      window.removeEventListener('scroll', handleWindowChange, true);
    };
  }, [isOpen, suggestions.length]);

  const setNextValue = (nextValue: string) => {
    if (!isControlled) {
      setInternalValue(nextValue);
    }

    onChange?.(nextValue);
  };

  const selectSuggestion = (nextValue: string) => {
    setNextValue(nextValue);
    onSelect?.(nextValue);
    setIsOpen(false);
    setActiveIndex(-1);
  };

  const isLoading = loading || isFetching;
  const showDropdown = isOpen && (isLoading || suggestions.length > 0 || Boolean(displayValue.trim()));

  return (
    <div className="relative mt-1">
      <input
        ref={inputRef}
        id={inputId}
        name={name}
        autoComplete="off"
        required={required || isRequired}
        disabled={disabled}
        value={displayValue}
        aria-invalid={error ? 'true' : 'false'}
        aria-expanded={showDropdown}
        aria-controls={`${inputId}-suggestions`}
        onFocus={() => {
          setIsOpen(true);
          updateDropdownPosition();
        }}
        onBlur={() => {
          window.setTimeout(() => {
            setIsOpen(false);
            setActiveIndex(-1);
          }, 120);
        }}
        onChange={(event) => {
          setNextValue(event.target.value);
          setIsOpen(true);
          setActiveIndex(-1);
        }}
        onKeyDown={(event) => {
          if (event.key === 'Escape') {
            setIsOpen(false);
            setActiveIndex(-1);
            return;
          }

          if (!showDropdown || isLoading || suggestions.length === 0) {
            return;
          }

          if (event.key === 'ArrowDown') {
            event.preventDefault();
            setActiveIndex((current) => Math.min(suggestions.length - 1, current + 1));
          }

          if (event.key === 'ArrowUp') {
            event.preventDefault();
            setActiveIndex((current) => Math.max(0, current - 1));
          }

          if (event.key === 'Enter' && activeIndex >= 0) {
            event.preventDefault();
            selectSuggestion(suggestions[activeIndex]);
          }
        }}
        placeholder={placeholder}
        className={className ?? recruiterInputClassName}
      />

      {showDropdown && position
        ? createPortal(
            <div
              id={`${inputId}-suggestions`}
              className={`fixed z-[120] max-h-52 overflow-auto rounded-xl border border-zinc-200 bg-white p-1 shadow-2xl dark:border-zinc-800 dark:bg-zinc-950 ${
                position.openUpward ? '-translate-y-full' : ''
              }`}
              style={{
                top: position.top,
                left: position.left,
                width: position.width,
              }}
            >
              {isLoading ? (
                <div className="px-3 py-2 text-sm text-zinc-500 dark:text-zinc-400">Loading suggestions...</div>
              ) : suggestions.length > 0 ? (
                <ul>
                  {suggestions.map((suggestion, index) => (
                    <li key={suggestion}>
                      <button
                        type="button"
                        className={`w-full rounded-lg px-3 py-2 text-left text-sm transition ${
                          index === activeIndex
                            ? 'bg-zinc-100 text-zinc-900 dark:bg-zinc-800 dark:text-zinc-100'
                            : 'text-zinc-700 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800'
                        }`}
                        onMouseDown={(event) => event.preventDefault()}
                        onClick={() => selectSuggestion(suggestion)}
                      >
                        {suggestion}
                      </button>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="px-3 py-2 text-sm text-zinc-500 dark:text-zinc-400">{emptyState}</div>
              )}
            </div>,
            document.body,
          )
        : null}
    </div>
  );
};
