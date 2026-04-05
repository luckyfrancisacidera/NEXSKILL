import { useEffect, useMemo, useState } from "react";
import { Eye, EyeOff } from "lucide-react";

import { useAuth } from "@app/providers/AuthProvider";
import { useToast } from "@app/providers/ToastProvider";
import { ResetPasswordPinModal } from "@features/auth/components/ResetPasswordPinModal";
import { authService } from "@features/auth/services/auth.service";
import { ProfileForm } from "@features/jobseeker/pages/ProfilePage/components/ProfileForm";
import { ApiError } from "@shared/api/http";
import { Button } from "@shared/components/actions/Button";
import { Card } from "@shared/components/data-display/Card";
import { useConfirmation } from "@shared/hooks/useConfirmation";
import type {
  PasswordFormState,
  PasswordVisibilityState,
  ProfileFormState,
} from "@features/jobseeker/types/types";

const pageCardClassName =
  "rounded-2xl border border-zinc-200 bg-zinc-50 p-4 shadow-[0_10px_30px_rgba(15,23,42,0.06)] dark:border-zinc-800 dark:bg-zinc-950 sm:p-6 lg:p-8";

const inputClassName =
  "h-11 w-full rounded-xl border border-zinc-300 bg-white px-4 pr-11 text-sm text-zinc-800 shadow-sm outline-none transition placeholder:text-zinc-400 focus:border-zinc-400 focus:ring-4 focus:ring-zinc-200 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 dark:placeholder:text-zinc-500 dark:focus:border-zinc-500 dark:focus:ring-zinc-800";

const helperPanelClassName =
  "rounded-2xl border border-zinc-200 bg-white/80 px-5 py-4 text-sm leading-7 text-zinc-600 dark:border-zinc-800 dark:bg-zinc-900/80 dark:text-zinc-400";

const subtleButtonClassName =
  "h-10 rounded-xl border-zinc-200 bg-zinc-200 px-6 text-zinc-700 hover:bg-zinc-300 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200 dark:hover:bg-zinc-700";

const primaryButtonClassName =
  "h-10 rounded-xl bg-zinc-800 px-6 text-white shadow-[0_10px_20px_rgba(24,24,27,0.18)] hover:bg-zinc-900 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200";

const emptyProfile: ProfileFormState = {
  firstName: "",
  lastName: "",
};

const emptyPasswordForm: PasswordFormState = {
  currentPassword: "",
  newPassword: "",
  confirmPassword: "",
};

const defaultPasswordVisibility: PasswordVisibilityState = {
  currentPassword: false,
  newPassword: false,
  confirmPassword: false,
};

const getApiErrorMessage = (error: unknown, fallback: string) => {
  if (error instanceof ApiError) {
    const payload = error.data as { message?: string } | null;
    return payload?.message ?? fallback;
  }

  if (error instanceof Error && error.message) {
    return error.message;
  }

  return fallback;
};

const hasProfileChanges = (current: ProfileFormState, initial: ProfileFormState) =>
  current.firstName.trim() !== initial.firstName.trim()
  || current.lastName.trim() !== initial.lastName.trim();

