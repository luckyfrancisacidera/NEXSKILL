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
      <label className="mb-1.5 block text-xs font-medium text-zinc-600">
        {label}
      </label>

      <input
        aria-label={name}
        name={name}
        defaultValue={defaultValue}
        placeholder={placeholder}
        className="h-11 w-full rounded-xl border border-zinc-300 bg-white px-3.5 text-sm text-zinc-700 shadow-sm outline-none transition placeholder:text-zinc-400 hover:border-zinc-400 focus:border-violet-500 focus:ring-4 focus:ring-violet-100"
      />
    </div>
  );
}