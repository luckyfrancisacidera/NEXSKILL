import type { FormEvent, MouseEvent } from 'react';

import { ModalOverlay } from '@shared/components/ModalOverlay';
import { RichTextField } from '@shared/components/RichTextField';

export interface OfferFormValues {
  role: string;
  packageSummary: string;
  startDate: string;
  message: string;
}

export interface OfferModalProps {
  open: boolean;
  form: OfferFormValues;
  onClose: () => void;
  onChange: (field: keyof OfferFormValues, value: string) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void | Promise<void>;
}

/**
 * Modal used to collect offer details before advancing the candidate.
 */
export const OfferModal = ({ open, form, onClose, onChange, onSubmit }: OfferModalProps) => {
  if (!open) {
    return null;
  }

  return (
    <ModalOverlay onClose={onClose}>
      <form
        className="space-y-3 rounded-2xl bg-white p-5 shadow-2xl ring-1 ring-violet-200"
        onClick={(event: MouseEvent<HTMLFormElement>) => {
          // Stop propagation so interactions inside the modal do not re-trigger page handlers.
          event.stopPropagation();
        }}
        onSubmit={onSubmit}
      >
        <h3 className="text-lg font-semibold">Create Offer</h3>
        <input required className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm" placeholder="Role/title" value={form.role} onChange={(event) => onChange('role', event.target.value)} />
        <input required className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm" placeholder="Compensation/package summary" value={form.packageSummary} onChange={(event) => onChange('packageSummary', event.target.value)} />
        <input required type="date" className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm" value={form.startDate} onChange={(event) => onChange('startDate', event.target.value)} />
        <RichTextField
          label="Message"
          value={form.message}
          onChange={(value) => onChange('message', value)}
          placeholder="Message (optional)"
          helperText="Add a polished note to frame the offer or next steps."
          minHeightClassName="min-h-[150px]"
        />
        <div className="flex justify-end gap-2">
          <button
            type="button"
            className="rounded-lg border border-zinc-300 px-4 py-2 text-sm font-semibold"
            onClick={(event) => {
              // Stop propagation so cancel only closes the active modal.
              event.stopPropagation();
              onClose();
            }}
          >
            Cancel
          </button>
          <button type="submit" className="rounded-lg bg-zinc-800 px-4 py-2 text-sm font-semibold text-white">Send Offer</button>
        </div>
      </form>
    </ModalOverlay>
  );
};
