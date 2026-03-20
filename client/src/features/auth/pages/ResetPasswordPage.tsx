import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { CheckCircle2, Eye, EyeOff, KeyRound, TriangleAlert } from "lucide-react";

import { ApiError } from "@shared/api/http";
import { Button } from "@shared/components/Button";
import { Card } from "@shared/components/Card";
import { authService } from "@features/auth/services/auth.service";

const passwordRequirements = [
  "At least 8 characters",
  "One uppercase letter",
  "One lowercase letter",
  "One number",
  "One special character",
];

type PasswordFieldProps = {
  id: string;
  label: string;
  value: string;
  placeholder: string;
  visible: boolean;
  autoComplete: string;
  error?: string;
  onChange: (value: string) => void;
  onToggle: () => void;
};

const PasswordField = ({
  id,
  label,
  value,
  placeholder,
  visible,
  autoComplete,
  error,
  onChange,
  onToggle,
}: PasswordFieldProps) => {
  const Icon = visible ? EyeOff : Eye;

  return (
    <div>
      <label
        htmlFor={id}
        className="mb-2 block text-sm font-medium text-zinc-700 dark:text-zinc-200"
      >
        {label}
      </label>
      <div className="relative">
        <input
          id={id}
          type={visible ? "text" : "password"}
          autoComplete={autoComplete}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          aria-invalid={error ? "true" : "false"}
          aria-describedby={error ? `${id}-error` : undefined}
          className={`h-12 w-full rounded-2xl border bg-white px-4 pr-12 text-sm text-zinc-900 shadow-[0_1px_2px_rgba(15,23,42,0.04)] transition placeholder:text-zinc-400 hover:border-zinc-300 focus:outline-none focus:ring-4 dark:bg-zinc-950/70 dark:text-zinc-100 dark:placeholder:text-zinc-500 dark:hover:border-zinc-700 ${
            error
              ? "border-rose-300 focus:border-rose-400 focus:ring-rose-100 dark:border-rose-700 dark:focus:border-rose-500 dark:focus:ring-rose-950/60"
              : "border-zinc-200 focus:border-indigo-400 focus:ring-indigo-100 dark:border-zinc-800 dark:focus:border-indigo-400 dark:focus:ring-indigo-950/60"
          }`}
          placeholder={placeholder}
        />
        <button
          type="button"
          aria-label={visible ? "Hide password" : "Show password"}
          onClick={onToggle}
          className="absolute right-3 top-1/2 inline-flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full text-zinc-500 transition hover:text-zinc-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 dark:text-zinc-400 dark:hover:text-zinc-100"
        >
          <Icon className="h-4 w-4" />
        </button>
      </div>
      {error ? (
        <p
          id={`${id}-error`}
          className="mt-2 text-sm text-rose-600 dark:text-rose-300"
        >
          {error}
        </p>
      ) : null}
    </div>
  );
};

