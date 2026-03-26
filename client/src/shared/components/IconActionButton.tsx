import type { ButtonHTMLAttributes, ReactNode } from "react";

import { cn } from "@shared/utils/cn";

type IconActionButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  icon: ReactNode;
  label: string;
  variant?: "neutral" | "danger";
};

export const iconActionButtonClassName = (variant: "neutral" | "danger" = "neutral") =>
  cn(
    "inline-flex h-9 w-9 items-center justify-center rounded-xl border transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-500 disabled:cursor-not-allowed disabled:opacity-50",
    variant === "danger"
      ? "border-red-900/60 bg-red-950/20 text-red-300 hover:bg-red-950/35 dark:border-red-900/60 dark:bg-red-950/20 dark:text-red-300 dark:hover:bg-red-950/35"
      : "border-zinc-700 bg-zinc-800/70 text-zinc-200 hover:bg-zinc-700/80 dark:border-zinc-700 dark:bg-zinc-900/70 dark:text-zinc-200 dark:hover:bg-zinc-800",
  );

export const IconActionButton = ({
  icon,
  label,
  variant = "neutral",
  className,
  type = "button",
  ...props
}: IconActionButtonProps) => (
  <button
    type={type}
    title={label}
    aria-label={label}
    className={cn(iconActionButtonClassName(variant), className)}
    {...props}
  >
    {icon}
    <span className="sr-only">{label}</span>
  </button>
);
