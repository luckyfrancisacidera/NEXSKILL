type SearchFieldProps = {
  id?: string;
  ariaLabel: string;
  className?: string;
  defaultValue?: string;
  onChange?: (value: string) => void;
  placeholder: string;
  value?: string;
};

export const SearchField = ({
  id,
  ariaLabel,
  className,
  defaultValue,
  onChange,
  placeholder,
  value,
}: SearchFieldProps) => (
  <input
    id={id}
    aria-label={ariaLabel}
    className={
      className ??
      "h-11 w-full rounded-xl border border-zinc-300 bg-white px-3.5 text-sm text-zinc-700 shadow-sm outline-none transition placeholder:text-zinc-400 hover:border-zinc-400 focus:border-violet-500 focus:ring-4 focus:ring-violet-100 dark:bg-zinc-800 dark:border-zinc-600 dark:text-zinc-100 dark:placeholder:text-zinc-500 dark:hover:border-zinc-500 dark:focus:border-violet-400 dark:focus:ring-violet-900"
    }
    defaultValue={defaultValue}
    placeholder={placeholder}
    value={value}
    onChange={onChange ? (event) => onChange(event.target.value) : undefined}
  />
);
