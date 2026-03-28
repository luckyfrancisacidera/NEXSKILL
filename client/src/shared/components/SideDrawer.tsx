/* eslint-disable react-hooks/set-state-in-effect */
import { useEffect, useState, type PropsWithChildren } from "react";
import { X } from "lucide-react";
import { cn } from "@shared/utils/cn";

interface SideDrawerProps extends PropsWithChildren {
  open: boolean;
  title: string;
  description?: string;
  onClose: () => void;
  side?: "left" | "right";
  widthClassName?: string;
  contentClassName?: string;
  closeOnBackdrop?: boolean;
}

export const SideDrawer = ({
  open,
  title,
  description,
  onClose,
  side = "right",
  widthClassName,
  contentClassName,
  closeOnBackdrop = true,
  children,
}: SideDrawerProps) => {
  const [isMounted, setIsMounted] = useState(open);
  const [isVisible, setIsVisible] = useState(open);

  useEffect(() => {
    if (open) {
      setIsMounted(true);
      const frame = requestAnimationFrame(() => setIsVisible(true));
      return () => cancelAnimationFrame(frame);
    }

    setIsVisible(false);
    const timeout = window.setTimeout(() => setIsMounted(false), 220);
    return () => window.clearTimeout(timeout);
  }, [open]);

  useEffect(() => {
    if (!open) {
      return;
    }

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [onClose, open]);

  useEffect(() => {
    if (!open) {
      return;
    }

    const { body, documentElement } = document;
    const previousOverflow = body.style.overflow;
    const previousPaddingRight = body.style.paddingRight;
    const scrollbarWidth = window.innerWidth - documentElement.clientWidth;

    body.style.overflow = "hidden";
    if (scrollbarWidth > 0) {
      body.style.paddingRight = `${scrollbarWidth}px`;
    }

    return () => {
      body.style.overflow = previousOverflow;
      body.style.paddingRight = previousPaddingRight;
    };
  }, [open]);

  if (!isMounted) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-[70]">
      <button
        type="button"
        aria-label="Close drawer"
        className={cn(
          "absolute inset-0 bg-zinc-950/45 backdrop-blur-[2px] transition-opacity duration-200",
          isVisible ? "opacity-100" : "opacity-0",
        )}
        onClick={closeOnBackdrop ? onClose : undefined}
      />

      <aside
        aria-modal="true"
        role="dialog"
        className={cn(
          "absolute top-0 flex h-full w-full max-w-full flex-col bg-white font-inter shadow-2xl transition-transform duration-200 dark:bg-zinc-950 sm:max-w-[92vw]",
          side === "right"
            ? "right-0 border-l border-zinc-200 dark:border-zinc-800"
            : "left-0 border-r border-zinc-200 dark:border-zinc-800",
          widthClassName ?? "sm:max-w-[460px]",
          isVisible
            ? "translate-x-0"
            : side === "right"
              ? "translate-x-full"
              : "-translate-x-full",
        )}
      >
        <div className="flex items-start justify-between gap-4 border-b border-zinc-200 px-4 py-4 dark:border-zinc-800 sm:px-5">
          <div className="space-y-1">
            <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
              {title}
            </h2>
            {description ? (
              <p className="text-sm text-zinc-500 dark:text-zinc-400">
                {description}
              </p>
            ) : null}
          </div>
          <button
            type="button"
            aria-label="Close drawer"
            className="inline-flex h-9 w-9 items-center justify-center border border-zinc-200 text-zinc-600 transition hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-900"
            onClick={onClose}
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className={cn("flex-1 overflow-y-auto px-4 py-4 sm:px-5 sm:py-5", contentClassName)}>
          {children}
        </div>
      </aside>
    </div>
  );
};
