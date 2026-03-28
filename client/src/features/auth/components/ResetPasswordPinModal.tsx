import { useEffect, useMemo, useState } from "react";
import { CheckCircle2, Eye, EyeOff, KeyRound, Mail, RefreshCcw, X } from "lucide-react";

import { authService } from "@features/auth/services/auth.service";
import { ApiError } from "@shared/api/http";
import { Button } from "@shared/components/Button";
import { ModalOverlay } from "@shared/components/ModalOverlay";

interface ResetPasswordPinModalProps {
  open: boolean;
  initialEmail?: string;
  onClose: () => void;
}

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const pinInputClassName =
  "h-12 w-full rounded-2xl border border-zinc-300 bg-zinc-100 px-4 text-center text-lg font-semibold tracking-[0.4em] text-zinc-800 shadow-sm outline-none transition placeholder:tracking-normal placeholder:text-zinc-500 focus:border-zinc-500 focus:ring-4 focus:ring-zinc-200 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200 dark:placeholder:text-zinc-500 dark:focus:border-zinc-500 dark:focus:ring-zinc-800";
const inputClassName =
  "h-12 w-full rounded-2xl border border-zinc-300 bg-zinc-100 px-4 text-sm text-zinc-900 shadow-sm outline-none transition placeholder:text-zinc-500 focus:border-zinc-500 focus:ring-4 focus:ring-zinc-200 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 dark:placeholder:text-zinc-500 dark:focus:border-zinc-500 dark:focus:ring-zinc-800";

type PasswordInputProps = {
  id: string;
  label: string;
  value: string;
  visible: boolean;
  error?: string;
  onChange: (value: string) => void;
  onToggle: () => void;
};

const PasswordInput = ({
  id,
  label,
  value,
  visible,
  error,
  onChange,
  onToggle,
}: PasswordInputProps) => {
  const Icon = visible ? EyeOff : Eye;

  return (
    <label className="block space-y-2">
      <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
        {label}
      </span>
      <div className="relative">
        <input
          id={id}
          type={visible ? "text" : "password"}
          autoComplete="new-password"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className={`${inputClassName} pr-12`}
          aria-invalid={error ? "true" : "false"}
          aria-describedby={error ? `${id}-error` : undefined}
          placeholder="Enter a new password"
        />
        <button
          type="button"
          onClick={onToggle}
          className="absolute right-3 top-1/2 inline-flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full text-zinc-500 transition hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
          aria-label={visible ? "Hide password" : "Show password"}
        >
          <Icon className="h-4 w-4" />
        </button>
      </div>
      {error ? (
        <p id={`${id}-error`} className="text-sm text-rose-600 dark:text-rose-300">
          {error}
        </p>
      ) : null}
    </label>
  );
};

