import { useState, type FormEvent } from 'react';
import { Button } from '@shared/components/Button';
import { ModalOverlay } from '@shared/components/ModalOverlay';
import type { CreateManagedRecruiterPayload } from '@features/admin/types/admin.type';

interface CreateRecruiterModalProps {
  open: boolean;
  companyName: string;
  isSubmitting: boolean;
  error: string | null;
  onClose: () => void;
  onSubmit: (payload: CreateManagedRecruiterPayload) => Promise<void>;
}

const inputClassName = 'mt-2 w-full rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm text-zinc-900 outline-none transition focus:border-zinc-400 focus:bg-white';

export const CreateRecruiterModal = ({
  open,
  companyName,
  isSubmitting,
  error,
  onClose,
  onSubmit,
}: CreateRecruiterModalProps) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  if (!open) {
    return null;
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    try {
      await onSubmit({
        email: email.trim(),
        password,
      });

      setEmail('');
      setPassword('');
    } catch {
      // The parent surfaces the error state for the modal body.
    }
  };

  return (
    <ModalOverlay onClose={onClose}>
      <div className="rounded-[28px] border border-zinc-200 bg-white p-6 shadow-2xl">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-zinc-500">Company Admin</p>
            <h2 className="mt-2 text-2xl font-semibold text-zinc-950">Create recruiter account</h2>
            <p className="mt-2 text-sm leading-6 text-zinc-500">
              Provision a recruiter for {companyName} and share a temporary password for first sign-in.
            </p>
          </div>
          <Button type="button" variant="secondary" onClick={onClose}>Close</Button>
        </div>

        <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
          <label className="block text-sm font-medium text-zinc-700">
            Recruiter email
            <input type="email" className={inputClassName} value={email} onChange={(event) => setEmail(event.target.value)} placeholder="recruiter@company.com" required />
          </label>

          <label className="block text-sm font-medium text-zinc-700">
            Temporary password
            <input type="password" className={inputClassName} value={password} onChange={(event) => setPassword(event.target.value)} placeholder="Minimum 8 characters" required />
          </label>

          {error ? <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</div> : null}

          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="secondary" onClick={onClose}>Cancel</Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Creating recruiter...' : 'Create recruiter'}
            </Button>
          </div>
        </form>
      </div>
    </ModalOverlay>
  );
};

