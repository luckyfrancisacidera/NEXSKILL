import { useId, useMemo, useState } from 'react';

import { recruiterInputClassName } from '@features/recruiter/components/recruiterForm.shared';

export interface PredictiveInputProps {
  name: string;
  placeholder: string;
  options: string[];
  defaultValue: string;
  isRequired?: boolean;
}

/**
 * Lightweight predictive input for common recruiter text fields.
 */
export const PredictiveInput = ({ name, placeholder, options, defaultValue, isRequired = false }: PredictiveInputProps) => {
  const inputId = useId();
  const [value, setValue] = useState(defaultValue);
  const [isOpen, setIsOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);

  const suggestions = useMemo(() => {
    const normalized = value.trim().toLowerCase();
    if (!normalized) {
      return options;
    }

    return options.filter((option) => option.toLowerCase().includes(normalized));
  }, [options, value]);

  const selectSuggestion = (nextValue: string) => {
    setValue(nextValue);
    setIsOpen(false);
    setActiveIndex(-1);
  };

  return (
    <div className="relative mt-1">
      <input
        id={inputId}
        name={name}
        autoComplete="off"
        required={isRequired}
        value={value}
        onFocus={() => setIsOpen(true)}
        onBlur={() => {
          window.setTimeout(() => setIsOpen(false), 120);
        }}
        onChange={(event) => {
          setValue(event.target.value);
          setIsOpen(true);
          setActiveIndex(-1);
        }}
        onKeyDown={(event) => {
          if (!isOpen || suggestions.length === 0) {
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
        className={recruiterInputClassName}
      />

      {isOpen && suggestions.length > 0 ? (
        <ul className="absolute z-20 mt-1 max-h-52 w-full overflow-auto rounded-xl border border-zinc-200 bg-white p-1 shadow-xl">
          {suggestions.map((suggestion, index) => (
            <li key={suggestion}>
              <button
                type="button"
                className={`w-full rounded-lg px-3 py-2 text-left text-sm ${
                  index === activeIndex ? 'bg-violet-100 text-violet-800' : 'text-zinc-700 hover:bg-zinc-100'
                }`}
                onMouseDown={(event) => event.preventDefault()}
                onClick={() => selectSuggestion(suggestion)}
              >
                {suggestion}
              </button>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
};

