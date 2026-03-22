import type { FormEvent } from "react";
import { Button } from "@shared/components/Button";

type ProfileFormProps = {
  inputClassName: string;
  helperPanelClassName: string;
  primaryButtonClassName: string;
  subtleButtonClassName: string;
  firstName: string;
  lastName: string;
  error: string;
  isSaving: boolean;
  canSave: boolean;
  onFirstNameChange: (value: string) => void;
  onLastNameChange: (value: string) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  onReset: () => void;
};

export const ProfileForm = ({
  inputClassName,
  primaryButtonClassName,
  subtleButtonClassName,
  firstName,
  lastName,
  error,
  isSaving,
  canSave,
  onFirstNameChange,
  onLastNameChange,
  onSubmit,
  onReset,
}: ProfileFormProps) => (
  <form className="mt-8" onSubmit={onSubmit} noValidate>

    <div className="grid gap-6 md:grid-cols-2">
      <label className="block">
        <span className="mb-3 block text-sm font-medium text-zinc-800 dark:text-zinc-100">
          First Name
        </span>
        <input
          className={inputClassName}
          value={firstName}
          onChange={(event) => onFirstNameChange(event.target.value)}
          placeholder="Enter your first name"
        />
      </label>

      <label className="block">
        <span className="mb-3 block text-sm font-medium text-zinc-800 dark:text-zinc-100">
          Last Name
        </span>
        <input
          className={inputClassName}
          value={lastName}
          onChange={(event) => onLastNameChange(event.target.value)}
          placeholder="Enter your last name"
        />
      </label>
    </div>

    {error ? (
      <div className="mt-6 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700 dark:border-rose-900 dark:bg-rose-950/40 dark:text-rose-300">
        {error}
      </div>
    ) : null}

    <div className="mt-8 flex flex-wrap items-center gap-4">
      <Button
        type="submit"
        disabled={!canSave}
        className={primaryButtonClassName}
      >
        {isSaving ? "Saving..." : "Save changes"}
      </Button>

      <Button
        type="button"
        variant="secondary"
        className={subtleButtonClassName}
        onClick={onReset}
      >
        Reset
      </Button>
    </div>
  </form>
);
