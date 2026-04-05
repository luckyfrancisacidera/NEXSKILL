import { useState, type FormEvent } from 'react';
import { Button } from '@shared/components/actions/Button';
import { ModalOverlay } from '@shared/components/overlay/ModalOverlay';
import type { CreateCompanyAccountPayload } from '@features/admin/types/admin.type';
import { AdminPasswordField } from '@features/admin/components/AdminPasswordField';

interface CreateCompanyModalProps {
  open: boolean;
  isSubmitting: boolean;
  error: string | null;
  onClose: () => void;
  onSubmit: (payload: CreateCompanyAccountPayload) => Promise<void>;
}

const inputClassName = 'mt-2 w-full rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm text-zinc-900 outline-none transition focus:border-zinc-400 focus:bg-white dark:bg-transparent dark:border-zinc-700 dark:text-zinc-100 dark:hover:border-zinc-600 dark:focus:bg-zinc-800/50';

export const CreateCompanyModal = ({ open, isSubmitting, error, onClose, onSubmit }: CreateCompanyModalProps) => {
  const [name, setName] = useState('');
  const [primaryEmail, setPrimaryEmail] = useState('');
  const [location, setLocation] = useState('');
  const [adminEmail, setAdminEmail] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [showAdminPassword, setShowAdminPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  if (!open) {
    return null;
  }

  const validatePasswords = () => {
    if (!adminPassword) {
      setPasswordError('Password is required.');
      return false;
    }

    if (!confirmPassword) {
      setPasswordError('Confirm password is required.');
      return false;
    }

    if (adminPassword !== confirmPassword) {
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
        name: name.trim(),
        primaryEmail: primaryEmail.trim() || undefined,
        location: location.trim() || undefined,
        adminEmail: adminEmail.trim(),
        adminPassword,
      });

      setName('');
      setPrimaryEmail('');
      setLocation('');
      setAdminEmail('');
      setAdminPassword('');
      setConfirmPassword('');
      setPasswordError(null);
    } catch {
      // The parent surfaces the error state for the modal body.
    }
  };

  return (
    <ModalOverlay onClose={onClose}>
      <div className="scrollbar-thin-stable flex max-h-[90vh] w-full max-w-[calc(100vw-2rem)] flex-col overflow-y-auto overflow-x-hidden rounded-[28px] border border-zinc-200 bg-white px-4 py-4 shadow-2xl dark:border-zinc-800 dark:bg-zinc-900 sm:w-[90%] md:w-[80%] md:px-6 md:py-6 lg:w-full lg:max-w-xl xl:max-w-2xl">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-zinc-500 dark:text-zinc-400">Super Admin</p>
            <h2 className="mt-2 text-2xl font-semibold text-zinc-950 dark:text-zinc-100">Create company account</h2>
            <p className="mt-2 break-words text-sm leading-6 text-zinc-500 dark:text-zinc-400">
              Add a company tenant and provision the initial company admin in one flow.
            </p>
          </div>
          <Button type="button" variant="secondary" onClick={onClose} className="w-full sm:w-auto">Close</Button>
        </div>

        <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
          <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-100">
            Company name
            <input className={inputClassName} value={name} onChange={(event) => setName(event.target.value)} required />
          </label>

          <div className="space-y-4">
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-100">
              Primary email
              <input type="email" className={inputClassName} value={primaryEmail} onChange={(event) => setPrimaryEmail(event.target.value)} placeholder="hello@company.com" />
            </label>
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-100">
              Location
              <input className={inputClassName} value={location} onChange={(event) => setLocation(event.target.value)} placeholder="Singapore" />
            </label>
          </div>

          <div className="space-y-4">
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-100">
              Company admin email
              <input type="email" className={inputClassName} value={adminEmail} onChange={(event) => setAdminEmail(event.target.value)} required />
            </label>
            <AdminPasswordField
              label="Initial admin password"
              value={adminPassword}
              visible={showAdminPassword}
              ariaLabel={showAdminPassword ? 'Hide password' : 'Show password'}
              onChange={(value) => {
                setAdminPassword(value);
                if (confirmPassword) {
                  void validatePasswords();
                }
              }}
              onBlur={validatePasswords}
              onToggleVisibility={() => setShowAdminPassword((current) => !current)}
              error={passwordError ?? undefined}
            />
          </div>

          <div className="space-y-4">
            <AdminPasswordField
              label="Confirm password"
              value={confirmPassword}
              visible={showConfirmPassword}
              ariaLabel={showConfirmPassword ? 'Hide confirm password' : 'Show confirm password'}
              onChange={(value) => {
                setConfirmPassword(value);
                if (adminPassword) {
                  void validatePasswords();
                }
              }}
              onBlur={validatePasswords}
              onToggleVisibility={() => setShowConfirmPassword((current) => !current)}
              error={passwordError ?? undefined}
            />
          </div>

          {error ? <div className="rounded-xl border border-rose-200 dark:border-rose-900 bg-rose-50 dark:bg-rose-950/40 px-4 py-3 text-sm text-rose-700 dark:text-rose-300">{error}</div> : null}

          <div className="flex flex-col gap-3 pt-2 sm:flex-row sm:justify-end">
            <Button type="button" variant="secondary" onClick={onClose} className="w-full sm:w-auto">Cancel</Button>
            <Button type="submit" loading={isSubmitting} loadingText="Creating company">
              Create company
            </Button>
          </div>
        </form>
      </div>
    </ModalOverlay>
  );
};

