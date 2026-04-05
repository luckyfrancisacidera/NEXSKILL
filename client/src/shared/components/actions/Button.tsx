/* =========================================
   SHARED BUTTON
========================================= */

import type { ButtonHTMLAttributes, PropsWithChildren } from "react";
import { LoaderCircle } from "lucide-react";
import { cn } from "@shared/utils/cn";

export type ButtonProps = PropsWithChildren<ButtonHTMLAttributes<HTMLButtonElement>> & {
  variant?: "primary" | "secondary";
  loading?: boolean;
  loadingText?: string;
};

export const Button = ({
  children,
  className,
  variant = "primary",
  loading = false,
  loadingText,
  disabled,
  ...props
}: ButtonProps) => (
  <button
    className={cn(
      "relative inline-flex min-h-[2.125rem] items-center justify-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-500 disabled:cursor-not-allowed disabled:opacity-60 sm:min-h-9 sm:px-3.5 sm:py-2 sm:text-sm",
      variant === "primary"
        ? "bg-zinc-900 text-zinc-50 hover:bg-zinc-700 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
        : "border border-zinc-200 bg-white text-zinc-800 hover:bg-zinc-100 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200 dark:hover:bg-zinc-800",
      className,
    )}
    disabled={disabled || loading}
    aria-busy={loading}
    {...props}
  >
    <span className={cn("inline-flex items-center justify-center gap-2", loading && "opacity-0")}>
      {children}
    </span>
    {loading ? (
      <span className="absolute inset-0 inline-flex items-center justify-center gap-2">
        <LoaderCircle className="h-3.5 w-3.5 animate-spin sm:h-4 sm:w-4" />
        {loadingText ? <span>{loadingText}</span> : null}
      </span>
    ) : null}
  </button>
);