export const ResetPasswordPinModal = ({
  open,
  initialEmail = "",
  onClose,
}: ResetPasswordPinModalProps) => {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [email, setEmail] = useState(initialEmail);
  const [pin, setPin] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [isRequesting, setIsRequesting] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isResending, setIsResending] = useState(false);

  useEffect(() => {
    if (!open) {
      setStep(1);
      setEmail(initialEmail);
      setPin("");
      setNewPassword("");
      setConfirmPassword("");
      setShowNewPassword(false);
      setShowConfirmPassword(false);
      setMessage("");
      setError("");
      setIsRequesting(false);
      setIsVerifying(false);
      setIsResending(false);
      return;
    }

    setEmail(initialEmail);
  }, [initialEmail, open]);

  const trimmedEmail = useMemo(() => email.trim(), [email]);
  const passwordsMismatch =
    confirmPassword.length > 0 &&
    newPassword.length > 0 &&
    confirmPassword !== newPassword;

  if (!open) {
    return null;
  }

  const requestPin = async (resend = false) => {
    setError("");

    if (!trimmedEmail) {
      setError("Enter the email address you use to sign in.");
      return;
    }

    if (!emailPattern.test(trimmedEmail)) {
      setError("Enter a valid email address.");
      return;
    }

    if (resend) {
      setIsResending(true);
    } else {
      setIsRequesting(true);
    }

    try {
      const response = await authService.requestPasswordResetPin({ email: trimmedEmail });
      setMessage(
        (response as { message?: string } | undefined)?.message ??
          "If an account with that email exists, a PIN has been sent.",
      );
      setStep(2);
      setPin("");
    } catch (requestError) {
      if (requestError instanceof ApiError) {
        const payload = requestError.data as { message?: string } | null;
        setError(payload?.message ?? "We couldn't send a PIN right now. Please try again.");
      } else {
        setError("We couldn't send a PIN right now. Please try again.");
      }
    } finally {
      if (resend) {
        setIsResending(false);
      } else {
        setIsRequesting(false);
      }
    }
  };

  const verifyPin = async () => {
    setError("");

    if (pin.length !== 6) {
      setError("Enter the 6-digit PIN sent to your email.");
      return;
    }

    if (!newPassword) {
      setError("Enter your new password.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Your password confirmation does not match.");
      return;
    }

    setIsVerifying(true);

    try {
      await authService.verifyResetPin({
        email: trimmedEmail,
        pin,
        newPassword,
        confirmPassword,
      });
      setStep(3);
      setMessage("Your password has been updated successfully.");
    } catch (requestError) {
      if (requestError instanceof ApiError) {
        const payload = requestError.data as { message?: string } | null;
        setError(payload?.message ?? "We couldn't reset your password. Please try again.");
      } else {
        setError("We couldn't reset your password. Please try again.");
      }
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <ModalOverlay onClose={onClose}>
      <div className="w-full min-w-0 rounded-[30px] border border-zinc-200 bg-white p-6 font-inter shadow-[0_30px_80px_rgba(15,23,42,0.2)] dark:border-zinc-800 dark:bg-zinc-950 sm:p-7">
        <div className="flex items-start justify-between gap-4">
          <div className="flex min-w-0 items-start gap-4">
            <div className="inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-zinc-800 text-white dark:bg-zinc-200 dark:text-zinc-900">
              {step === 3 ? <CheckCircle2 className="h-5 w-5" /> : <KeyRound className="h-5 w-5" />}
            </div>
            <div className="min-w-0">
              <h2 className="text-xl font-semibold text-zinc-800 dark:text-zinc-200">
                Reset your password
              </h2>
              <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
                {step === 1 && "Enter your email to receive a one-time PIN."}
                {step === 2 && "Enter the PIN from your email, then choose a new password."}
                {step === 3 && "Your password has been updated."}
              </p>
              {step !== 1 ? (
                <p className="mt-2 inline-flex max-w-full items-center gap-2 rounded-full bg-zinc-100 px-3 py-1 text-xs font-medium text-zinc-600 shadow-sm dark:bg-zinc-950 dark:text-zinc-300">
                  <Mail className="h-3.5 w-3.5" />
                  <span className="truncate">{trimmedEmail}</span>
                </p>
              ) : null}
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-zinc-200 text-zinc-500 transition hover:bg-zinc-100 hover:text-zinc-900 dark:border-zinc-700 dark:text-zinc-400 dark:hover:bg-zinc-900 dark:hover:text-zinc-100"
            aria-label="Close reset password modal"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="mt-6 space-y-5">
          {step === 1 ? (
            <>
              <label className="block space-y-2">
                <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                  Email address
                </span>
                <input
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  className={inputClassName}
                  placeholder="you@example.com"
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
                  disabled={isRequesting}
                  onClick={() => void requestPin()}
                >
                  {isRequesting ? "Sending PIN..." : "Send PIN"}
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  className="h-11 w-full min-w-0 justify-center rounded-xl"
                  onClick={onClose}
                >
                  Cancel
                </Button>
              </div>
            </>
          ) : null}

          {step === 2 ? (
            <>
              {message ? (
                <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-300">
                  {message}
                </div>
              ) : null}

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

              <PasswordInput
                id="reset-password-modal-new"
                label="New password"
                value={newPassword}
                visible={showNewPassword}
                onChange={setNewPassword}
                onToggle={() => setShowNewPassword((current) => !current)}
              />

              <PasswordInput
                id="reset-password-modal-confirm"
                label="Confirm new password"
                value={confirmPassword}
                visible={showConfirmPassword}
                error={passwordsMismatch ? "Your password confirmation does not match." : undefined}
                onChange={setConfirmPassword}
                onToggle={() => setShowConfirmPassword((current) => !current)}
              />

              {error ? (
                <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700 dark:border-rose-900 dark:bg-rose-950/40 dark:text-rose-300">
                  {error}
                </div>
              ) : null}

              <div className="flex flex-col gap-3">
                <Button
                  type="button"
                  className="h-11 w-full min-w-0 justify-center rounded-xl"
                  disabled={isVerifying}
                  onClick={() => void verifyPin()}
                >
                  {isVerifying ? "Updating password..." : "Save new password"}
                </Button>
                <div className="flex flex-col gap-3 sm:flex-row">
                  <Button
                    type="button"
                    variant="secondary"
                    className="h-11 w-full min-w-0 justify-center rounded-xl"
                    disabled={isResending}
                    onClick={() => void requestPin(true)}
                  >
                    <RefreshCcw className="h-4 w-4" />
                    {isResending ? "Sending..." : "Resend PIN"}
                  </Button>
                  <Button
                    type="button"
                    variant="secondary"
                    className="h-11 w-full min-w-0 justify-center rounded-xl"
                    onClick={onClose}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            </>
          ) : null}

          {step === 3 ? (
            <div className="space-y-5">
              <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-300">
                {message}
              </div>

              <Button
                type="button"
                className="h-11 w-full min-w-0 justify-center rounded-xl"
                onClick={onClose}
              >
                Back to sign in
              </Button>
            </div>
          ) : null}
        </div>
      </div>
    </ModalOverlay>
  );
};
