import { useEffect, useRef, useState } from "react";
import { ChevronDown, Check } from "lucide-react";

export type DropdownOption = {
  value: string;
  label: string;
  count?: number;
  accentClassName?: string;
};

type DropdownProps = {
  label: string;
  name: string;
  value: string;
  options: DropdownOption[];
  onChange?: (e: { target: { name: string; value: string } }) => void;
  className?: string;
  buttonClassName?: string;
};

export default function Dropdown({
  label,
  name,
  value,
  options,
  onChange,
  className = "",
  buttonClassName = "",
}: DropdownProps) {
  const [open, setOpen] = useState(false);
  const [currentValue, setCurrentValue] = useState(value);
  const dropdownRef = useRef<HTMLDivElement | null>(null);

  const selectedOption =
    options.find((option) => option.value === currentValue) ?? options[0];

  useEffect(() => {
    setCurrentValue(value);
  }, [value]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, []);

  const handleSelect = (nextValue: string) => {
    setOpen(false);
    setCurrentValue(nextValue);
    onChange?.({
      target: {
        name,
        value: nextValue,
      },
    });
  };

  return (
    <div className={className} ref={dropdownRef}>
      <label className="mb-1.5 block text-xs font-medium text-zinc-600">
        {label}
      </label>

      <div className="relative">
        <input type="hidden" name={name} value={currentValue} />

        <button
          type="button"
          onClick={() => setOpen((prev) => !prev)}
          className={`flex h-11 w-full items-center justify-between rounded-xl border border-zinc-300 bg-white px-3.5 text-sm text-zinc-700 shadow-sm outline-none transition hover:border-zinc-400 focus:border-violet-500 focus:ring-4 focus:ring-violet-100 ${buttonClassName}`}
        >
          <div className="flex min-w-0 items-center gap-2">
            <span className="truncate">{selectedOption?.label}</span>

            {typeof selectedOption?.count === "number" ? (
              <span
                className={`flex h-6 min-w-6 items-center justify-center rounded-full px-2 text-xs font-semibold ${
                  selectedOption.accentClassName ??
                  "bg-zinc-100 text-zinc-700"
                }`}
              >
                {selectedOption.count}
              </span>
            ) : null}
          </div>

          <ChevronDown
            className={`ml-3 h-4 w-4 shrink-0 text-zinc-500 transition-transform ${
              open ? "rotate-180" : ""
            }`}
          />
        </button>

        {open && (
          <div className="absolute z-50 mt-2 max-h-80 w-full overflow-y-auto rounded-2xl border border-zinc-200 bg-white p-1.5 shadow-xl">
            {options.map((option) => {
              const isSelected = option.value === currentValue;

              return (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => handleSelect(option.value)}
                  className={`flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-left text-sm transition ${
                    isSelected
                      ? "bg-violet-50 text-violet-700"
                      : "text-zinc-700 hover:bg-zinc-50"
                  }`}
                >
                  <div className="flex min-w-0 items-center gap-2">
                    <span className="truncate">{option.label}</span>

                    {typeof option.count === "number" ? (
                      <span
                        className={`flex h-6 min-w-6 items-center justify-center rounded-full px-2 text-xs font-semibold ${
                          option.accentClassName ?? "bg-zinc-100 text-zinc-700"
                        }`}
                      >
                        {option.count}
                      </span>
                    ) : null}
                  </div>

                  {isSelected ? (
                    <Check className="ml-2 h-4 w-4 shrink-0" />
                  ) : null}
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}