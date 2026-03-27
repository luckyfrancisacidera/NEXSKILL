import type { CandidateStage } from '@features/recruiter/types';

const NON_SHORTLISTABLE_STATUSES = new Set([
  'shortlisted',
  'interview',
  'offer',
  'hired',
]);

const normalizeCandidateStage = (status?: string | null) => (status ?? '').trim().toLowerCase();

export const canShortlistCandidate = (status?: CandidateStage | string | null) =>
  !NON_SHORTLISTABLE_STATUSES.has(normalizeCandidateStage(status));

export const getShortlistWarningMessage = (invalidCount: number, allSelectedInvalid: boolean) => {
  if (allSelectedInvalid) {
    return 'Selected candidates are already in Shortlisted, Interview, Offer, or Hired and cannot be shortlisted again.';
  }

  if (invalidCount === 1) {
    return 'One selected candidate cannot be shortlisted because they are already in a later stage.';
  }

  return `${invalidCount} selected candidates cannot be shortlisted because they are already in later stages.`;
};
