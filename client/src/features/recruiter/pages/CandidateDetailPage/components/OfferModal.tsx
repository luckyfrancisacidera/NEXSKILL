/* eslint-disable react-refresh/only-export-components */
import type { FormEvent, MouseEvent, ReactNode } from 'react';
import { BriefcaseBusiness, CalendarDays, CircleDollarSign, Clock3, MessageSquareText, Sparkles, X } from 'lucide-react';

import { RecruiterSelectField } from '@features/recruiter/components/RecruiterSelectField';
import { recruiterInputClassName } from '@features/recruiter/components/recruiterForm.shared';
import { Button } from '@shared/components/actions/Button';
import { ModalOverlay } from '@shared/components/overlay/ModalOverlay';
import { PredictiveInput } from '@shared/components/form/PredictiveInput';
import { RichTextField } from '@shared/components/form/RichTextField';

export const OFFER_EMPLOYMENT_TYPE_OPTIONS = ['Full-time', 'Part-time', 'Contract', 'Internship', 'Temporary'] as const;
export const OFFER_WORK_SETUP_OPTIONS = ['On-site', 'Hybrid', 'Remote'] as const;
export const OFFER_SALARY_TYPE_OPTIONS = ['Monthly', 'Annual', 'Weekly', 'Daily'] as const;
export const OFFER_CURRENCY_OPTIONS = ['PHP', 'USD'] as const;

export interface OfferFormValues {
  title: string;
  employmentType: string;
  workSetup: string;
  salaryAmount: string;
  salaryType: string;
  currency: string;
  startDate: string;
  endDate: string;
  expirationDate: string;
  benefits: string;
  message: string;
}

export type OfferFormErrorKey = keyof OfferFormValues | 'form';

export interface OfferModalProps {
  open: boolean;
  form: OfferFormValues;
  titleSuggestions?: string[];
  errors?: Partial<Record<OfferFormErrorKey, string>>;
  isSubmitting?: boolean;
  minStartDate?: string;
  minExpirationDate?: string;
  onClose: () => void;
  onChange: (field: keyof OfferFormValues, value: string) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void | Promise<void>;
}

const helperTextClassName = 'text-xs text-zinc-500 dark:text-zinc-400';
const errorTextClassName = 'text-xs font-medium text-rose-600 dark:text-rose-300';

const renderError = (message?: string) => (message ? <p className={errorTextClassName}>{message}</p> : null);

const SectionCard = ({
  icon,
  title,
  description,
  children,
}: {
  icon: ReactNode;
  title: string;
  description: string;
  children: ReactNode;
}) => (
  <section className="space-y-4 rounded-[26px] border border-zinc-200 bg-zinc-50/80 p-4 sm:p-5 dark:border-zinc-700 dark:bg-zinc-950/60">
    <div className="flex items-start gap-3">
      <div className="mt-0.5 rounded-2xl border border-zinc-200 bg-white p-2.5 text-zinc-700 shadow-sm dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200">
        {icon}
      </div>
      <div className="min-w-0 space-y-1">
        <h4 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">{title}</h4>
        <p className={helperTextClassName}>{description}</p>
      </div>
    </div>
    {children}
  </section>
);

export const offerEmploymentTypeRequiresEndDate = (employmentType: string) =>
  employmentType === 'Contract' || employmentType === 'Internship' || employmentType === 'Temporary';

export const offerEmploymentTypeSupportsOptionalEndDate = (employmentType: string) => employmentType === 'Part-time';

