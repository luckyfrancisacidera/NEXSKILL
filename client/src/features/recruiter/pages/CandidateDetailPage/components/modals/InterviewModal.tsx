import type { FormEvent, MouseEvent } from 'react';

import { ModalOverlay } from '@shared/components/ModalOverlay';

export interface InterviewFormValues {
  date: string;
  hour: string;
  minute: string;
  meridiem: 'AM' | 'PM';
  mode: 'Virtual' | 'Onsite';
  location: string;
  notes: string;
}

export interface InterviewModalProps {
  open: boolean;
  form: InterviewFormValues;
  isSubmitting?: boolean;
  title?: string;
  submitLabel?: string;
  errors?: Partial<Record<keyof InterviewFormValues | 'form', string>>;
  onClose: () => void;
  onChange: (field: keyof InterviewFormValues, value: string) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void | Promise<void>;
}

/**
 * Modal used to collect interview scheduling details before advancing the candidate.
 */
export const InterviewModal = ({
  open,
  form,
  isSubmitting = false,
  title = 'Set Interview',
  submitLabel = 'Confirm Interview',
  errors,
  onClose,
  onChange,
  onSubmit,
}: InterviewModalProps) => {
  if (!open) {
    return null;
  }

  const hourOptions = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'];
  const minuteOptions = ['00', '15', '30', '45'];

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
        <h3 className="text-lg font-semibold">{title}</h3>
        {errors?.form ? <p className="text-sm text-rose-600">{errors.form}</p> : null}
        <div className="grid grid-cols-1 gap-2">
          <div className="space-y-1">
            <input required type="date" className="rounded-lg border border-zinc-300 px-3 py-2 text-sm" value={form.date} onChange={(event) => onChange('date', event.target.value)} />
            {errors?.date ? <p className="text-xs text-rose-600">{errors.date}</p> : null}
          </div>
          <div className="space-y-1">
            <label className="block text-sm font-medium text-zinc-700">Interview Time</label>
            <p className="text-xs text-zinc-500">Select the time the interview will begin.</p>
            <div className="grid grid-cols-3 gap-2">
              <select
                required
                className="rounded-lg border border-zinc-300 px-3 py-2 text-sm"
                value={form.hour}
                onChange={(event) => onChange('hour', event.target.value)}
              >
                {hourOptions.map((hour) => (
                  <option key={hour} value={hour}>
                    {hour}
                  </option>
                ))}
              </select>
              <select
                required
                className="rounded-lg border border-zinc-300 px-3 py-2 text-sm"
                value={form.minute}
                onChange={(event) => onChange('minute', event.target.value)}
              >
                {minuteOptions.map((minute) => (
                  <option key={minute} value={minute}>
                    {minute}
                  </option>
                ))}
              </select>
              <select
                required
                className="rounded-lg border border-zinc-300 px-3 py-2 text-sm"
                value={form.meridiem}
                onChange={(event) => onChange('meridiem', event.target.value as InterviewFormValues['meridiem'])}
              >
                <option value="AM">AM</option>
                <option value="PM">PM</option>
              </select>
            </div>
            {errors?.hour ? <p className="text-xs text-rose-600">{errors.hour}</p> : null}
          </div>
        </div>
        <div className="space-y-1">
          <label className="block text-sm font-medium text-zinc-700">
            Interview type
            <select
              className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm"
              value={form.mode}
              onChange={(event) => {
                // Interview types determine whether recruiters must provide a meeting link or an onsite address.
                onChange('mode', event.target.value as InterviewFormValues['mode']);
                onChange('location', '');
              }}
            >
              <option value="Virtual">Virtual</option>
              <option value="Onsite">Onsite</option>
            </select>
          </label>
          {errors?.mode ? <p className="text-xs text-rose-600">{errors.mode}</p> : null}
        </div>
        <div className="space-y-1">
          <input
            required
            type={form.mode === 'Virtual' ? 'url' : 'text'}
            className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm"
            placeholder={form.mode === 'Virtual' ? 'Meeting link' : 'Location / Address'}
            value={form.location}
            onChange={(event) => onChange('location', event.target.value)}
          />
          {errors?.location ? <p className="text-xs text-rose-600">{errors.location}</p> : null}
        </div>
        <div className="space-y-1">
          <textarea className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm" rows={3} placeholder="Notes (optional)" value={form.notes} onChange={(event) => onChange('notes', event.target.value)} />
          {errors?.notes ? <p className="text-xs text-rose-600">{errors.notes}</p> : null}
        </div>
        <div className="flex justify-end gap-2">
          <button
            type="button"
            disabled={isSubmitting}
            className="rounded-lg border border-zinc-300 px-4 py-2 text-sm font-semibold"
            onClick={(event) => {
              // Stop propagation so cancel only closes the active modal.
              event.stopPropagation();
              onClose();
            }}
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="rounded-lg bg-zinc-800 px-4 py-2 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSubmitting ? 'Saving...' : submitLabel}
          </button>
        </div>
      </form>
    </ModalOverlay>
  );
};
