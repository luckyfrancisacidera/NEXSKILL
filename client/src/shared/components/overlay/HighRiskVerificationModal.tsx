import { useMemo, useState } from "react";
import { ShieldAlert } from "lucide-react";
import { Button } from "@shared/components/actions/Button";
import { ModalFrame } from "@shared/components/overlay/ModalFrame";

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
    <ModalFrame
      onClose={handleClose}
      containerClassName="max-w-lg"
      contentClassName="ring-1 ring-amber-200 dark:ring-amber-900/60"
      bodyClassName="space-y-4"
      footer={
        <div className="flex justify-end gap-2">
          <Button type="button" variant="secondary" onClick={handleCancel} disabled={loading}>
            {cancelLabel}
          </Button>
          <Button
            type="button"
            onClick={onConfirm}
            disabled={loading || !isValid}
            className="bg-rose-600 hover:bg-rose-700 dark:bg-rose-700 dark:hover:bg-rose-600"
          >
            {loading ? "Deleting..." : confirmLabel}
          </Button>
        </div>
      }
    >
      <div className="flex items-start gap-3">
        <span className="mt-0.5 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-amber-100">
          <ShieldAlert className="h-5 w-5 text-amber-700" />
        </span>
        <div>
          <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">{title}</h3>
          <p className="mt-1 text-sm leading-6 text-zinc-600 dark:text-zinc-300">{message}</p>
        </div>
      </div>

      <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-xs text-amber-900 dark:border-amber-900/60 dark:bg-amber-950/30 dark:text-amber-200">
        Type <span className="font-semibold">{expectedKeyword ?? expectedText}</span> to continue.
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-200">Verification input</label>
        <input
          value={typedValue}
          onChange={(event) => setTypedValue(event.target.value)}
          placeholder={`Type ${expectedKeyword ?? expectedText}`}
          className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-100 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100 dark:focus:ring-amber-950"
        />
        {error ? <p className="mt-2 text-xs text-rose-600 dark:text-rose-300">{error}</p> : null}
      </div>
    </ModalFrame>
  );
};

