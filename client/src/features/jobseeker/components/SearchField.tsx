type SearchFieldProps = {
  ariaLabel: string;
  className?: string;
  defaultValue?: string;
  onChange?: (value: string) => void;
  placeholder: string;
  value?: string;
};

export const SearchField = ({
  ariaLabel,
  className,
  defaultValue,
  onChange,
  placeholder,
  value,
}: SearchFieldProps) => (
  <input
    aria-label={ariaLabel}
    className={
      className ??
      "h-11 w-full rounded-xl border border-zinc-300 bg-white px-3.5 text-sm text-zinc-700 shadow-sm outline-none transition placeholder:text-zinc-400 hover:border-zinc-400 focus:border-violet-500 focus:ring-4 focus:ring-violet-100"
    }
    defaultValue={defaultValue}
    placeholder={placeholder}
    value={value}
    onChange={onChange ? (event) => onChange(event.target.value) : undefined}
  />
);
