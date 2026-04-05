import { useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { ArrowLeft, MailCheck, ShieldCheck } from "lucide-react";

import { ApiError } from "@shared/api/http";
import { Button } from "@shared/components/actions/Button";
import { Card } from "@shared/components/data-display/Card";
import { authService } from "@features/auth/services/auth.service";

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const ForgotPasswordPage = () => {
  const [searchParams] = useSearchParams();
  const initialEmail = searchParams.get("email")?.trim() ?? "";

  const [email, setEmail] = useState(initialEmail);
  const [fieldError, setFieldError] = useState("");
  const [requestError, setRequestError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasSubmitted, setHasSubmitted] = useState(false);

  const trimmedEmail = useMemo(() => email.trim(), [email]);
  const isEmailValid = emailPattern.test(trimmedEmail);

  const onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFieldError("");
    setRequestError("");

    if (!trimmedEmail) {
      setFieldError("Enter the email address you use to sign in.");
      return;
    }

    if (!emailPattern.test(trimmedEmail)) {
      setFieldError("Enter a valid email address.");
      return;
    }

    setIsSubmitting(true);

    try {
      await authService.requestPasswordReset({ email: trimmedEmail });
      setHasSubmitted(true);
    } catch (error) {
      if (error instanceof ApiError) {
        const payload = error.data as { message?: string } | null;
        setRequestError(
          payload?.message ??
            "We couldn't start the password reset flow right now. Please try again.",
        );
      } else {
        setRequestError(
          "We couldn't start the password reset flow right now. Please try again.",
        );
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen overflow-x-hidden bg-[radial-gradient(circle_at_top,rgba(129,140,248,0.18),transparent_30%),linear-gradient(180deg,#f8fafc_0%,#eef2ff_48%,#f8fafc_100%)] px-3 py-6 text-zinc-900 sm:px-6 sm:py-10 dark:bg-[radial-gradient(circle_at_top,rgba(99,102,241,0.16),transparent_26%),linear-gradient(180deg,#111827_0%,#09090b_56%,#020617_100%)] dark:text-zinc-100 max-[450px]:px-2.5 max-[450px]:py-4">
      <div className="mx-auto flex min-h-[calc(100vh-2rem)] max-w-5xl items-center justify-center sm:min-h-[calc(100vh-5rem)]">
        <div className="grid w-full gap-4 lg:grid-cols-[1.05fr_0.95fr] lg:gap-6">
          <Card className="rounded-[28px] border-zinc-200/80 bg-white/92 p-5 text-zinc-900 shadow-[0_24px_80px_rgba(15,23,42,0.08)] backdrop-blur sm:p-8 dark:border-zinc-800 dark:bg-zinc-950/88 dark:text-zinc-100 dark:shadow-[0_24px_80px_rgba(0,0,0,0.38)] max-[450px]:rounded-[22px] max-[450px]:p-4">
            {!hasSubmitted ? (
              <>
                <div className="inline-flex rounded-full border border-indigo-200 bg-indigo-50 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.24em] text-indigo-700 dark:border-indigo-500/30 dark:bg-indigo-500/10 dark:text-indigo-300">
                  Account recovery
                </div>
                <h1 className="mt-5 text-3xl font-semibold tracking-tight text-zinc-950 dark:text-zinc-50 sm:text-4xl max-[450px]:text-[1.8rem]">
                  Forgot your password?
                </h1>
                <p className="mt-4 max-w-xl text-sm leading-6 text-zinc-600 dark:text-zinc-400">
                  Enter your account email and we&apos;ll send you a secure reset
                  link. If the account exists, the message should arrive within a
                  few minutes.
                </p>

                <form className="mt-7 space-y-5" onSubmit={onSubmit} noValidate>
                  <div>
                    <label
                      htmlFor="forgot-password-email"
                      className="mb-2 block text-sm font-medium text-zinc-700 dark:text-zinc-200"
                    >
                      Email address
                    </label>
                    <input
                      id="forgot-password-email"
                      type="email"
                      autoComplete="email"
                      value={email}
                      onChange={(event) => setEmail(event.target.value)}
                      placeholder="you@example.com"
                      aria-invalid={fieldError ? "true" : "false"}
                      aria-describedby={
                        fieldError
                          ? "forgot-password-email-error"
                          : "forgot-password-email-help"
                      }
                      className="h-12 w-full rounded-2xl border border-zinc-200 bg-white px-4 text-sm text-zinc-900 shadow-[0_1px_2px_rgba(15,23,42,0.04)] transition placeholder:text-zinc-400 hover:border-zinc-300 focus:border-indigo-400 focus:outline-none focus:ring-4 focus:ring-indigo-100 dark:border-zinc-800 dark:bg-zinc-950/70 dark:text-zinc-100 dark:placeholder:text-zinc-500 dark:hover:border-zinc-700 dark:focus:border-indigo-400 dark:focus:ring-indigo-950/60"
                    />
                    <p
                      id="forgot-password-email-help"
                      className="mt-2 text-xs leading-5 text-zinc-500 dark:text-zinc-400"
                    >
                      We&apos;ll never reveal whether this email is registered.
                    </p>
                    {fieldError ? (
                      <p
                        id="forgot-password-email-error"
                        className="mt-2 text-sm text-rose-600 dark:text-rose-300"
                      >
                        {fieldError}
                      </p>
                    ) : null}
                  </div>

                  {requestError ? (
                    <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700 dark:border-rose-900/70 dark:bg-rose-950/40 dark:text-rose-300">
                      {requestError}
                    </div>
                  ) : null}

                  <Button
                    type="submit"
                    disabled={isSubmitting || !trimmedEmail || !isEmailValid}
                    className="h-12 w-full justify-center rounded-2xl bg-zinc-900 text-white hover:bg-zinc-800 disabled:bg-zinc-300 dark:bg-zinc-100 dark:text-zinc-950 dark:hover:bg-zinc-200 dark:disabled:bg-zinc-700 dark:disabled:text-zinc-400"
                  >
                    {isSubmitting ? "Sending reset link..." : "Send reset link"}
                  </Button>
                </form>
              </>
            ) : (
              <div className="flex h-full flex-col justify-between">
                <div>
                  <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300">
                    <MailCheck className="h-7 w-7" />
                  </div>
                  <h1 className="mt-6 text-3xl font-semibold tracking-tight text-zinc-950 dark:text-zinc-50 max-[450px]:text-[1.8rem]">
                    Check your inbox
                  </h1>
                  <p className="mt-4 text-sm leading-6 text-zinc-600 dark:text-zinc-400">
                    If an account exists for <span className="font-medium text-zinc-900 dark:text-zinc-100">{trimmedEmail}</span>,
                    a secure password reset link has been sent. Open the email and
                    follow the link to choose a new password.
                  </p>
                  <p className="mt-3 text-sm leading-6 text-zinc-500 dark:text-zinc-400">
                    No email yet? Check spam, then wait a minute before requesting
                    another link.
                  </p>
                </div>

                <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                  <Button
                    type="button"
                    variant="secondary"
                    className="h-11 rounded-2xl"
                    onClick={() => {
                      setHasSubmitted(false);
                      setRequestError("");
                    }}
                  >
                    Send another link
                  </Button>
                  <Link
                    to="/login"
                    className="inline-flex h-11 items-center justify-center rounded-2xl bg-zinc-900 px-4 text-sm font-medium text-white transition hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-950 dark:hover:bg-zinc-200"
                  >
                    Back to sign in
                  </Link>
                </div>
              </div>
            )}
          </Card>

          <div className="space-y-4">
            <Card className="rounded-[28px] border-zinc-200/80 bg-white/88 p-5 text-zinc-900 shadow-[0_18px_60px_rgba(15,23,42,0.06)] backdrop-blur sm:p-6 dark:border-zinc-800 dark:bg-zinc-950/78 dark:text-zinc-100 max-[450px]:rounded-[22px] max-[450px]:p-4">
              <div className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-zinc-100 text-zinc-700 dark:bg-zinc-900 dark:text-zinc-200">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <h2 className="mt-4 text-lg font-semibold text-zinc-950 dark:text-zinc-100">What happens next</h2>
              <ul className="mt-4 space-y-3 text-sm leading-6 text-zinc-600 dark:text-zinc-400">
                <li>We generate a secure, time-limited reset token.</li>
                <li>Your email contains a direct link to the reset page.</li>
                <li>Once your password changes, old reset links stop working.</li>
              </ul>
            </Card>

            <Card className="rounded-[28px] border-zinc-200/80 bg-white/88 p-5 text-zinc-900 shadow-[0_18px_60px_rgba(15,23,42,0.06)] backdrop-blur sm:p-6 dark:border-zinc-800 dark:bg-zinc-950/78 dark:text-zinc-100 max-[450px]:rounded-[22px] max-[450px]:p-4">
              <Link
                to="/login"
                className="inline-flex items-center gap-2 text-sm font-medium text-zinc-600 transition hover:text-zinc-950 dark:text-zinc-400 dark:hover:text-zinc-100"
              >
                <ArrowLeft className="h-4 w-4" />
                Return to the login page
              </Link>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

