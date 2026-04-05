import type { FormEvent, MouseEvent } from 'react';

import { Button } from '@shared/components/actions/Button';
import { SideDrawer } from '@shared/components/overlay/SideDrawer';
import { RichTextField } from '@shared/components/form/RichTextField';

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
  isCanceling?: boolean;
  title?: string;
  submitLabel?: string;
  errors?: Partial<Record<keyof InterviewFormValues | 'form', string>>;
  showCancelInterviewAction?: boolean;
  secondaryActionLabel?: string;
  secondaryActionDisabled?: boolean;
  onSecondaryAction?: () => void | Promise<void>;
  onClose: () => void;
  onChange: (field: keyof InterviewFormValues, value: string) => void;
  onCancelInterview?: () => void | Promise<void>;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void | Promise<void>;
}

/**
 * Modal used to collect interview scheduling details before advancing the candidate.
 */
export const InterviewModal = ({
  open,
  form,
  isSubmitting = false,
  isCanceling = false,
  title = 'Set Interview',
  submitLabel = 'Confirm Interview',
  errors,
  showCancelInterviewAction = false,
  secondaryActionLabel,
  secondaryActionDisabled = false,
  onSecondaryAction,
  onClose,
  onChange,
  onCancelInterview,
  onSubmit,
}: InterviewModalProps) => {
  if (!open) {
    return null;
  }

  const hourOptions = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'];
  const minuteOptions = ['00', '15', '30', '45'];

  return (
    <SideDrawer
      open={open}
      title={title}
      description="Update the interview schedule and candidate-facing details."
      onClose={onClose}
      widthClassName="sm:max-w-[460px]"
      contentClassName="px-5 py-5"
    >
      <form
        className="space-y-3"
        onClick={(event: MouseEvent<HTMLFormElement>) => {
          // Stop propagation so interactions inside the modal do not re-trigger page handlers.
          event.stopPropagation();
        }}
        onSubmit={onSubmit}
      >
        {errors?.form ? (
          <div className="rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700 dark:border-rose-900/70 dark:bg-rose-950/30 dark:text-rose-300">
            {errors.form}
          </div>
        ) : null}
        <div className="grid grid-cols-1 gap-2">
          <div className="space-y-1">
            <input required type="date" className="w-full rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-3 py-2 text-sm text-zinc-800 dark:text-zinc-100 focus:border-zinc-700 dark:focus:border-zinc-300 focus:ring-zinc-200 dark:focus:ring-zinc-800" style={{ colorScheme: 'light dark' }} value={form.date} onChange={(event) => onChange('date', event.target.value)} />
            {errors?.date ? <p className="text-xs text-rose-600 dark:text-rose-400">{errors.date}</p> : null}
          </div>
          <div className="space-y-1">
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">Interview Time</label>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">Select the time the interview will begin.</p>
            <div className="grid grid-cols-3 gap-2">
              <select
                required
                className="rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-3 py-2 text-sm text-zinc-800 dark:text-zinc-100 focus:border-zinc-700 dark:focus:border-zinc-300 focus:ring-4 focus:ring-zinc-200 dark:focus:ring-zinc-800"
                style={{ colorScheme: 'light dark' }}
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
                className="rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-3 py-2 text-sm text-zinc-800 dark:text-zinc-100 focus:border-zinc-700 dark:focus:border-zinc-300 focus:ring-4 focus:ring-zinc-200 dark:focus:ring-zinc-800"
                style={{ colorScheme: 'light dark' }}
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
                className="rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-3 py-2 text-sm text-zinc-800 dark:text-zinc-100 focus:border-zinc-700 dark:focus:border-zinc-300 focus:ring-4 focus:ring-zinc-200 dark:focus:ring-zinc-800"
                style={{ colorScheme: 'light dark' }}
                value={form.meridiem}
                onChange={(event) => onChange('meridiem', event.target.value as InterviewFormValues['meridiem'])}
              >
                <option value="AM">AM</option>
                <option value="PM">PM</option>
              </select>
            </div>
            {errors?.hour ? <p className="text-xs text-rose-600 dark:text-rose-400">{errors.hour}</p> : null}
          </div>
        </div>
        <div className="space-y-1">
          <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
            Interview type
            <select
              className="mt-1 w-full rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-3 py-2 text-sm text-zinc-800 dark:text-zinc-100 focus:border-zinc-700 dark:focus:border-zinc-300 focus:ring-4 focus:ring-zinc-200 dark:focus:ring-zinc-800"
              style={{ colorScheme: 'light dark' }}
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
          {errors?.mode ? <p className="text-xs text-rose-600 dark:text-rose-400">{errors.mode}</p> : null}
        </div>
        <div className="space-y-1">
          <input
            required
            type={form.mode === 'Virtual' ? 'url' : 'text'}
            className="w-full rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-3 py-2 text-sm text-zinc-800 dark:text-zinc-100 placeholder:text-zinc-500 dark:placeholder:text-zinc-400 focus:border-zinc-700 dark:focus:border-zinc-300 focus:ring-4 focus:ring-zinc-200 dark:focus:ring-zinc-800"
            placeholder={form.mode === 'Virtual' ? 'Meeting link' : 'Location / Address'}
            value={form.location}
            onChange={(event) => onChange('location', event.target.value)}
          />
          {errors?.location ? <p className="text-xs text-rose-600 dark:text-rose-400">{errors.location}</p> : null}
        </div>
        <RichTextField
          label="Notes"
          value={form.notes}
          onChange={(value) => onChange('notes', value)}
          placeholder="Share interview notes, expectations, or context."
          error={errors?.notes}
          minHeightClassName="min-h-[160px]"
        />
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
          <div>
            {showCancelInterviewAction && onCancelInterview ? (
              <Button
                type="button"
                variant="secondary"
                loading={isCanceling}
                loadingText="Cancelling"
                disabled={isSubmitting}
                className="rounded-lg border-rose-200 bg-rose-50 text-rose-700 hover:bg-rose-100 dark:border-rose-900/70 dark:bg-rose-950/30 dark:text-rose-300 dark:hover:bg-rose-950/50"
                onClick={(event) => {
                  event.stopPropagation();
                  void onCancelInterview();
                }}
              >
                Cancel Interview
              </Button>
            ) : null}
          </div>

          <div className="flex justify-end gap-2">
            {secondaryActionLabel && onSecondaryAction ? (
              <Button
                type="button"
                disabled={secondaryActionDisabled || isSubmitting}
                variant="secondary"
                className="rounded-lg"
                onClick={(event) => {
                  event.stopPropagation();
                  void onSecondaryAction();
                }}
              >
                {secondaryActionLabel}
              </Button>
            ) : null}
            <Button
              type="button"
              disabled={isSubmitting}
              variant="secondary"
              className="rounded-lg"
              onClick={(event) => {
                // Stop propagation so cancel only closes the active modal.
                event.stopPropagation();
                onClose();
              }}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              loading={isSubmitting}
              loadingText="Saving"
              className="rounded-lg"
            >
              {submitLabel}
            </Button>
          </div>
        </div>
      </form>
    </SideDrawer>
  );
};

