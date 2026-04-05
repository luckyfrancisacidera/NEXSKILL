import type { FormEvent, MouseEvent, ReactNode } from 'react';
import { CalendarCheck2, CircleX, X } from 'lucide-react';

import { Button } from '@shared/components/actions/Button';
import { DatePicker, Dropdown, type DropdownOption } from '@shared/components/form';
import { RichTextContent } from '@shared/components/data-display/RichTextContent';
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
  readOnly?: boolean;
  isSubmitting?: boolean;
  isCanceling?: boolean;
  title?: string;
  submitLabel?: ReactNode;
  errors?: Partial<Record<keyof InterviewFormValues | 'form', string>>;
  showCancelInterviewAction?: boolean;
  secondaryActionLabel?: ReactNode;
  secondaryActionDisabled?: boolean;
  cancelInterviewLabel?: ReactNode;
  closeLabel?: ReactNode;
  helperText?: ReactNode;
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
  readOnly = false,
  isSubmitting = false,
  isCanceling = false,
  title = 'Set Interview',
  submitLabel = (
    <>
      <CalendarCheck2 className="h-4 w-4" />
      <span>Confirm Interview</span>
    </>
  ),
  errors,
  showCancelInterviewAction = false,
  secondaryActionLabel,
  secondaryActionDisabled = false,
  cancelInterviewLabel = (
    <>
      <CircleX className="h-4 w-4" />
      <span>Cancel Interview</span>
    </>
  ),
  closeLabel = (
    <>
      <X className="h-4 w-4" />
      <span>Cancel Review</span>
    </>
  ),
  helperText,
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
  const minuteOptions = Array.from({ length: 60 }, (_, index) => String(index).padStart(2, '0'));
  const primaryActionClassName =
    'w-full rounded-lg border-transparent bg-zinc-900 text-zinc-50 hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-white';
  const secondaryActionClassName =
    'w-full rounded-lg border border-zinc-200 bg-zinc-100 text-zinc-800 hover:bg-zinc-200 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 dark:hover:bg-zinc-800';
  const hourDropdownOptions: DropdownOption[] = hourOptions.map((hour) => ({ value: hour, label: hour }));
  const minuteDropdownOptions: DropdownOption[] = minuteOptions.map((minute) => ({ value: minute, label: minute }));
  const meridiemDropdownOptions: DropdownOption[] = [
    { value: 'AM', label: 'AM' },
    { value: 'PM', label: 'PM' },
  ];
  const interviewTypeOptions: DropdownOption[] = [
    { value: 'Virtual', label: 'Virtual' },
    { value: 'Onsite', label: 'Onsite' },
  ];

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
            <DatePicker
              label="Interview date"
              value={form.date}
              disabled={readOnly}
              onChange={(value) => onChange('date', value)}
            />
            {errors?.date ? <p className="text-xs text-rose-600 dark:text-rose-400">{errors.date}</p> : null}
          </div>
          <div className="space-y-1">
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">Interview Time</label>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">Select the time the interview will begin.</p>
            <div className="grid grid-cols-3 gap-2">
              <Dropdown
                name="hour"
                value={form.hour}
                options={hourDropdownOptions}
                disabled={readOnly}
                compactOnMobile={false}
                buttonClassName="h-10 rounded-lg"
                onChange={(event) => onChange('hour', event.target.value)}
              />
              <Dropdown
                name="minute"
                value={form.minute}
                options={minuteDropdownOptions}
                disabled={readOnly}
                compactOnMobile={false}
                buttonClassName="h-10 rounded-lg"
                onChange={(event) => onChange('minute', event.target.value)}
              />
              <Dropdown
                name="meridiem"
                value={form.meridiem}
                options={meridiemDropdownOptions}
                disabled={readOnly}
                compactOnMobile={false}
                buttonClassName="h-10 rounded-lg"
                onChange={(event) => onChange('meridiem', event.target.value as InterviewFormValues['meridiem'])}
              />
            </div>
            {errors?.hour ? <p className="text-xs text-rose-600 dark:text-rose-400">{errors.hour}</p> : null}
          </div>
        </div>
        <div className="space-y-1">
          <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
            Interview type
            <Dropdown
              name="mode"
              disabled={readOnly}
              value={form.mode}
              options={interviewTypeOptions}
              className="mt-1"
              compactOnMobile={false}
              buttonClassName="h-10 rounded-lg"
              onChange={(event) => {
                // Interview types determine whether recruiters must provide a meeting link or an onsite address.
                onChange('mode', event.target.value as InterviewFormValues['mode']);
                onChange('location', '');
              }}
            />
          </label>
          {errors?.mode ? <p className="text-xs text-rose-600 dark:text-rose-400">{errors.mode}</p> : null}
        </div>
        <div className="space-y-1">
          <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
            {form.mode === 'Virtual' ? 'Meeting link' : 'Interview location'}
          </label>
          <input
            required
            type={form.mode === 'Virtual' ? 'url' : 'text'}
            disabled={readOnly}
            className="w-full rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-3 py-2 text-sm text-zinc-800 dark:text-zinc-100 placeholder:text-zinc-500 dark:placeholder:text-zinc-400 focus:border-zinc-700 dark:focus:border-zinc-300 focus:ring-4 focus:ring-zinc-200 disabled:cursor-not-allowed disabled:opacity-70 dark:focus:ring-zinc-800"
            placeholder={form.mode === 'Virtual' ? 'Meeting link' : 'Location / Address'}
            value={form.location}
            onChange={(event) => onChange('location', event.target.value)}
          />
          {errors?.location ? <p className="text-xs text-rose-600 dark:text-rose-400">{errors.location}</p> : null}
        </div>
        {readOnly ? (
          form.notes ? (
            <div className="rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-3 dark:border-zinc-800 dark:bg-zinc-900/60">
              <p className="mb-2 text-sm font-medium text-zinc-700 dark:text-zinc-300">Notes</p>
              <RichTextContent html={form.notes} />
            </div>
          ) : null
        ) : (
          <>
            <RichTextField
              label="Notes"
              value={form.notes}
              onChange={(value) => onChange('notes', value)}
              placeholder="Share interview notes, expectations, or context."
              error={errors?.notes}
              minHeightClassName="min-h-[160px]"
            />
            <div className="space-y-2 pt-2">
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                {secondaryActionLabel ? (
                  <Button
                    type="button"
                    disabled={secondaryActionDisabled || isSubmitting || !onSecondaryAction}
                    className={primaryActionClassName}
                    onClick={(event) => {
                      event.stopPropagation();
                      if (!onSecondaryAction) {
                        return;
                      }

                      void onSecondaryAction();
                    }}
                  >
                    {secondaryActionLabel}
                  </Button>
                ) : (
                  <Button
                    type="submit"
                    loading={isSubmitting}
                    loadingText="Saving"
                    className={primaryActionClassName}
                  >
                    {submitLabel}
                  </Button>
                )}
                <Button
                  type="button"
                  disabled={isSubmitting}
                  variant="secondary"
                  className={secondaryActionClassName}
                  onClick={(event) => {
                    event.stopPropagation();
                    onClose();
                  }}
                >
                  {closeLabel}
                </Button>
              </div>
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                {showCancelInterviewAction && onCancelInterview ? (
                  <Button
                    type="button"
                    loading={isCanceling}
                    loadingText="Cancelling"
                    disabled={isSubmitting}
                    className={secondaryActionClassName}
                    onClick={(event) => {
                      event.stopPropagation();
                      void onCancelInterview();
                    }}
                  >
                    {cancelInterviewLabel}
                  </Button>
                ) : <div className="hidden sm:block" />}
                <div className="hidden sm:block" />
              </div>
              {helperText ? (
                <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
                  {helperText}
                </p>
              ) : null}
            </div>
          </>
        )}
      </form>
    </SideDrawer>
  );
};

