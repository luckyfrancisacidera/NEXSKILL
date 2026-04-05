/* =========================================
   SHARED ACTION BUTTON
========================================= */

/* eslint-disable react-refresh/only-export-components */
import type { ButtonHTMLAttributes, ReactNode } from "react";
import { LoaderCircle } from "lucide-react";
import { cn } from "@shared/utils/cn";

export interface ActionButtonClassNameOptions {
  destructive?: boolean;
  iconOnly?: boolean;
  fullWidth?: boolean;
}

export interface ActionButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement>,
    ActionButtonClassNameOptions {
  icon?: ReactNode;
  label?: string;
  loading?: boolean;
  loadingLabel?: string;
}

const neutralBaseClassName =
  "inline-flex min-h-8 items-center justify-center gap-1.5 rounded-lg border border-zinc-700 bg-zinc-800 px-2.5 py-1.5 text-xs font-medium text-zinc-100 shadow-sm transition hover:border-zinc-600 hover:bg-zinc-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-500 disabled:cursor-not-allowed disabled:opacity-50 sm:min-h-[2.125rem] sm:px-3 sm:py-2 sm:text-sm";

const destructiveClassName =
  "border-rose-700 bg-rose-100 text-rose-500 hover:border-rose-600 hover:bg-rose-400/70 focus-visible:ring-rose-500 dark:bg-rose-950/60 dark:text-rose-200";

export const actionButtonClassName = ({
  destructive = false,
  iconOnly = false,
  fullWidth = false,
}: ActionButtonClassNameOptions = {}) =>
  cn(
    neutralBaseClassName,
    destructive && destructiveClassName,
    iconOnly && "h-8 w-8 px-0 sm:h-9 sm:w-9",
    fullWidth && "flex w-full px-3 py-2 text-sm font-semibold sm:px-4 sm:py-2.5",
  );

export const ActionButton = ({
  icon,
  label,
  children,
  destructive = false,
  iconOnly = false,
  fullWidth = false,
  className,
  title,
  type = "button",
  loading = false,
  loadingLabel,
  disabled,
  ...props
}: ActionButtonProps) => {
  if (iconOnly && !label) {
    throw new Error("ActionButton requires `label` when `iconOnly` is true.");
  }

  const accessibleLabel = label ?? (typeof children === "string" ? children : undefined);

  return (
    <button
      type={type}
      className={cn(
        "relative",
        actionButtonClassName({ destructive, iconOnly, fullWidth }),
        className,
      )}
      aria-label={iconOnly ? accessibleLabel : props["aria-label"]}
      title={title ?? accessibleLabel}
      disabled={disabled || loading}
      aria-busy={loading}
      {...props}
    >
      <span className={cn("inline-flex items-center justify-center gap-2", loading && "opacity-0")}>
        {icon}
        {iconOnly ? <span className="sr-only">{accessibleLabel}</span> : children}
      </span>
      {loading ? (
        <span className="absolute inset-0 inline-flex items-center justify-center gap-2">
          <LoaderCircle className="h-3.5 w-3.5 animate-spin sm:h-4 sm:w-4" />
          {!iconOnly ? <span>{loadingLabel ?? accessibleLabel ?? "Loading"}</span> : null}
        </span>
      ) : null}
    </button>
  );
};