export const OfferModal = ({
  open,
  form,
  titleSuggestions = [],
  errors,
  isSubmitting = false,
  minStartDate,
  minExpirationDate,
  onClose,
  onChange,
  onSubmit,
}: OfferModalProps) => {
  if (!open) {
    return null;
  }

  const requiresEndDate = offerEmploymentTypeRequiresEndDate(form.employmentType);
  const canSetOptionalEndDate = offerEmploymentTypeSupportsOptionalEndDate(form.employmentType);
  const showEndDateField = requiresEndDate || canSetOptionalEndDate;
  const endDateLabel = requiresEndDate ? 'End Date' : 'End Date (Optional)';
  const endDateHelperText = requiresEndDate
    ? 'Required for contract, internship, and temporary offers.'
    : 'Use this only when the part-time engagement has a defined end date.';
  const normalizedTitleSuggestions = Array.from(new Set(titleSuggestions.filter((item) => item.trim().length > 0)));

  return (
    <ModalOverlay onClose={onClose} containerClassName="max-w-3xl">
      <form
        className="flex max-h-[min(88vh,960px)] w-full flex-col overflow-hidden rounded-[30px] border border-zinc-200 bg-white shadow-2xl ring-1 ring-zinc-200 dark:border-zinc-700 dark:bg-zinc-900 dark:ring-zinc-700"
        onClick={(event: MouseEvent<HTMLFormElement>) => {
          event.stopPropagation();
        }}
        onSubmit={onSubmit}
      >
        <div className="border-b border-zinc-200 bg-white/95 px-4 py-4 backdrop-blur sm:px-5 lg:px-6 dark:border-zinc-700 dark:bg-zinc-900/95">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0 space-y-3">
              <div className="inline-flex items-center gap-2 rounded-full border border-zinc-200 bg-zinc-100 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-zinc-600 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300">
                <Sparkles className="h-3.5 w-3.5" />
                Structured Offer
              </div>
              <div className="space-y-1">
                <h3 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100">Send Offer</h3>
                <p className="max-w-2xl text-sm text-zinc-500 dark:text-zinc-400">
                  Keep the offer clear, realistic, and easy for the candidate to review in one pass.
                </p>
              </div>
            </div>
            <button
              type="button"
              aria-label="Close offer modal"
              onClick={(event) => {
                event.stopPropagation();
                onClose();
              }}
              className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-zinc-200 bg-white text-zinc-600 transition hover:bg-zinc-100 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto px-4 py-4 sm:px-5 lg:px-6 lg:py-5">
          <div className="space-y-5">
            {renderError(errors?.form)}

            <SectionCard
              icon={<BriefcaseBusiness className="h-4 w-4" />}
              title="Employment Details"
              description="Start with the role structure so the rest of the offer feels grounded."
            >
              <div className="space-y-1">
                <label htmlFor="offer-title" className="block text-sm font-medium text-zinc-800 dark:text-zinc-200">
                  Offer Title
                </label>
                <PredictiveInput
                  id="offer-title"
                  placeholder="Offer title"
                  options={normalizedTitleSuggestions}
                  value={form.title}
                  onChange={(value) => onChange('title', value)}
                  emptyState="No suggested titles."
                  required
                  error={errors?.title}
                />
                {renderError(errors?.title)}
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div className="space-y-1">
                  <RecruiterSelectField
                    id="offer-employment-type"
                    label="Employment Type"
                    value={form.employmentType}
                    onChange={(event) => onChange('employmentType', event.target.value)}
                    required
                  >
                    <option value="">Select employment type</option>
                    {OFFER_EMPLOYMENT_TYPE_OPTIONS.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </RecruiterSelectField>
                  {renderError(errors?.employmentType)}
                </div>

                <div className="space-y-1">
                  <RecruiterSelectField
                    id="offer-work-setup"
                    label="Work Setup"
                    value={form.workSetup}
                    onChange={(event) => onChange('workSetup', event.target.value)}
                    required
                  >
                    <option value="">Select work setup</option>
                    {OFFER_WORK_SETUP_OPTIONS.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </RecruiterSelectField>
                  {renderError(errors?.workSetup)}
                </div>
              </div>
            </SectionCard>

            <SectionCard
              icon={<CircleDollarSign className="h-4 w-4" />}
              title="Compensation"
              description="Use structured pay fields so the offer looks consistent and easier to compare."
            >
              <div className="grid gap-3 sm:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)_minmax(0,0.9fr)]">
                <div className="space-y-1">
                  <label htmlFor="offer-salary-amount" className="block text-sm font-medium text-zinc-800 dark:text-zinc-200">
                    Salary Amount
                  </label>
                  <input
                    id="offer-salary-amount"
                    required
                    min="0"
                    step="0.01"
                    type="number"
                    inputMode="decimal"
                    className={recruiterInputClassName}
                    placeholder="0.00"
                    value={form.salaryAmount}
                    onChange={(event) => onChange('salaryAmount', event.target.value)}
                  />
                  {renderError(errors?.salaryAmount)}
                </div>

                <div className="space-y-1">
                  <RecruiterSelectField
                    id="offer-salary-type"
                    label="Salary Type"
                    value={form.salaryType}
                    onChange={(event) => onChange('salaryType', event.target.value)}
                    required
                  >
                    <option value="">Select salary type</option>
                    {OFFER_SALARY_TYPE_OPTIONS.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </RecruiterSelectField>
                  {renderError(errors?.salaryType)}
                </div>

                <div className="space-y-1">
                  <RecruiterSelectField
                    id="offer-currency"
                    label="Currency"
                    value={form.currency}
                    onChange={(event) => onChange('currency', event.target.value)}
                    required
                  >
                    <option value="">Select currency</option>
                    {OFFER_CURRENCY_OPTIONS.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </RecruiterSelectField>
                  {renderError(errors?.currency)}
                </div>
              </div>
            </SectionCard>

            <SectionCard
              icon={<CalendarDays className="h-4 w-4" />}
              title="Dates"
              description="Start date is always required. End date appears only when the offer type needs one."
            >
              <div className={`grid gap-3 ${showEndDateField ? 'sm:grid-cols-2' : ''}`}>
                <div className="space-y-1">
                  <label htmlFor="offer-start-date" className="block text-sm font-medium text-zinc-800 dark:text-zinc-200">
                    Start Date
                  </label>
                  <input
                    id="offer-start-date"
                    required
                    type="date"
                    className={recruiterInputClassName}
                    min={minStartDate}
                    value={form.startDate}
                    onChange={(event) => onChange('startDate', event.target.value)}
                  />
                  {renderError(errors?.startDate)}
                </div>

                {showEndDateField ? (
                  <div className="space-y-1">
                    <label htmlFor="offer-end-date" className="block text-sm font-medium text-zinc-800 dark:text-zinc-200">
                      {endDateLabel}
                    </label>
                    <input
                      id="offer-end-date"
                      required={requiresEndDate}
                      type="date"
                      className={recruiterInputClassName}
                      value={form.endDate}
                      onChange={(event) => onChange('endDate', event.target.value)}
                    />
                    <p className={helperTextClassName}>{endDateHelperText}</p>
                    {renderError(errors?.endDate)}
                  </div>
                ) : null}
              </div>
            </SectionCard>

            <SectionCard
              icon={<Clock3 className="h-4 w-4" />}
              title="Expiration"
              description="Set a response deadline so pending offers do not remain open-ended."
            >
              <div className="space-y-1">
                <label htmlFor="offer-expiration-date" className="block text-sm font-medium text-zinc-800 dark:text-zinc-200">
                  Offer Expiration Date
                </label>
                <input
                  id="offer-expiration-date"
                  required
                  type="date"
                  className={recruiterInputClassName}
                  min={minExpirationDate}
                  value={form.expirationDate}
                  onChange={(event) => onChange('expirationDate', event.target.value)}
                />
                <p className={helperTextClassName}>Candidates must respond on or before this date.</p>
                {renderError(errors?.expirationDate)}
              </div>
            </SectionCard>

            <SectionCard
              icon={<MessageSquareText className="h-4 w-4" />}
              title="Message and Benefits"
              description="Close with the details the candidate will actually look for before responding."
            >
              <div className="space-y-1">
                <RichTextField
                  label="Benefits"
                  value={form.benefits}
                  onChange={(value) => onChange('benefits', value)}
                  placeholder="Benefits (optional)"
                  helperText="Summarize allowances, leave, equipment, or other included benefits."
                  minHeightClassName="min-h-[110px]"
                />
                {renderError(errors?.benefits)}
              </div>

              <div className="space-y-1">
                <RichTextField
                  label="Custom Message"
                  value={form.message}
                  onChange={(value) => onChange('message', value)}
                  placeholder="Message (optional)"
                  helperText="Add a polished note to frame the offer or next steps."
                  minHeightClassName="min-h-[140px]"
                />
                {renderError(errors?.message)}
              </div>
            </SectionCard>
          </div>
        </div>

        <div className="border-t border-zinc-200 bg-white/95 px-4 py-4 backdrop-blur sm:px-5 lg:px-6 dark:border-zinc-700 dark:bg-zinc-900/95">
          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <Button
              type="button"
              variant="secondary"
              className="rounded-2xl px-4 py-2.5"
              onClick={(event) => {
                event.stopPropagation();
                onClose();
              }}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              loading={isSubmitting}
              loadingText="Sending"
              className="rounded-2xl px-4 py-2.5"
            >
              Send Offer
            </Button>
          </div>
        </div>
      </form>
    </ModalOverlay>
  );
};

