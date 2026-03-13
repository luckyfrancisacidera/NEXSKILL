import { Eye, EyeOff } from "lucide-react";

interface AdminPasswordFieldProps {
  label: string;
  value: string;
  placeholder?: string;
  error?: string;
  visible: boolean;
  ariaLabel: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
  onToggleVisibility: () => void;
}

const inputClassName =
  "mt-2 w-full rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-3 pr-12 text-sm text-zinc-900 outline-none transition focus:border-zinc-400 focus:bg-white";

export const AdminPasswordField = ({
  label,
  value,
  placeholder,
  error,
  visible,
  ariaLabel,
  onChange,
  onBlur,
  onToggleVisibility,
}: AdminPasswordFieldProps) => {
  const VisibilityIcon = visible ? EyeOff : Eye;

  return (
    <label className="block text-sm font-medium text-zinc-700">
      {label}
      <div className="relative mt-2">
        <input
          type={visible ? "text" : "password"}
          className={inputClassName}
          value={value}
          placeholder={placeholder}
          onChange={(event) => onChange(event.target.value)}
          onBlur={onBlur}
          required
        />
        <button
          type="button"
          aria-label={ariaLabel}
          onClick={onToggleVisibility}
          className="absolute inset-y-0 right-3 inline-flex items-center justify-center text-zinc-500 transition hover:text-zinc-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-400"
        >
          <VisibilityIcon className="h-4 w-4" />
        </button>
      </div>
      {error ? <p className="mt-1 text-xs text-rose-600">{error}</p> : null}
    </label>
  );
};
