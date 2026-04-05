import { useState, type FormEvent } from 'react';
import { Button } from '@shared/components/actions/Button';
import { ModalOverlay } from '@shared/components/overlay/ModalOverlay';
import { SideDrawer } from '@shared/components/overlay/SideDrawer';
import type { CreateManagedRecruiterPayload } from '@features/admin/types/admin.type';
import { AdminPasswordField } from '@features/admin/components/AdminPasswordField';
import { useMediaQuery } from '@shared/hooks/useMediaQuery';

interface CreateRecruiterModalProps {
  open: boolean;
  companyName: string;
  isSubmitting: boolean;
  error: string | null;
  onClose: () => void;
  onSubmit: (payload: CreateManagedRecruiterPayload) => Promise<void>;
}

const inputClassName = 'mt-2 w-full rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm text-zinc-900 outline-none transition focus:border-zinc-400 focus:bg-white dark:bg-transparent dark:border-zinc-700 dark:text-zinc-100 dark:hover:border-zinc-600 dark:focus:bg-zinc-800/50';

export const CreateRecruiterModal = ({
  open,
  companyName,
  isSubmitting,
  error,
  onClose,
  onSubmit,
}: CreateRecruiterModalProps) => {
  const isMobile = useMediaQuery('(max-width: 767px)');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  if (!open) {
    return null;
  }

  const validatePasswords = () => {
    if (!password) {
      setPasswordError('Password is required.');
      return false;
    }

    if (!confirmPassword) {
      setPasswordError('Confirm password is required.');
      return false;
    }

    if (password !== confirmPassword) {
      setPasswordError('Password and confirm password must match.');
      return false;
    }

    setPasswordError(null);
    return true;
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!validatePasswords()) {
      return;
    }

    try {
      await onSubmit({
        email: email.trim(),
        password,
      });

      setEmail('');
      setPassword('');
      setConfirmPassword('');
      setPasswordError(null);
    } catch {
      // The parent surfaces the error state for the modal body.
    }
  };

  const formContent = (
    <form className="space-y-4" onSubmit={handleSubmit}>
      {!isMobile ? (
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-zinc-500 dark:text-zinc-100">Company Admin</p>
            <h2 className="mt-2 text-2xl font-semibold text-zinc-950 dark:text-zinc-100">Create recruiter account</h2>
            <p className="mt-2 break-words text-sm leading-6 text-zinc-500 dark:text-zinc-100">
              Provision a recruiter for {companyName} and share a temporary password for first sign-in.
            </p>
          </div>
          <Button type="button" variant="secondary" onClick={onClose} className="w-full sm:w-auto">Close</Button>
        </div>
      ) : null}

      <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-100">
        Recruiter email
        <input type="email" className={inputClassName} value={email} onChange={(event) => setEmail(event.target.value)} placeholder="recruiter@company.com" required />
      </label>

      <AdminPasswordField
        label="Temporary password"
        value={password}
        placeholder="Minimum 8 characters"
        visible={showPassword}
        ariaLabel={showPassword ? 'Hide password' : 'Show password'}
        onChange={(value) => {
          setPassword(value);
          if (confirmPassword) {
            void validatePasswords();
          }
        }}
        onBlur={validatePasswords}
        onToggleVisibility={() => setShowPassword((current) => !current)}
        error={passwordError ?? undefined}
      />

      <AdminPasswordField
        label="Confirm password"
        value={confirmPassword}
        placeholder="Repeat temporary password"
        visible={showConfirmPassword}
        ariaLabel={showConfirmPassword ? 'Hide confirm password' : 'Show confirm password'}
        onChange={(value) => {
          setConfirmPassword(value);
          if (password) {
            void validatePasswords();
          }
        }}
        onBlur={validatePasswords}
        onToggleVisibility={() => setShowConfirmPassword((current) => !current)}
        error={passwordError ?? undefined}
      />

      {error ? <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700 dark:border-rose-900 dark:bg-rose-950/40 dark:text-rose-300">{error}</div> : null}

      <div className="flex flex-col gap-3 pt-2 sm:flex-row sm:justify-end">
        <Button type="button" variant="secondary" onClick={onClose} className="w-full sm:w-auto">Cancel</Button>
        <Button type="submit" loading={isSubmitting} loadingText="Creating recruiter" className="w-full sm:w-auto">
          Create recruiter
        </Button>
      </div>
    </form>
  );

  if (isMobile) {
    return (
      <SideDrawer
        open={open}
        title="Create recruiter account"
        description={`Provision a recruiter for ${companyName} and share a temporary password for first sign-in.`}
        onClose={onClose}
        widthClassName="max-w-full"
        contentClassName="px-4 py-4"
      >
        {formContent}
      </SideDrawer>
    );
  }

  return (
    <ModalOverlay onClose={onClose}>
      <div className="scrollbar-thin-stable flex max-h-[90vh] w-full max-w-[calc(100vw-2rem)] flex-col overflow-y-auto overflow-x-hidden rounded-[28px] border border-zinc-200 bg-white px-4 py-4 shadow-2xl dark:border-zinc-800 dark:bg-zinc-900 sm:w-[90%] md:w-[80%] md:px-6 md:py-6 lg:w-full lg:max-w-lg xl:max-w-xl">
        {formContent}
      </div>
    </ModalOverlay>
  );
};