const PasswordField = ({
  id,
  label,
  value,
  visible,
  placeholder,
  onChange,
  onToggle,
}: {
  id: string;
  label: string;
  value: string;
  visible: boolean;
  placeholder: string;
  onChange: (value: string) => void;
  onToggle: () => void;
}) => (
  <label className="block">
    <span className="mb-3 block text-sm font-medium text-zinc-800 dark:text-zinc-100">
      {label}
    </span>
    <div className="relative">
      <input
        id={id}
        className={inputClassName}
        type={visible ? "text" : "password"}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        autoComplete={
          id === "current-password" ? "current-password" : "new-password"
        }
      />
      <button
        type="button"
        className="absolute inset-y-0 right-0 inline-flex w-11 items-center justify-center text-zinc-500 transition hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200"
        onClick={onToggle}
        aria-label={visible ? `Hide ${label}` : `Show ${label}`}
      >
        {visible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
      </button>
    </div>
  </label>
);

export const ProfilePage = () => {
  const { isHydrating, refreshMe, user } = useAuth();
  const { showToast } = useToast();
  const confirm = useConfirmation();

  const [profileForm, setProfileForm] = useState<ProfileFormState>(emptyProfile);
  const [initialProfileForm, setInitialProfileForm] = useState<ProfileFormState>(emptyProfile);
  const [passwordForm, setPasswordForm] = useState<PasswordFormState>(emptyPasswordForm);
  const [passwordVisibility, setPasswordVisibility] = useState<PasswordVisibilityState>(defaultPasswordVisibility);

  const [isLoadingProfile, setIsLoadingProfile] = useState(true);
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [isResetPasswordModalOpen, setIsResetPasswordModalOpen] = useState(false);
  const [profileError, setProfileError] = useState("");
  const [passwordError, setPasswordError] = useState("");

  useEffect(() => {
    if (isHydrating) {
      return;
    }

    let cancelled = false;

    const loadProfile = async () => {
      setIsLoadingProfile(true);
      setProfileError("");

      try {
        const profile = await authService.getProfile();
        if (cancelled) {
          return;
        }

        const nextProfile = {
          firstName: profile.first_name ?? user?.firstName ?? "",
          lastName: profile.last_name ?? user?.lastName ?? "",
        };

        setProfileForm(nextProfile);
        setInitialProfileForm(nextProfile);
      } catch (error) {
        if (!cancelled) {
          const fallbackProfile = {
            firstName: user?.firstName ?? "",
            lastName: user?.lastName ?? "",
          };

          if (fallbackProfile.firstName || fallbackProfile.lastName) {
            setProfileForm(fallbackProfile);
            setInitialProfileForm(fallbackProfile);
            setProfileError("");
          } else {
            setProfileError(
              getApiErrorMessage(
                error,
                "Unable to load your profile information right now.",
              ),
            );
          }
        }
      } finally {
        if (!cancelled) {
          setIsLoadingProfile(false);
        }
      }
    };

    void loadProfile();

    return () => {
      cancelled = true;
    };
  }, [isHydrating, user?.firstName, user?.lastName]);

  const canSaveProfile = useMemo(
    () => hasProfileChanges(profileForm, initialProfileForm) && !isSavingProfile,
    [initialProfileForm, isSavingProfile, profileForm],
  );

  const canSavePassword = useMemo(() => {
    if (isChangingPassword) {
      return false;
    }

    return Boolean(
      passwordForm.currentPassword
      && passwordForm.newPassword
      && passwordForm.confirmPassword
      && passwordForm.newPassword === passwordForm.confirmPassword,
    );
  }, [isChangingPassword, passwordForm]);

  const updateProfileField = (field: keyof ProfileFormState, value: string) => {
    setProfileForm((current) => ({ ...current, [field]: value }));
  };

  const updatePasswordField = (
    field: keyof PasswordFormState,
    value: string,
  ) => {
    setPasswordForm((current) => ({ ...current, [field]: value }));
    setPasswordError("");
  };

  const handleResetProfile = () => {
    setProfileForm(initialProfileForm);
    setProfileError("");
  };

  const handleResetPassword = () => {
    setPasswordForm(emptyPasswordForm);
    setPasswordVisibility(defaultPasswordVisibility);
    setPasswordError("");
  };

  const handleSaveProfile = async (
    event: React.FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();
    setProfileError("");

    if (!hasProfileChanges(profileForm, initialProfileForm)) {
      showToast({
        title: "No changes detected",
        description: "Update your first or last name before saving.",
        tone: "info",
      });
      return;
    }

    setIsSavingProfile(true);

    try {
      const profile = await authService.updateProfile({
        first_name: profileForm.firstName.trim() || undefined,
        last_name: profileForm.lastName.trim() || undefined,
      });
      
      const nextProfile = {
        firstName: profile.first_name ?? "",
        lastName: profile.last_name ?? "",
      };

      setProfileForm(nextProfile);
      setInitialProfileForm(nextProfile);
      await refreshMe();

      showToast({
        title: "Profile updated",
        description: "Your profile information has been saved successfully.",
        tone: "success",
      });
    } catch (error) {
      setProfileError(
        getApiErrorMessage(
          error,
          "Unable to save your profile information right now.",
        ),
      );
    } finally {
      setIsSavingProfile(false);
    }
  };

  const validatePasswordForm = () => {
    setPasswordError("");

    if (!passwordForm.currentPassword.trim()) {
      setPasswordError("Current password is required.");
      return false;
    }

    if (!passwordForm.newPassword.trim()) {
      setPasswordError("New password is required.");
      return false;
    }

    if (!passwordForm.confirmPassword.trim()) {
      setPasswordError("Confirm new password is required.");
      return false;
    }

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordError("Confirm new password must match the new password.");
      return false;
    }

    return true;
  };

  const executeChangePassword = async () => {
    setIsChangingPassword(true);

    try {
      await authService.changePassword({
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
      });

      handleResetPassword();
      showToast({
        title: "Password updated",
        description: "Your password has been changed successfully.",
        tone: "success",
      });
    } catch (error) {
      setPasswordError(
        getApiErrorMessage(error, "Unable to change your password right now."),
      );
    } finally {
      setIsChangingPassword(false);
    }
  };

  const confirmChangePassword = async () => {
    const confirmed = await confirm({
      title: "Confirm Password Change",
      message:
        "Are you sure you want to update your password? You may need to use your new password the next time you sign in.",
      confirmLabel: "Continue",
      cancelLabel: "Cancel",
      accent: "violet",
    });

    if (!confirmed) {
      return;
    }

    await executeChangePassword();
  };

  const handleChangePassword = async (
    event: React.FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();

    if (!validatePasswordForm()) {
      return;
    }

    await confirmChangePassword();
  };

  if (isLoadingProfile) {
    return (
      <div className="mx-auto flex w-full max-w-350 flex-col gap-6">
        <Card className={pageCardClassName}>
          <div className="h-8 w-52 animate-pulse rounded bg-zinc-200 dark:bg-zinc-800" />
          <div className="mt-10 grid gap-6 md:grid-cols-2">
            <div className="h-20 animate-pulse rounded-xl bg-zinc-100 dark:bg-zinc-900" />
            <div className="h-20 animate-pulse rounded-xl bg-zinc-100 dark:bg-zinc-900" />
          </div>
          <div className="mt-8 h-24 animate-pulse rounded-2xl bg-zinc-100 dark:bg-zinc-900" />
          <div className="mt-8 flex gap-4">
            <div className="h-10 w-32 animate-pulse rounded-xl bg-zinc-200 dark:bg-zinc-800" />
            <div className="h-10 w-20 animate-pulse rounded-xl bg-zinc-200 dark:bg-zinc-800" />
          </div>
        </Card>
        <Card className={pageCardClassName}>
          <div className="h-8 w-56 animate-pulse rounded bg-zinc-200 dark:bg-zinc-800" />
          <div className="mt-10 h-20 animate-pulse rounded-xl bg-zinc-100 dark:bg-zinc-900" />
          <div className="mt-6 grid gap-6 md:grid-cols-2">
            <div className="h-20 animate-pulse rounded-xl bg-zinc-100 dark:bg-zinc-900" />
            <div className="h-20 animate-pulse rounded-xl bg-zinc-100 dark:bg-zinc-900" />
          </div>
          <div className="mt-8 h-32 animate-pulse rounded-2xl bg-zinc-100 dark:bg-zinc-900" />
        </Card>
      </div>
    );
  }

  return (
    <div className="mx-auto flex w-full max-w-10xl flex-col gap-6">
      <Card className={pageCardClassName}>
        <h1 className="text-2xl font-semibold text-zinc-800 dark:text-zinc-100 sm:text-[1.95rem]">
          Profile Information
        </h1>
        <ProfileForm
          inputClassName={inputClassName}
          helperPanelClassName={helperPanelClassName}
          primaryButtonClassName={primaryButtonClassName}
          subtleButtonClassName={subtleButtonClassName}
          firstName={profileForm.firstName}
          lastName={profileForm.lastName}
          error={profileError}
          isSaving={isSavingProfile}
          canSave={canSaveProfile}
          onFirstNameChange={(value) => updateProfileField("firstName", value)}
          onLastNameChange={(value) => updateProfileField("lastName", value)}
          onSubmit={handleSaveProfile}
          onReset={handleResetProfile}
        />
      </Card>

      <Card className={pageCardClassName}>
        <h2 className="text-2xl font-semibold text-zinc-800 dark:text-zinc-100 sm:text-[1.95rem]">
          Change Password
        </h2>

        <form className="mt-6 sm:mt-8" onSubmit={handleChangePassword} noValidate>
          <PasswordField
            id="current-password"
            label="Current Password"
            value={passwordForm.currentPassword}
            visible={passwordVisibility.currentPassword}
            placeholder="Enter your current password"
            onChange={(value) => updatePasswordField("currentPassword", value)}
            onToggle={() =>
              setPasswordVisibility((current) => ({
                ...current,
                currentPassword: !current.currentPassword,
              }))
            }
          />

          <div className="mt-6 grid gap-6 md:grid-cols-2">
            <PasswordField
              id="new-password"
              label="New Password"
              value={passwordForm.newPassword}
              visible={passwordVisibility.newPassword}
              placeholder="Enter your new password"
              onChange={(value) => updatePasswordField("newPassword", value)}
              onToggle={() =>
                setPasswordVisibility((current) => ({
                  ...current,
                  newPassword: !current.newPassword,
                }))
              }
            />

            <PasswordField
              id="confirm-password"
              label="Confirm New Password"
              value={passwordForm.confirmPassword}
              visible={passwordVisibility.confirmPassword}
              placeholder="Confirm your new password"
              onChange={(value) =>
                updatePasswordField("confirmPassword", value)
              }
              onToggle={() =>
                setPasswordVisibility((current) => ({
                  ...current,
                  confirmPassword: !current.confirmPassword,
                }))
              }
            />
          </div>

          <div className={`mt-8 ${helperPanelClassName}`}>
            <p className="font-semibold text-zinc-800 dark:text-zinc-100">Password Requirements:</p>
            <ul className="mt-3 list-disc space-y-2 pl-5 text-zinc-600 dark:text-zinc-400">
              <li>Minimum 8 characters long.</li>
              <li>Include at least one lowercase letter.</li>
              <li>Include at least one number or symbol.</li>
            </ul>
            <button
              type="button"
              className="mt-4 text-sm font-medium text-zinc-700 underline-offset-4 transition hover:text-zinc-900 hover:underline dark:text-zinc-300 dark:hover:text-zinc-100"
              onClick={() => setIsResetPasswordModalOpen(true)}
            >
              Forgot your current password? Reset it with a PIN instead.
            </button>
          </div>

          {passwordError ? (
            <div className="mt-6 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700 dark:border-rose-900 dark:bg-rose-950/40 dark:text-rose-300">
              {passwordError}
            </div>
          ) : null}

          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:gap-4">
            <Button
              type="submit"
              disabled={!canSavePassword}
              className={`${primaryButtonClassName} w-full sm:w-auto`}
            >
              {isChangingPassword ? "Saving..." : "Save changes"}
            </Button>

            <Button
              type="button"
              variant="secondary"
              className={`${subtleButtonClassName} w-full sm:w-auto`}
              onClick={handleResetPassword}
            >
              Reset
            </Button>
          </div>
        </form>
      </Card>

      <ResetPasswordPinModal
        open={isResetPasswordModalOpen}
        initialEmail={user?.email ?? ""}
        onClose={() => setIsResetPasswordModalOpen(false)}
      />
    </div>
  );
};

