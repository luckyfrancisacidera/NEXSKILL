import { useState, type FormEvent } from 'react';
import { Button } from '@shared/components/Button';
import { ModalOverlay } from '@shared/components/ModalOverlay';
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
      <div className="rounded-[28px] border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6 shadow-2xl">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-zinc-500 dark:text-zinc-400">Super Admin</p>
            <h2 className="mt-2 text-2xl font-semibold text-zinc-950 dark:text-zinc-100">Create company account</h2>
            <p className="mt-2 text-sm leading-6 text-zinc-500 dark:text-zinc-400">
              Add a company tenant and provision the initial company admin in one flow.
            </p>
          </div>
          <Button type="button" variant="secondary" onClick={onClose}>Close</Button>
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

          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="secondary" onClick={onClose}>Cancel</Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Creating company...' : 'Create company'}
            </Button>
          </div>
        </form>
      </div>
    </ModalOverlay>
  );
};

