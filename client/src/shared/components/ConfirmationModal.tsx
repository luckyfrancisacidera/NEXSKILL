import { useEffect, type ReactNode } from "react";
import { AlertTriangle, CheckCircle2, PencilLine } from "lucide-react";
import { ModalOverlay } from "@shared/components/ModalOverlay";

type ConfirmationAccent = "red" | "green" | "violet";

interface ConfirmationModalProps {
  open: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  accent?: ConfirmationAccent;
  loading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  onClose: () => void;
}

const accentStyles: Record<ConfirmationAccent, { icon: ReactNode; iconWrap: string; button: string; ring: string }> = {
  red: {
    icon: <AlertTriangle className="h-5 w-5 text-rose-600" />,
    iconWrap: "bg-rose-100",
    button: "bg-rose-600 hover:bg-rose-700",
    ring: "ring-rose-200",
  },
  green: {
    icon: <CheckCircle2 className="h-5 w-5 text-emerald-600" />,
    iconWrap: "bg-emerald-100",
    button: "bg-emerald-600 hover:bg-emerald-700",
    ring: "ring-emerald-200",
  },
  violet: {
    icon: <PencilLine className="h-5 w-5 text-violet-600" />,
    iconWrap: "bg-violet-100",
    button: "bg-violet-600 hover:bg-violet-700",
    ring: "ring-violet-200",
  },
};

export const ConfirmationModal = ({
  open,
  title,
  message,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  accent = "violet",
  loading = false,
  onConfirm,
  onCancel,
  onClose,
}: ConfirmationModalProps) => {
  useEffect(() => {
    if (!open) return;
    const handleKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [open, onClose]);

  if (!open) return null;

  const style = accentStyles[accent];

  return (
    <ModalOverlay onClose={onClose}>
      <div className={`rounded-2xl bg-white p-5 shadow-2xl ring-1 ${style.ring}`} role="dialog" aria-modal="true">
        <div className="flex items-start gap-3">
          <span className={`mt-0.5 inline-flex h-10 w-10 items-center justify-center rounded-xl ${style.iconWrap}`}>{style.icon}</span>
          <div>
            <h3 className="text-lg font-semibold text-zinc-900">{title}</h3>
            <p className="mt-1 text-sm leading-6 text-zinc-600">{message}</p>
          </div>
        </div>

        <div className="mt-6 flex justify-end gap-2">
          <button
            type="button"
            onClick={onCancel}
            disabled={loading}
            className="rounded-lg border border-zinc-300 px-4 py-2 text-sm font-semibold text-zinc-700 hover:bg-zinc-100 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={loading}
            className={`rounded-lg px-4 py-2 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60 ${style.button}`}
          >
            {loading ? "Please wait..." : confirmLabel}
          </button>
        </div>
      </div>
    </ModalOverlay>
  );
};
