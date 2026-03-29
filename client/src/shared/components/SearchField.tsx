type SearchFieldProps = {
  label: string;
  name: string;
  defaultValue?: string;
  placeholder?: string;
  className?: string;
  compactOnMobile?: boolean;
};

export default function SearchField({
  label,
  name,
  defaultValue,
  placeholder,
  className = "",
  compactOnMobile = true,
}: SearchFieldProps) {
  return (
    <div className={`w-full min-w-0 ${className}`}>
      <label className="mb-1.5 block text-xs font-medium text-zinc-600 dark:text-zinc-400">
        {label}
      </label>

      <input
        aria-label={name}
        name={name}
        defaultValue={defaultValue}
        placeholder={placeholder}
        className={`w-full rounded-xl border border-zinc-300 bg-white px-3 text-zinc-700 shadow-sm outline-none transition placeholder:text-zinc-400 hover:border-zinc-400 focus:border-violet-500 focus:ring-4 focus:ring-violet-100 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 dark:placeholder:text-zinc-600 dark:hover:border-zinc-600 dark:focus:border-violet-600 dark:focus:ring-violet-900 ${
          compactOnMobile ? "h-10 text-[13px] sm:h-11 sm:px-3.5 sm:text-sm" : "h-11 px-3.5 text-sm"
        }`}
      />
    </div>
  );
}
