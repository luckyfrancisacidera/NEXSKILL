import { useEffect, useMemo, useState } from "react";
import { ShieldAlert } from "lucide-react";
import { ModalOverlay } from "@shared/components/ModalOverlay";

interface HighRiskVerificationModalProps {
  open: boolean;
  title: string;
  message: string;
  expectedKeyword?: string;
  expectedText?: string;
  loading?: boolean;
  error?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onCancel: () => void;
  onClose: () => void;
  onConfirm: () => void;
}

export const HighRiskVerificationModal = ({
  open,
  title,
  message,
  expectedKeyword,
  expectedText,
  loading = false,
  error,
  confirmLabel = "Delete Permanently",
  cancelLabel = "Cancel",
  onCancel,
  onClose,
  onConfirm,
}: HighRiskVerificationModalProps) => {
  const [typedValue, setTypedValue] = useState("");

  useEffect(() => {
    if (!open) return;

    const handleKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setTypedValue("");
        onClose();
      }
    };

    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [onClose, open]);

  const isValid = useMemo(() => {
    const normalized = typedValue.trim().toLowerCase();
    const keywordMatch = expectedKeyword ? normalized === expectedKeyword.trim().toLowerCase() : false;
    const textMatch = expectedText ? normalized === expectedText.trim().toLowerCase() : false;

    return keywordMatch || textMatch;
  }, [expectedKeyword, expectedText, typedValue]);

  if (!open) return null;

  const handleClose = () => {
    setTypedValue("");
    onClose();
  };

  const handleCancel = () => {
    setTypedValue("");
    onCancel();
  };

  return (
    <ModalOverlay onClose={handleClose}>
      <div className="rounded-2xl bg-white p-5 shadow-2xl ring-1 ring-amber-200" role="dialog" aria-modal="true">
        <div className="flex items-start gap-3">
          <span className="mt-0.5 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-amber-100">
            <ShieldAlert className="h-5 w-5 text-amber-700" />
          </span>
          <div>
            <h3 className="text-lg font-semibold text-zinc-900">{title}</h3>
            <p className="mt-1 text-sm leading-6 text-zinc-600">{message}</p>
          </div>
        </div>

        <div className="mt-4 rounded-lg border border-amber-200 bg-amber-50 p-3 text-xs text-amber-900">
          Type <span className="font-semibold">{expectedKeyword ?? expectedText}</span> to continue.
        </div>

        <div className="mt-3">
          <label className="mb-1 block text-sm font-medium text-zinc-700">Verification input</label>
          <input
            value={typedValue}
            onChange={(event) => setTypedValue(event.target.value)}
            placeholder={`Type ${expectedKeyword ?? expectedText}`}
            className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-100"
          />
          {error ? <p className="mt-2 text-xs text-rose-600">{error}</p> : null}
        </div>

        <div className="mt-6 flex justify-end gap-2">
          <button
            type="button"
            onClick={handleCancel}
            disabled={loading}
            className="rounded-lg border border-zinc-300 px-4 py-2 text-sm font-semibold text-zinc-700 hover:bg-zinc-100 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={loading || !isValid}
            className="rounded-lg bg-rose-600 px-4 py-2 text-sm font-semibold text-white hover:bg-rose-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? "Deleting..." : confirmLabel}
          </button>
        </div>
      </div>
    </ModalOverlay>
  );
};
