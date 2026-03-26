import type { FormEvent, MouseEvent } from 'react';

import { ModalOverlay } from '@shared/components/ModalOverlay';
import { RichTextField } from '@shared/components/RichTextField';

export interface OfferFormValues {
  title: string;
  salaryText: string;
  employmentType: string;
  startDate: string;
  expirationDate: string;
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
        className="space-y-4 rounded-3xl border border-zinc-200 bg-white p-6 shadow-2xl ring-1 ring-zinc-200 dark:border-zinc-700 dark:bg-zinc-900 dark:ring-zinc-700"
        onClick={(event: MouseEvent<HTMLFormElement>) => {
          // Stop propagation so interactions inside the modal do not re-trigger page handlers.
          event.stopPropagation();
        }}
        onSubmit={onSubmit}
      >
        <div className="space-y-1">
          <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">Send Offer</h3>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            Send a structured offer and keep the application in sync with the ATS pipeline.
          </p>
        </div>
        <input required className="w-full rounded-xl border border-zinc-300 px-3 py-2.5 text-sm text-zinc-900 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100" placeholder="Offer title" value={form.title} onChange={(event) => onChange('title', event.target.value)} />
        <input required className="w-full rounded-xl border border-zinc-300 px-3 py-2.5 text-sm text-zinc-900 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100" placeholder="Compensation or salary summary" value={form.salaryText} onChange={(event) => onChange('salaryText', event.target.value)} />
        <input required className="w-full rounded-xl border border-zinc-300 px-3 py-2.5 text-sm text-zinc-900 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100" placeholder="Employment type" value={form.employmentType} onChange={(event) => onChange('employmentType', event.target.value)} />
        <div className="grid gap-3 sm:grid-cols-2">
          <input required type="date" className="w-full rounded-xl border border-zinc-300 px-3 py-2.5 text-sm text-zinc-900 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100" value={form.startDate} onChange={(event) => onChange('startDate', event.target.value)} />
          <input type="date" className="w-full rounded-xl border border-zinc-300 px-3 py-2.5 text-sm text-zinc-900 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100" value={form.expirationDate} onChange={(event) => onChange('expirationDate', event.target.value)} />
        </div>
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
            className="rounded-xl border border-zinc-300 px-4 py-2 text-sm font-semibold text-zinc-700 dark:border-zinc-700 dark:text-zinc-200"
            onClick={(event) => {
              // Stop propagation so cancel only closes the active modal.
              event.stopPropagation();
              onClose();
            }}
          >
            Cancel
          </button>
          <button type="submit" className="rounded-xl bg-zinc-800 px-4 py-2 text-sm font-semibold text-white transition hover:bg-zinc-700">Send Offer</button>
        </div>
      </form>
    </ModalOverlay>
  );
};
