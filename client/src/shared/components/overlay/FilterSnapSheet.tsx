/* eslint-disable react-hooks/set-state-in-effect */
import { useEffect, useRef, useState, type ReactNode } from "react";
import { ChevronUp, X } from "lucide-react";
import { cn } from "@shared/utils/cn";

interface FilterSnapSheetProps {
  id?: string;
  title?: string;
  description?: string;
  isOpen: boolean;
  children: ReactNode;
  footer?: ReactNode;
  panelClassName?: string;
  contentClassName?: string;
  mobilePresentation?: "drawer" | "sheet";
  sheetDefaultHeightClassName?: string;
  sheetExpandedHeightClassName?: string;
  onClose: () => void;
}

const transitionClassName =
  "transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]";

const focusableSelector =
  'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])';

export const FilterSnapSheet = ({
  id = "mobile-filter-snap-sheet",
  title = "Filters",
  description = "Adjust the view, then apply when you're ready.",
  isOpen,
  children,
  footer,
  panelClassName,
  contentClassName,
  sheetDefaultHeightClassName = "h-[60vh]",
  sheetExpandedHeightClassName = "h-[88vh]",
  onClose,
}: FilterSnapSheetProps) => {
  const [isMounted, setIsMounted] = useState(isOpen);
  const [isVisible, setIsVisible] = useState(isOpen);
  const [isExpanded, setIsExpanded] = useState(false);
  const drawerRef = useRef<HTMLDivElement>(null);
  const previousActiveElementRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (isOpen) {
      setIsMounted(true);
      const frame = window.requestAnimationFrame(() => {
        setIsVisible(true);
      });

      return () => window.cancelAnimationFrame(frame);
    }

    setIsVisible(false);
    const timeout = window.setTimeout(() => setIsMounted(false), 320);
    return () => window.clearTimeout(timeout);
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) {
      setIsExpanded(false);
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    previousActiveElementRef.current =
      document.activeElement instanceof HTMLElement ? document.activeElement : null;

    const { body, documentElement } = document;
    const previousOverflow = body.style.overflow;
    const previousPaddingRight = body.style.paddingRight;
    const scrollbarWidth = window.innerWidth - documentElement.clientWidth;

    body.style.overflow = "hidden";
    if (scrollbarWidth > 0) {
      body.style.paddingRight = `${scrollbarWidth}px`;
    }

    const focusFrame = window.requestAnimationFrame(() => {
      const focusableElements =
        drawerRef.current?.querySelectorAll<HTMLElement>(focusableSelector);
      focusableElements?.[0]?.focus();
    });

    return () => {
      window.cancelAnimationFrame(focusFrame);
      body.style.overflow = previousOverflow;
      body.style.paddingRight = previousPaddingRight;
      previousActiveElementRef.current?.focus();
    };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        onClose();
        return;
      }

      if (event.key !== "Tab" || !drawerRef.current) {
        return;
      }

      const focusableElements =
        drawerRef.current.querySelectorAll<HTMLElement>(focusableSelector);
      if (focusableElements.length === 0) {
        return;
      }

      const firstElement = focusableElements[0];
      const lastElement = focusableElements[focusableElements.length - 1];

      if (event.shiftKey && document.activeElement === firstElement) {
        event.preventDefault();
        lastElement.focus();
        return;
      }

      if (!event.shiftKey && document.activeElement === lastElement) {
        event.preventDefault();
        firstElement.focus();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isMounted) {
    return null;
  }

  return (
    <div
      className={cn(
        "fixed inset-0 z-[70] lg:hidden",
        isVisible ? "pointer-events-auto" : "pointer-events-none",
      )}
    >
      <button
        type="button"
        aria-label="Close filters"
        className={cn(
          "absolute inset-0 bg-zinc-950/40 backdrop-blur-sm dark:bg-black/60",
          transitionClassName,
          isVisible
            ? "pointer-events-auto opacity-100"
            : "pointer-events-none opacity-0",
        )}
        onClick={onClose}
      />

      <aside
        id={id}
        ref={drawerRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={`${id}-title`}
        className={cn(
          "fixed inset-x-0 bottom-0 z-[71] flex w-full max-w-full flex-col rounded-t-[28px] border border-zinc-200 bg-white shadow-[0_-18px_50px_rgba(15,23,42,0.16)] dark:border-zinc-800 dark:bg-zinc-950 dark:shadow-[0_-22px_60px_rgba(0,0,0,0.55)]",
          isExpanded ? sheetExpandedHeightClassName : sheetDefaultHeightClassName,
          transitionClassName,
          isVisible ? "translate-y-0 opacity-100" : "translate-y-full opacity-0",
          panelClassName,
        )}
      >
        <button
          type="button"
          aria-label={isExpanded ? "Collapse filter sheet" : "Expand filter sheet"}
          className="flex justify-center pt-3 pb-1.5"
          onClick={() => setIsExpanded((current) => !current)}
        >
          <span className="h-1.5 w-11 rounded-full bg-zinc-300 transition-colors dark:bg-zinc-700" />
        </button>

        <div
          className={cn(
            "flex items-center justify-between gap-3 border-b border-zinc-200 px-4 py-3.5 transition-colors dark:border-zinc-800",
          )}
        >
          <div className="min-w-0 flex-1 space-y-1">
            <div>
              <h2
                id={`${id}-title`}
                className="text-sm font-semibold text-zinc-900 dark:text-zinc-50"
              >
                {title}
              </h2>
              <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
                {description}
              </p>
            </div>
          </div>

          <div className="flex shrink-0 items-center gap-2">
            <button
              type="button"
              aria-label={isExpanded ? "Collapse filter sheet" : "Expand filter sheet"}
              className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-zinc-200 bg-zinc-50 text-zinc-600 transition hover:border-zinc-300 hover:bg-zinc-100 hover:text-zinc-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-400 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:border-zinc-700 dark:hover:bg-zinc-800 dark:hover:text-zinc-100 dark:focus-visible:ring-zinc-600"
              onClick={() => setIsExpanded((current) => !current)}
            >
              <ChevronUp className={cn("h-4 w-4 transition-transform", isExpanded && "rotate-180")} />
            </button>
            <button
              type="button"
              aria-label="Close filters"
              className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-zinc-200 bg-zinc-50 text-zinc-600 transition hover:border-zinc-300 hover:bg-zinc-100 hover:text-zinc-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-400 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:border-zinc-700 dark:hover:bg-zinc-800 dark:hover:text-zinc-100 dark:focus-visible:ring-zinc-600"
              onClick={onClose}
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        <div
          className={cn(
            "flex-1 space-y-3 overflow-y-auto bg-zinc-50/80 px-4 py-4 text-zinc-700 transition-colors dark:bg-zinc-950 dark:text-zinc-200",
            contentClassName,
          )}
        >
          {children}
        </div>

        {footer ? (
          <div
            className={cn(
              "sticky bottom-0 border-t border-zinc-200 bg-white/95 px-4 py-4 pb-[calc(env(safe-area-inset-bottom)+1rem)] backdrop-blur-sm transition-colors dark:border-zinc-800 dark:bg-zinc-950/95",
            )}
          >
            {footer}
          </div>
        ) : null}
      </aside>
    </div>
  );
};
