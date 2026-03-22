import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { KeyRound, LifeBuoy, ShieldCheck } from "lucide-react";

import { useAuth } from "@app/providers/AuthProvider";
import { useToast } from "@app/providers/ToastProvider";
import { ResetPasswordPinModal } from "@features/auth/components/ResetPasswordPinModal";
import { authService } from "@features/auth/services/auth.service";
import { ApiError } from "@shared/api/http";
import { Button } from "@shared/components/Button";
import { Card } from "@shared/components/Card";

export const SettingsPage = () => {
  const { roles, user } = useAuth();
  const { showToast } = useToast();

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [changePasswordError, setChangePasswordError] = useState("");
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [isSendingRecoveryLink, setIsSendingRecoveryLink] = useState(false);
  const [isResetPasswordModalOpen, setIsResetPasswordModalOpen] = useState(false);

  const email = useMemo(() => user?.email?.trim() ?? "", [user?.email]);
  const isChangePasswordDisabled =
    isChangingPassword ||
    !currentPassword ||
    !newPassword ||
    !confirmPassword ||
    newPassword !== confirmPassword;

  const handleChangePassword = async (
    event: React.FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();
    setChangePasswordError("");

    if (!currentPassword || !newPassword || !confirmPassword) {
      setChangePasswordError("Complete all password fields before saving.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setChangePasswordError("Your new password confirmation does not match.");
      return;
    }

    setIsChangingPassword(true);

    try {
      await authService.changePassword({ currentPassword, newPassword });
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      showToast({
        title: "Password updated",
        description: "Your account password has been changed successfully.",
        tone: "success",
      });
    } catch (error) {
      if (error instanceof ApiError) {
        const payload = error.data as { message?: string } | null;
        setChangePasswordError(
          payload?.message ?? "We couldn't update your password right now.",
        );
      } else {
        setChangePasswordError("We couldn't update your password right now.");
      }
    } finally {
      setIsChangingPassword(false);
    }
  };

  const handleSendRecoveryLink = async () => {
    if (!email) {
      showToast({
        title: "Email unavailable",
        description: "We couldn't find the account email for this session.",
        tone: "error",
      });
      return;
    }

    setIsSendingRecoveryLink(true);

    try {
      await authService.requestPasswordReset({ email });
      showToast({
        title: "Recovery email sent",
        description:
          "If your account is eligible, a password reset link is on its way.",
        tone: "success",
      });
    } catch (error) {
      if (error instanceof ApiError) {
        const payload = error.data as { message?: string } | null;
        showToast({
          title: "Unable to send reset link",
          description:
            payload?.message ??
            "Please try again in a moment or use the public forgot password page.",
          tone: "error",
        });
      } else {
        showToast({
          title: "Unable to send reset link",
          description:
            "Please try again in a moment or use the public forgot password page.",
          tone: "error",
        });
      }
    } finally {
      setIsSendingRecoveryLink(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card className="bg-white">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <div className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-zinc-900 text-white">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <h2 className="mt-4 text-2xl font-semibold text-zinc-900">
              Account security
            </h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-600">
              Manage how you sign in, update your password securely, and keep a
              recovery option handy if you ever lose access.
            </p>
          </div>

          <div className="rounded-2xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm text-zinc-600">
            <p>
              <span className="font-medium text-zinc-900">Signed in as:</span>{" "}
              {email || "Unavailable"}
            </p>
            <p className="mt-1">
              <span className="font-medium text-zinc-900">Role:</span>{" "}
              {roles[0] ?? "jobseeker"}
            </p>
          </div>
        </div>
      </Card>

      <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
        <Card className="bg-white">
          <div className="flex items-center gap-3">
            <div className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-zinc-100 text-zinc-700">
              <KeyRound className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-zinc-900">
                Change password
              </h3>
              <p className="text-sm text-zinc-600">
                Use your current password to set a new one immediately.
              </p>
            </div>
          </div>

          <form
            className="mt-6 space-y-4"
            onSubmit={handleChangePassword}
            noValidate
          >
            <div>
              <label
                className="mb-2 block text-sm font-medium text-zinc-700"
                htmlFor="settings-current-password"
              >
                Current password
              </label>
              <input
                id="settings-current-password"
                type="password"
                autoComplete="current-password"
                value={currentPassword}
                onChange={(event) => setCurrentPassword(event.target.value)}
                className="h-11 w-full rounded-xl border border-zinc-300 bg-white px-4 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-zinc-500 focus:outline-none focus:ring-4 focus:ring-zinc-200"
                placeholder="Enter your current password"
              />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label
                  className="mb-2 block text-sm font-medium text-zinc-700"
                  htmlFor="settings-new-password"
                >
                  New password
                </label>
                <input
                  id="settings-new-password"
                  type="password"
                  autoComplete="new-password"
                  value={newPassword}
                  onChange={(event) => setNewPassword(event.target.value)}
                  className="h-11 w-full rounded-xl border border-zinc-300 bg-white px-4 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-zinc-500 focus:outline-none focus:ring-4 focus:ring-zinc-200"
                  placeholder="Create a strong password"
                />
              </div>

              <div>
                <label
                  className="mb-2 block text-sm font-medium text-zinc-700"
                  htmlFor="settings-confirm-password"
                >
                  Confirm new password
                </label>
                <input
                  id="settings-confirm-password"
                  type="password"
                  autoComplete="new-password"
                  value={confirmPassword}
                  onChange={(event) => setConfirmPassword(event.target.value)}
                  className="h-11 w-full rounded-xl border border-zinc-300 bg-white px-4 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-zinc-500 focus:outline-none focus:ring-4 focus:ring-zinc-200"
                  placeholder="Re-enter your new password"
                />
              </div>
            </div>

            <p className="text-xs leading-5 text-zinc-500">
              Passwords must be at least 8 characters and include uppercase,
              lowercase, numeric, and special characters.
            </p>

            {changePasswordError ? (
              <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                {changePasswordError}
              </div>
            ) : null}

            <Button
              type="submit"
              disabled={isChangePasswordDisabled}
              className="h-11 rounded-xl"
            >
              {isChangingPassword ? "Updating password..." : "Save new password"}
            </Button>
          </form>
        </Card>

        <Card className="bg-white">
          <div className="flex items-center gap-3">
            <div className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-zinc-100 text-zinc-700">
              <LifeBuoy className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-zinc-900">
                Recovery options
              </h3>
              <p className="text-sm text-zinc-600">
                Send yourself a secure recovery link if you ever forget your password.
              </p>
            </div>
          </div>

          <div className="mt-6 rounded-2xl border border-zinc-200 bg-zinc-50 p-4 text-sm leading-6 text-zinc-600">
            <p>
              Recovery email:
              <span className="ml-1 font-medium text-zinc-900">
                {email || "Unavailable"}
              </span>
            </p>
            <p className="mt-2">
              We keep the response generic so account existence is never exposed
              through this flow.
            </p>
          </div>

          <div className="mt-6 space-y-3">
            <Button
              type="button"
              disabled={isSendingRecoveryLink || !email}
              className="h-11 w-full justify-center rounded-xl"
              onClick={() => {
                void handleSendRecoveryLink();
              }}
            >
              {isSendingRecoveryLink
                ? "Sending recovery link..."
                : "Email me a reset link"}
            </Button>

            <Button
              type="button"
              variant="secondary"
              disabled={!email}
              className="h-11 w-full justify-center rounded-xl"
              onClick={() => setIsResetPasswordModalOpen(true)}
            >
              Reset with email PIN
            </Button>

            <Link
              to={
                email
                  ? `/forgot-password?email=${encodeURIComponent(email)}`
                  : "/forgot-password"
              }
              className="inline-flex h-11 w-full items-center justify-center rounded-xl border border-zinc-200 px-4 text-sm font-medium text-zinc-700 transition hover:bg-zinc-100"
            >
              Open the forgot password page
            </Link>
          </div>
        </Card>
      </div>

      <ResetPasswordPinModal
        open={isResetPasswordModalOpen}
        initialEmail={email}
        onClose={() => setIsResetPasswordModalOpen(false)}
      />
    </div>
  );
};