export const ResetPasswordPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const email = searchParams.get("email")?.trim() ?? "";
  const token = searchParams.get("token")?.trim() ?? "";

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [formError, setFormError] = useState("");
  const [requestError, setRequestError] = useState("");
  const [isValidating, setIsValidating] = useState(true);
  const [isTokenValid, setIsTokenValid] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const hasRequiredParams = Boolean(email && token);

  const passwordMismatch = useMemo(
    () =>
      confirmPassword.length > 0 &&
      newPassword.length > 0 &&
      confirmPassword !== newPassword,
    [confirmPassword, newPassword],
  );
  const isSubmitDisabled =
    isSubmitting ||
    !isTokenValid ||
    !newPassword ||
    !confirmPassword ||
    passwordMismatch;

  useEffect(() => {
    const validateToken = async () => {
      if (!hasRequiredParams) {
        setIsTokenValid(false);
        setRequestError("This password reset link is incomplete or invalid.");
        setIsValidating(false);
        return;
      }

      setIsValidating(true);
      setRequestError("");

      try {
        await authService.validatePasswordResetToken({ email, token });
        setIsTokenValid(true);
      } catch (error) {
        if (error instanceof ApiError) {
          const payload = error.data as { message?: string } | null;
          setRequestError(
            payload?.message ??
              "This password reset link is invalid or has expired.",
          );
        } else {
          setRequestError("This password reset link is invalid or has expired.");
        }

        setIsTokenValid(false);
      } finally {
        setIsValidating(false);
      }
    };

    void validateToken();
  }, [email, hasRequiredParams, token]);

  const onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFormError("");
    setRequestError("");

    if (!newPassword) {
      setFormError("Enter your new password.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setFormError("Your password confirmation does not match.");
      return;
    }

    setIsSubmitting(true);

    try {
      await authService.resetPassword({ email, token, newPassword });
      setIsSuccess(true);
    } catch (error) {
      if (error instanceof ApiError) {
        const payload = error.data as { message?: string } | null;
        setRequestError(
          payload?.message ?? "We couldn't reset your password. Please try again.",
        );
      } else {
        setRequestError("We couldn't reset your password. Please try again.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen font-inter overflow-x-hidden bg-[radial-gradient(circle_at_top,rgba(129,140,248,0.18),transparent_30%),linear-gradient(180deg,#f8fafc_0%,#eef2ff_48%,#f8fafc_100%)] px-3 py-6 text-zinc-900 sm:px-6 sm:py-10 dark:bg-[radial-gradient(circle_at_top,rgba(99,102,241,0.16),transparent_26%),linear-gradient(180deg,#111827_0%,#09090b_56%,#020617_100%)] dark:text-zinc-100 max-[450px]:px-2.5 max-[450px]:py-4">
      <div className="mx-auto flex min-h-[calc(100vh-2rem)] max-w-4xl items-center justify-center sm:min-h-[calc(100vh-5rem)]">
        <Card className="w-full rounded-[28px] border-zinc-200/80 bg-white/92 p-5 text-zinc-900 shadow-[0_24px_80px_rgba(15,23,42,0.08)] backdrop-blur sm:p-8 lg:p-10 dark:border-zinc-800 dark:bg-zinc-950/88 dark:text-zinc-100 dark:shadow-[0_24px_80px_rgba(0,0,0,0.38)] max-[450px]:rounded-[22px] max-[450px]:p-4">
          {isValidating ? (
            <div className="space-y-4">
              <div className="h-11 w-11 animate-pulse rounded-2xl bg-zinc-200 dark:bg-zinc-800" />
              <div className="h-5 w-44 animate-pulse rounded bg-zinc-200 dark:bg-zinc-800" />
              <div className="h-4 w-full animate-pulse rounded bg-zinc-100 dark:bg-zinc-900" />
              <div className="h-4 w-3/4 animate-pulse rounded bg-zinc-100 dark:bg-zinc-900" />
            </div>
          ) : isSuccess ? (
            <div className="max-w-xl">
              <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300">
                <CheckCircle2 className="h-7 w-7" />
              </div>
              <h1 className="mt-6 text-3xl font-semibold tracking-tight text-zinc-950 dark:text-zinc-50 max-[450px]:text-[1.8rem]">
                Password updated
              </h1>
              <p className="mt-4 text-sm leading-6 text-zinc-600 dark:text-zinc-400">
                Your password has been reset successfully. You can return to the
                login page and sign in with your new password now.
              </p>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Link
                  to="/login"
                  className="inline-flex h-11 items-center justify-center rounded-2xl bg-zinc-900 px-4 text-sm font-medium text-white transition hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-950 dark:hover:bg-zinc-200"
                >
                  Back to sign in
                </Link>
                <Button
                  type="button"
                  variant="secondary"
                  className="h-11 rounded-2xl"
                  onClick={() => navigate("/forgot-password", { replace: true })}
                >
                  Request another reset link
                </Button>
              </div>
            </div>
          ) : !isTokenValid ? (
            <div className="flex items-center justify-center px-4">
              <div className="max-w-xl w-full flex flex-col items-center text-center">
                
                <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300">
                  <TriangleAlert className="h-7 w-7" />
                </div>

                <h1 className="mt-6 text-3xl font-semibold tracking-tight text-zinc-950 dark:text-zinc-50 max-[450px]:text-[1.8rem]">
                  This reset link can&apos;t be used
                </h1>

                <p className="mt-4 text-sm leading-6 text-zinc-600 dark:text-zinc-400">
                  {requestError || "This password reset link is invalid or has expired."}
                </p>

                <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                  <Link
                    to={email ? `/forgot-password?email=${encodeURIComponent(email)}` : "/forgot-password"}
                    className="inline-flex h-11 items-center justify-center rounded-2xl bg-zinc-900 px-4 text-sm font-medium text-white transition hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-950 dark:hover:bg-zinc-200"
                  >
                    Request a new reset link
                  </Link>

                  <Link
                    to="/login"
                    className="inline-flex h-11 items-center justify-center rounded-2xl border border-zinc-200 px-4 text-sm font-medium text-zinc-700 transition hover:bg-zinc-100 hover:text-zinc-950 dark:border-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-900 dark:hover:text-zinc-100"
                  >
                    Back to sign in
                  </Link>
                </div>

              </div>
            </div>
          ) : (
            <div className="grid gap-8 lg:grid-cols-[0.95fr_1.05fr]">
              <div>
                <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-950">
                  <KeyRound className="h-6 w-6" />
                </div>
                <h1 className="mt-6 text-3xl font-semibold tracking-tight text-zinc-950 dark:text-zinc-50 max-[450px]:text-[1.8rem]">
                  Choose a new password
                </h1>
                <p className="mt-4 text-sm leading-6 text-zinc-600 dark:text-zinc-400">
                  Updating the password for <span className="font-medium text-zinc-900 dark:text-zinc-100">{email}</span>.
                  Once saved, your previous reset link will stop working.
                </p>

                <div className="mt-6 rounded-2xl border border-zinc-200 bg-zinc-50 p-4 dark:border-zinc-800 dark:bg-zinc-900/70">
                  <p className="text-xs font-semibold uppercase tracking-[0.22em] text-zinc-500 dark:text-zinc-400">
                    Password checklist
                  </p>
                  <ul className="mt-3 space-y-2 text-sm text-zinc-600 dark:text-zinc-400">
                    {passwordRequirements.map((requirement) => (
                      <li key={requirement}>{requirement}</li>
                    ))}
                  </ul>
                </div>
              </div>

              <form className="space-y-5" onSubmit={onSubmit} noValidate>
                <PasswordField
                  id="reset-password-new"
                  label="New password"
                  value={newPassword}
                  placeholder="Create a strong password"
                  visible={showNewPassword}
                  autoComplete="new-password"
                  onChange={setNewPassword}
                  onToggle={() => setShowNewPassword((current) => !current)}
                />

                <PasswordField
                  id="reset-password-confirm"
                  label="Confirm new password"
                  value={confirmPassword}
                  placeholder="Re-enter your new password"
                  visible={showConfirmPassword}
                  autoComplete="new-password"
                  error={passwordMismatch ? "Your password confirmation does not match." : undefined}
                  onChange={setConfirmPassword}
                  onToggle={() => setShowConfirmPassword((current) => !current)}
                />

                {formError ? (
                  <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700 dark:border-rose-900/70 dark:bg-rose-950/40 dark:text-rose-300">
                    {formError}
                  </div>
                ) : null}

                {requestError ? (
                  <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700 dark:border-rose-900/70 dark:bg-rose-950/40 dark:text-rose-300">
                    {requestError}
                  </div>
                ) : null}

                <Button
                  type="submit"
                  disabled={isSubmitDisabled}
                  className="h-12 w-full justify-center rounded-2xl bg-zinc-900 text-white hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-950 dark:hover:bg-zinc-200"
                >
                  {isSubmitting ? "Updating password..." : "Save new password"}
                </Button>

                <Link
                  to="/login"
                  className="inline-flex text-sm font-medium text-zinc-600 transition hover:text-zinc-950 dark:text-zinc-400 dark:hover:text-zinc-100"
                >
                  Back to sign in
                </Link>
              </form>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};
