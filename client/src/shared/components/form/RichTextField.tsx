import { RichTextEditor } from "@shared/components/form/RichTextEditor";
import { sanitizeRichText } from "@shared/utils/richText";

interface RichTextFieldProps {
  id?: string;
  label: string;
  name?: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  helperText?: string;
  error?: string;
  required?: boolean;
  minHeightClassName?: string;
}

export const RichTextField = ({
  id,
  label,
  name,
  value,
  onChange,
  placeholder,
  helperText,
  error,
  required = false,
  minHeightClassName,
}: RichTextFieldProps) => {
  const fieldId =
    id ??
    name ??
    `rich-text-${label.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "")}`;
  const helperId = helperText ? `${fieldId}-helper` : undefined;
  const errorId = error ? `${fieldId}-error` : undefined;
  const describedBy = [helperId, errorId].filter(Boolean).join(" ") || undefined;

  return (
    <div className="w-full min-w-0 max-w-full">
      <label htmlFor={fieldId} className="mb-1.5 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
        {label}
        {required ? " *" : ""}
      </label>
      {helperText ? (
        <p id={helperId} className="mb-2 text-xs text-zinc-500 dark:text-zinc-400">{helperText}</p>
      ) : null}
      <RichTextEditor
        id={fieldId}
        label={label}
        describedBy={describedBy}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        error={error}
        minHeightClassName={minHeightClassName}
      />
      {error ? <p id={errorId} className="sr-only">{error}</p> : null}
      {name ? <input id={`${fieldId}-value`} type="hidden" name={name} value={sanitizeRichText(value)} /> : null}
    </div>
  );
};

