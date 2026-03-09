import type { FormEvent } from 'react';

import { ModalOverlay } from '@shared/components/ModalOverlay';

export interface InterviewFormValues {
  date: string;
  time: string;
  mode: string;
  location: string;
  notes: string;
}

export interface InterviewModalProps {
  open: boolean;
  form: InterviewFormValues;
  onClose: () => void;
  onChange: (field: keyof InterviewFormValues, value: string) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void | Promise<void>;
}

/**
 * Modal used to collect interview scheduling details before advancing the candidate.
 */
export const InterviewModal = ({ open, form, onClose, onChange, onSubmit }: InterviewModalProps) => {
  if (!open) {
    return null;
  }

  return (
    <ModalOverlay onClose={onClose}>
      <form className="space-y-3 rounded-2xl bg-white p-5 shadow-2xl ring-1 ring-violet-200" onSubmit={onSubmit}>
        <h3 className="text-lg font-semibold">Set Interview</h3>
        <div className="grid grid-cols-2 gap-2">
          <input required type="date" className="rounded-lg border border-zinc-300 px-3 py-2 text-sm" value={form.date} onChange={(event) => onChange('date', event.target.value)} />
          <input required type="time" className="rounded-lg border border-zinc-300 px-3 py-2 text-sm" value={form.time} onChange={(event) => onChange('time', event.target.value)} />
        </div>
        <input required className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm" placeholder="Mode (Virtual/Onsite)" value={form.mode} onChange={(event) => onChange('mode', event.target.value)} />
        <input required className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm" placeholder="Meeting link/location" value={form.location} onChange={(event) => onChange('location', event.target.value)} />
        <textarea className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm" rows={3} placeholder="Notes (optional)" value={form.notes} onChange={(event) => onChange('notes', event.target.value)} />
        <div className="flex justify-end gap-2">
          <button type="button" className="rounded-lg border border-zinc-300 px-4 py-2 text-sm font-semibold" onClick={onClose}>Cancel</button>
          <button type="submit" className="rounded-lg bg-zinc-800 px-4 py-2 text-sm font-semibold text-white">Confirm Interview</button>
        </div>
      </form>
    </ModalOverlay>
  );
};
