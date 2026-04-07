import { useRef } from "react";
import { AlertCircle, FileCheck2, Upload, X } from "lucide-react";
import type { ReactNode } from "react";

type FieldProps = {
  label: string;
  error?: string;
  required?: boolean;
  children: ReactNode;
  hint?: string;
  wrapperClassName?: string;
};

export const FieldWrapper = ({
  label,
  error,
  required,
  children,
  hint,
  wrapperClassName = "",
}: FieldProps) => (
  <div className={`flex flex-col gap-1.5 ${wrapperClassName}`}>
    <label className="text-sm font-medium text-zinc-700 dark:text-zinc-200">
      {label}
      {required ? <span className="ml-0.5 text-red-500">*</span> : null}
    </label>
    {children}
    {hint && !error ? <p className="text-xs text-zinc-400 dark:text-zinc-500">{hint}</p> : null}
    {error ? (
      <div className="flex items-center gap-1.5">
        <AlertCircle size={13} className="flex-shrink-0 text-red-500" />
        <p className="text-xs text-red-500">{error}</p>
      </div>
    ) : null}
  </div>
);

type InputProps = React.InputHTMLAttributes<HTMLInputElement> & {
  error?: boolean;
  icon?: ReactNode;
  rightEl?: ReactNode;
};

export const TextInput = ({
  error,
  icon,
  rightEl,
  className = "",
  ...props
}: InputProps) => (
  <div className="relative">
    {icon ? <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 dark:text-zinc-500">{icon}</span> : null}
    <input
      {...props}
      className={`h-11 w-full rounded-xl border bg-white px-3 text-sm text-zinc-800 placeholder:text-zinc-400 outline-none transition-all dark:bg-zinc-950 dark:text-zinc-100 dark:placeholder:text-zinc-500 ${
        icon ? "pl-9" : "pl-3"
      } ${rightEl ? "pr-10" : "pr-3"} ${
        error
          ? "border-red-400 focus:border-red-500 focus:ring-2 focus:ring-red-100 dark:focus:ring-red-950"
          : "border-zinc-200 focus:border-zinc-500 focus:ring-2 focus:ring-zinc-100 dark:border-white/10 dark:focus:border-zinc-400 dark:focus:ring-zinc-900"
      } ${className}`}
    />
    {rightEl ? <span className="absolute right-3 top-1/2 -translate-y-1/2">{rightEl}</span> : null}
  </div>
);

type SelectProps = React.SelectHTMLAttributes<HTMLSelectElement> & {
  error?: boolean;
  placeholder?: string;
};

export const SelectInput = ({
  error,
  placeholder,
  children,
  className = "",
  ...props
}: SelectProps) => (
  <select
    {...props}
    className={`h-11 w-full cursor-pointer appearance-none rounded-xl border bg-white px-3 text-sm text-zinc-800 outline-none transition-all dark:bg-zinc-950 dark:text-zinc-100 ${
      error
        ? "border-red-400 focus:border-red-500 focus:ring-2 focus:ring-red-100 dark:focus:ring-red-950"
        : "border-zinc-200 focus:border-zinc-500 focus:ring-2 focus:ring-zinc-100 dark:border-white/10 dark:focus:border-zinc-400 dark:focus:ring-zinc-900"
    } ${className}`}
  >
    {placeholder ? <option value="">{placeholder}</option> : null}
    {children}
  </select>
);

type TextareaProps = React.TextareaHTMLAttributes<HTMLTextAreaElement> & {
  error?: boolean;
};

export const TextareaInput = ({
  error,
  className = "",
  ...props
}: TextareaProps) => (
  <textarea
    {...props}
    className={`w-full resize-none rounded-xl border bg-white px-3 py-3 text-sm text-zinc-800 placeholder:text-zinc-400 outline-none transition-all dark:bg-zinc-950 dark:text-zinc-100 dark:placeholder:text-zinc-500 ${
      error
        ? "border-red-400 focus:border-red-500 focus:ring-2 focus:ring-red-100 dark:focus:ring-red-950"
        : "border-zinc-200 focus:border-zinc-500 focus:ring-2 focus:ring-zinc-100 dark:border-white/10 dark:focus:border-zinc-400 dark:focus:ring-zinc-900"
    } ${className}`}
  />
);

type FileUploadProps = {
  label: string;
  file: File | null;
  onFile: (file: File | null) => void;
  error?: string;
  accept?: string;
  hint?: string;
};

export const FileUploadField = ({
  label,
  file,
  onFile,
  error,
  accept = ".pdf,.jpg,.jpeg,.png",
  hint,
}: FileUploadProps) => {
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <FieldWrapper label={label} error={error} required hint={hint}>
      <div
        onDragOver={(event) => event.preventDefault()}
        onDrop={(event) => {
          event.preventDefault();
          const nextFile = event.dataTransfer.files[0];
          if (nextFile) {
            onFile(nextFile);
          }
        }}
        onClick={() => {
          if (!file) {
            inputRef.current?.click();
          }
        }}
        className={`relative cursor-pointer rounded-xl border-2 border-dashed transition-all ${
          error
            ? "border-red-300 bg-red-50 dark:bg-red-950/20"
            : "border-zinc-200 bg-zinc-50 hover:border-zinc-400 hover:bg-white dark:border-white/10 dark:bg-zinc-900 dark:hover:bg-zinc-950"
        }`}
      >
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          className="hidden"
          onChange={(event) => {
            const nextFile = event.target.files?.[0];
            if (nextFile) {
              onFile(nextFile);
            }
          }}
        />

        {file ? (
          <div className="flex items-center justify-between px-4 py-3.5">
            <div className="flex min-w-0 items-center gap-2.5">
              <FileCheck2 size={18} className="flex-shrink-0 text-zinc-600 dark:text-zinc-300" />
              <span className="truncate text-sm font-medium text-zinc-700 dark:text-zinc-100">{file.name}</span>
              <span className="flex-shrink-0 text-xs text-zinc-400 dark:text-zinc-500">({(file.size / 1024).toFixed(1)} KB)</span>
            </div>
            <button
              type="button"
              onClick={(event) => {
                event.stopPropagation();
                onFile(null);
                if (inputRef.current) {
                  inputRef.current.value = "";
                }
              }}
              className="ml-2 flex-shrink-0 rounded-lg p-1 text-zinc-400 transition-colors hover:bg-zinc-200 hover:text-zinc-700 dark:hover:bg-white/10 dark:hover:text-zinc-100"
            >
              <X size={15} />
            </button>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2 px-4 py-6 text-center">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-zinc-200 text-zinc-500 dark:bg-white/10 dark:text-zinc-300">
              <Upload size={18} />
            </div>
            <div>
              <p className="text-sm font-medium text-zinc-600 dark:text-zinc-200">Click to upload or drag and drop</p>
              <p className="mt-0.5 text-xs text-zinc-400 dark:text-zinc-500">PDF, JPG, PNG up to 10MB</p>
            </div>
          </div>
        )}
      </div>
    </FieldWrapper>
  );
};
