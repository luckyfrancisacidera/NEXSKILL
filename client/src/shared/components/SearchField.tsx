type SearchFieldProps = {
  label: string;
  name: string;
  defaultValue?: string;
  placeholder?: string;
  className?: string;
};

export default function SearchField({
  label,
  name,
  defaultValue,
  placeholder,
  className = "",
}: SearchFieldProps) {
  return (
    <div className={className}>
      <label className="mb-1.5 block text-xs font-medium text-zinc-600 dark:text-zinc-400">
        {label}
      </label>

      <input
        aria-label={name}
        name={name}
        defaultValue={defaultValue}
        placeholder={placeholder}
        className="h-11 w-full rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-3.5 text-sm text-zinc-700 dark:text-zinc-100 shadow-sm outline-none transition placeholder:text-zinc-400 dark:placeholder:text-zinc-600 hover:border-zinc-400 dark:hover:border-zinc-600 focus:border-violet-500 dark:focus:border-violet-600 focus:ring-4 focus:ring-violet-100 dark:focus:ring-violet-900"
      />
    </div>
  );
}