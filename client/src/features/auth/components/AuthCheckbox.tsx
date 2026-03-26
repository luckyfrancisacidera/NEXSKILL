import type { InputHTMLAttributes, ReactNode } from "react";
import { Check } from "lucide-react";

import { cn } from "@shared/utils/cn";

type AuthCheckboxProps = Omit<
  InputHTMLAttributes<HTMLInputElement>,
  "type" | "children"
> & {
  label: ReactNode;
  boxClassName?: string;
  labelClickable?: boolean;
};

export const AuthCheckbox = ({
  id,
  label,
  className,
  boxClassName,
  labelClickable = true,
  ...props
}: AuthCheckboxProps) => (
  <div
    className={cn(
      "group inline-flex items-start gap-3 text-sm text-zinc-300",
      className,
    )}
  >
    <label htmlFor={id} className="relative mt-0.5 inline-flex shrink-0 cursor-pointer">
      <input
        id={id}
        type="checkbox"
        className="peer sr-only"
        {...props}
      />
      <span
        aria-hidden="true"
        className={cn(
          "inline-flex h-5 w-5 items-center justify-center rounded-md border border-zinc-500 bg-zinc-900/70 text-transparent shadow-sm transition-all duration-200 group-hover:border-zinc-300 peer-checked:border-white peer-checked:bg-white peer-checked:text-zinc-900 peer-focus-visible:outline-none peer-focus-visible:ring-2 peer-focus-visible:ring-white peer-focus-visible:ring-offset-2 peer-focus-visible:ring-offset-zinc-800",
          boxClassName,
        )}
      >
          <Check className="h-3.5 w-3.5 stroke-3" />
        </span>
    </label>
    {labelClickable ? (
      <label htmlFor={id} className="cursor-pointer leading-6">
        {label}
      </label>
    ) : (
      <span className="leading-6">{label}</span>
    )}
  </div>
);
