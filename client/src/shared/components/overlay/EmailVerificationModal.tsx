/* eslint-disable react-hooks/set-state-in-effect */
import { useEffect, useState } from "react";
import { Mail, RefreshCcw, ShieldCheck } from "lucide-react";

import { Button } from "@shared/components/actions/Button";
import { ModalFrame } from "@shared/components/overlay/ModalFrame";

interface EmailVerificationModalProps {
  open: boolean;
  email: string;
  error?: string;
  isResending?: boolean;
  isVerifying?: boolean;
  onCancel: () => void;
  onResend: () => void | Promise<void>;
  onVerify: (pin: string) => void | Promise<void>;
}

const pinInputClassName =
  "h-12 w-full rounded-2xl border border-zinc-300 bg-zinc-100 px-4 text-center text-lg font-semibold tracking-[0.4em] text-zinc-800 shadow-sm outline-none transition placeholder:tracking-normal placeholder:text-zinc-500 focus:border-zinc-500 focus:ring-4 focus:ring-zinc-200 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200 dark:placeholder:text-zinc-500 dark:focus:border-zinc-500 dark:focus:ring-zinc-800";

export const EmailVerificationModal = ({
  open,
  email,
  error,
  isResending = false,
  isVerifying = false,
  onCancel,
  onResend,
  onVerify,
}: EmailVerificationModalProps) => {
  const [pin, setPin] = useState("");

  useEffect(() => {
    if (open) {
      setPin("");
    }
  }, [open]);

  if (!open) {
    return null;
  }

  return (
    <ModalFrame
      onClose={onCancel}
      containerClassName="max-w-lg"
      contentClassName="border-zinc-200 bg-white shadow-[0_30px_80px_rgba(15,23,42,0.2)] dark:border-zinc-800 dark:bg-zinc-950"
      bodyClassName="space-y-5 px-6 py-6"
      showCloseButton
      closeLabel="Close email verification modal"
      headerContent={
        <div className="flex min-w-0 items-start gap-4">
          <div className="inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-zinc-800 text-white dark:bg-zinc-200 dark:text-zinc-900">
            <ShieldCheck className="h-5 w-5" />
          </div>
          <div className="flex min-w-0 items-start gap-4">
            <div className="min-w-0">
              <h2 className="text-xl font-semibold text-zinc-800 dark:text-zinc-200">
                Verify your new email
              </h2>
              <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
                We sent a 6-digit code to your email
              </p>
              <p className="mt-2 inline-flex max-w-full items-center gap-2 rounded-full bg-zinc-100 px-3 py-1 text-xs font-medium text-zinc-600 shadow-sm dark:bg-zinc-950 dark:text-zinc-300">
                <Mail className="h-3.5 w-3.5" />
                <span className="truncate">{email}</span>
              </p>
            </div>
          </div>
        </div>
      }
    >
      <label className="block space-y-2">
        <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
          Verification PIN
        </span>
        <input
          className={pinInputClassName}
          inputMode="numeric"
          maxLength={6}
          value={pin}
          onChange={(event) => setPin(event.target.value.replace(/\D/g, "").slice(0, 6))}
          placeholder="123456"
        />
      </label>

      {error ? (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700 dark:border-rose-900 dark:bg-rose-950/40 dark:text-rose-300">
          {error}
        </div>
      ) : null}

      <div className="flex flex-col gap-3 sm:flex-row">
        <Button
          type="button"
          className="h-11 w-full min-w-0 justify-center rounded-xl"
          disabled={isVerifying || pin.length !== 6}
          onClick={() => void onVerify(pin)}
        >
          {isVerifying ? "Verifying..." : "Verify"}
        </Button>
        <Button
          type="button"
          variant="secondary"
          className="h-11 w-full min-w-0 justify-center rounded-xl"
          disabled={isResending}
          onClick={() => void onResend()}
        >
          <RefreshCcw className="h-4 w-4" />
          {isResending ? "Sending..." : "Resend"}
        </Button>
        <Button
          type="button"
          variant="secondary"
          className="h-11 w-full min-w-0 justify-center rounded-xl"
          onClick={onCancel}
        >
          Cancel
        </Button>
      </div>
    </ModalFrame>
  );
};

