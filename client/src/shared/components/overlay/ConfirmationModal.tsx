/* =========================================
   SHARED CONFIRMATION MODAL
========================================= */

import type { ReactNode } from "react";
import { AlertTriangle, CheckCircle2, PencilLine } from "lucide-react";
import { Button } from "@shared/components/actions/Button";
import { ModalFrame } from "@shared/components/overlay/ModalFrame";

type ConfirmationAccent = "red" | "green" | "violet";

interface ConfirmationModalProps {
  open: boolean;
  title: string;
  message: string;
  supportingNote?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  accent?: ConfirmationAccent;
  loading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  onClose: () => void;
}

const accentStyles: Record<
  ConfirmationAccent,
  { icon: ReactNode; iconWrap: string; button: string; ring: string }
> = {
  red: {
    icon: <AlertTriangle className="h-5 w-5 text-rose-600" />,
    iconWrap: "bg-rose-100",
    button: "bg-rose-600 hover:bg-rose-700 dark:bg-rose-700 dark:hover:bg-rose-600",
    ring: "ring-rose-200 dark:ring-rose-900/60",
  },
  green: {
    icon: <CheckCircle2 className="h-5 w-5 text-emerald-600" />,
    iconWrap: "bg-emerald-100",
    button: "bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-700 dark:hover:bg-emerald-600",
    ring: "ring-emerald-200 dark:ring-emerald-900/60",
  },
  violet: {
    icon: <PencilLine className="h-5 w-5 text-violet-600" />,
    iconWrap: "bg-violet-100",
    button: "bg-violet-600 hover:bg-violet-700 dark:bg-violet-700 dark:hover:bg-violet-600",
    ring: "ring-violet-200 dark:ring-violet-900/60",
  },
};

export const ConfirmationModal = ({
  open,
  title,
  message,
  supportingNote,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  accent = "violet",
  loading = false,
  onConfirm,
  onCancel,
  onClose,
}: ConfirmationModalProps) => {
  if (!open) return null;

  const style = accentStyles[accent];

  return (
    <ModalFrame
      onClose={onClose}
      containerClassName="max-w-md"
      contentClassName={`ring-1 ${style.ring}`}
      bodyClassName="space-y-6"
      footer={
        <div className="flex justify-end gap-2">
          <Button type="button" variant="secondary" onClick={onCancel} disabled={loading}>
            {cancelLabel}
          </Button>
          <Button
            type="button"
            onClick={onConfirm}
            disabled={loading}
            className={style.button}
          >
            {loading ? "Please wait..." : confirmLabel}
          </Button>
        </div>
      }
    >
      <div className="flex items-start gap-3">
        <span className={`mt-0.5 inline-flex h-10 w-10 items-center justify-center rounded-xl ${style.iconWrap}`}>
          {style.icon}
        </span>
        <div>
          <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">{title}</h3>
          <p className="mt-1 text-sm leading-6 text-zinc-600 dark:text-zinc-300">{message}</p>
          {supportingNote ? (
            <p className="mt-3 text-sm leading-6 text-zinc-600 dark:text-zinc-300">
              {supportingNote}
            </p>
          ) : null}
        </div>
      </div>
    </ModalFrame>
  );
};

