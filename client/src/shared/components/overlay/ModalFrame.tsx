/* =========================================
   SHARED MODAL FRAME
========================================= */

import type { ReactNode } from "react";
import { X } from "lucide-react";
import { cn } from "@shared/utils/cn";
import { ModalOverlay } from "@shared/components/overlay/ModalOverlay";

interface ModalFrameProps {
  onClose: () => void;
  children: ReactNode;
  headerContent?: ReactNode;
  footer?: ReactNode;
  containerClassName?: string;
  contentClassName?: string;
  bodyClassName?: string;
  footerClassName?: string;
  showCloseButton?: boolean;
  closeLabel?: string;
}

export const ModalFrame = ({
  onClose,
  children,
  headerContent,
  footer,
  containerClassName = "max-w-lg",
  contentClassName,
  bodyClassName,
  footerClassName,
  showCloseButton = false,
  closeLabel = "Close modal",
}: ModalFrameProps) => (
  <ModalOverlay onClose={onClose} containerClassName={containerClassName}>
    <div
      className={cn(
        "scrollbar-thin-stable flex max-h-[90vh] w-full flex-col overflow-y-auto overflow-x-hidden rounded-[28px] border border-zinc-200 bg-white shadow-2xl dark:border-zinc-800 dark:bg-zinc-900",
        contentClassName,
      )}
      role="dialog"
      aria-modal="true"
    >
      {headerContent ? (
        <div className="border-b border-zinc-200 bg-white/95 px-4 py-4 backdrop-blur dark:border-zinc-800 dark:bg-zinc-900/95 sm:px-5 sm:py-5">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0 flex-1">{headerContent}</div>
            {showCloseButton ? (
              <button
                type="button"
                aria-label={closeLabel}
                onClick={onClose}
                className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border border-zinc-200 bg-white text-zinc-600 transition hover:bg-zinc-100 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800"
              >
                <X className="h-4 w-4" />
              </button>
            ) : null}
          </div>
        </div>
      ) : null}

      <div className={cn("px-4 py-4 sm:px-5 sm:py-5", bodyClassName)}>
        {children}
      </div>

      {footer ? (
        <div
          className={cn(
            "border-t border-zinc-200 bg-white/95 px-4 py-4 backdrop-blur dark:border-zinc-700 dark:bg-zinc-900/95 sm:px-5",
            footerClassName,
          )}
        >
          {footer}
        </div>
      ) : null}
    </div>
  </ModalOverlay>
);

