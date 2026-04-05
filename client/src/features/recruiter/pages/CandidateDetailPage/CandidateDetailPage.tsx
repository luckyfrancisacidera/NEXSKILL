import { useEffect, useMemo, useState } from 'react';
import { useLoaderData, useRevalidator } from 'react-router-dom';
import {
  BriefcaseBusiness,
  CalendarDays,
  Download,
  GraduationCap,
  Mail,
  MapPin,
  ReceiptText,
  Phone,
} from 'lucide-react';

import { useAuth } from '@app/providers/AuthProvider';
import { useToast } from '@app/providers/ToastProvider';
import { adminService } from '@features/admin/service/admin.service';
import { RecruiterSectionCard } from '@features/recruiter/components/RecruiterSectionCard';
import {
  OfferModal,
  offerEmploymentTypeRequiresEndDate,
  offerEmploymentTypeSupportsOptionalEndDate,
  type OfferFormErrorKey,
  type OfferFormValues,
} from '@features/recruiter/pages/CandidateDetailPage/components/OfferModal';
import {
  InterviewModal,
  type InterviewFormValues,
} from '@features/recruiter/pages/CandidateDetailPage/components/InterviewModal';
import { ProjectCard } from '@features/recruiter/pages/CandidateDetailPage/components/ProjectCard';
import { WorkExperienceCard } from '@features/recruiter/pages/CandidateDetailPage/components/WorkExperienceCard';
import { recruiterInterviewService } from '@features/recruiter/services/interview.service';
import { recruiterService } from '@features/recruiter/services/recruiter.service';

import type {
  ApplicantDetailDto,
  CandidateDetailAction,
  CandidateStage,
} from '@features/recruiter/types';
import { ApiError } from '@shared/api/http';
import { Card } from '@shared/components/data-display/Card';
import { StatusBadge } from '@shared/components/data-display/StatusBadge';
import { useConfirmation } from '@shared/hooks/useConfirmation';
import { usePermissions } from '@shared/hooks/usePermissions';
import { formatJobLabel } from '@shared/utils/jobLabels';
import { richTextToPlainText, sanitizeRichText } from '@shared/utils/richText';
import { canShortlistCandidate } from '@features/recruiter/utils/candidateStageRules';
import { interviewStatusChipClassName } from '@shared/utils/interviewStatus';

const nextActionByStage: Partial<Record<CandidateStage, CandidateDetailAction>> = {
  Applied: {
    action: 'shortlist',
    status: 'Shortlisted',
    label: 'Shortlist',
    title: 'Shortlist candidate',
    message: (name) => `Move ${name} to Shortlisted stage?`,
    accent: 'green',
  },
  Recommended: {
    action: 'shortlist',
    status: 'Shortlisted',
    label: 'Shortlist',
    title: 'Shortlist candidate',
    message: (name) => `Move ${name} to Shortlisted stage?`,
    accent: 'green',
  },
  Shortlisted: {
    action: 'set-interview',
    status: 'Interview',
    label: 'Set Interview',
    title: 'Set interview',
    message: (name) => `Move ${name} to Interview stage?`,
    accent: 'green',
  },
};

const getInitials = (name: string) =>
  name
    .split(' ')
    .map((part) => part[0] ?? '')
    .join('')
    .slice(0, 2)
    .toUpperCase();

const monthsToText = (months: number | undefined) => {
  if (!months || months <= 0) {
    return 'Not available';
  }

  const years = Math.floor(months / 12);
  const remainder = months % 12;

  if (years > 0 && remainder > 0) {
    return `${years}y ${remainder}m`;
  }

  if (years > 0) {
    return `${years} years`;
  }

  return `${remainder} months`;
};

const formatDateLabel = (value?: string | null) => {
  if (!value) {
    return 'Not set';
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleDateString();
};

const formatCurrencyAmount = (amount?: number | null, currency?: string | null) => {
  if (amount === null || amount === undefined || Number.isNaN(amount)) {
    return 'Not set';
  }

  return `${currency || 'PHP'} ${amount.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
};

const formatRelativeExpiration = (value?: string | null) => {
  if (!value) {
    return null;
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const expirationDate = new Date(value);
  expirationDate.setHours(0, 0, 0, 0);

  if (Number.isNaN(expirationDate.getTime())) {
    return null;
  }

  const diffInDays = Math.round((expirationDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  if (diffInDays < 0) {
    return 'Expired';
  }

  if (diffInDays === 0) {
    return 'Expires today';
  }

  if (diffInDays === 1) {
    return 'Expires in 1 day';
  }

  return `Expires in ${diffInDays} days`;
};

const buildInterviewScheduleErrorMessage = (message: string) => {
  const normalizedMessage = message.trim();
  if (/already has an interview scheduled at that time/i.test(normalizedMessage)) {
    return 'There is already an interview scheduled at this time. Please choose a different schedule.';
  }

  return normalizedMessage || 'Unable to schedule interview. Please try again.';
};

const formatDateInputValue = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const getTodayDateValue = () => formatDateInputValue(new Date());

const parseDateInputValue = (value: string) => {
  if (!value) {
    return null;
  }

  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!match) {
    return null;
  }

  const [, year, month, day] = match;
  const parsedDate = new Date(Number(year), Number(month) - 1, Number(day));
  parsedDate.setHours(0, 0, 0, 0);
  if (Number.isNaN(parsedDate.getTime()) || formatDateInputValue(parsedDate) !== value) {
    return null;
  }

  return parsedDate;
};

const hasCandidateExplanation = (candidate: ApplicantDetailDto) => {
  const explanation = candidate.candidate_explanation;

  return Boolean(
    explanation?.summary?.trim()
    || explanation?.recommendation?.trim()
    || explanation?.explanation_text?.trim()
    || explanation?.strengths?.length
    || explanation?.gaps?.length,
  );
};

export const CandidateDetailPage = () => {
  const { roles } = useAuth();
  const { candidate: loaderCandidate } = useLoaderData() as { candidate: ApplicantDetailDto };
  const [candidate, setCandidate] = useState(loaderCandidate);
  const [isDownloadingResume, setIsDownloadingResume] = useState(false);
  const [isInterviewOpen, setIsInterviewOpen] = useState(false);
  const [isOfferOpen, setIsOfferOpen] = useState(false);
  const [isSchedulingInterview, setIsSchedulingInterview] = useState(false);
  const [isCompletingInterview, setIsCompletingInterview] = useState(false);
  const [isSendingOffer, setIsSendingOffer] = useState(false);
  const [interviewErrors, setInterviewErrors] = useState<Partial<Record<keyof InterviewFormValues | 'form', string>>>({});
  const [interviewForm, setInterviewForm] = useState<InterviewFormValues>({
    date: '',
    hour: '9',
    minute: '00',
    meridiem: 'AM',
    mode: 'Virtual',
    location: '',
    notes: '',
  });
  const [offerForm, setOfferForm] = useState<OfferFormValues>({
    title: candidate.job_title,
    employmentType: '',
    workSetup: '',
    salaryAmount: '',
    salaryType: 'Monthly',
    currency: 'PHP',
    startDate: '',
    endDate: '',
    expirationDate: '',
    benefits: '',
    message: '',
  });
  const [offerErrors, setOfferErrors] = useState<Partial<Record<OfferFormErrorKey, string>>>({});

  const { showToast } = useToast();
  const confirm = useConfirmation();
  const { canSendOffers, isCompanyAdmin } = usePermissions();
  const revalidator = useRevalidator();
  const parsedResume = candidate.parsed_resume_json;
  const candidateExplanation = candidate.candidate_explanation;
  const personalInfo = parsedResume?.personal_info;
  const hasResume = candidate.has_resume;
  const shortlistDisabled = !canShortlistCandidate(candidate.submission_status);
  const isReadOnly = isCompanyAdmin && !roles.includes('recruiter');
  const latestInterview = candidate.latest_interview ?? null;
  const latestInterviewStatus = latestInterview?.status ?? null;
  const canMarkInterviewDone =
    !isReadOnly
    && candidate.submission_status === 'Interview'
    && latestInterviewStatus === 'Accepted';
  const canOpenOfferModal =
    !isReadOnly
    && canSendOffers
    && candidate.submission_status === 'Interview'
    && latestInterviewStatus === 'Completed';
  const canRejectCandidate =
    candidate.submission_status !== 'Interview' || latestInterviewStatus === 'Completed';
  const interviewProgressHint =
    candidate.submission_status !== 'Interview'
      ? null
      : latestInterviewStatus === 'Completed'
        ? 'Interview completed. You can now reject the candidate or send an offer.'
        : latestInterviewStatus === 'Accepted'
          ? 'Interview accepted. Mark it done after the session before sending an offer or rejecting the candidate.'
          : latestInterviewStatus === 'Pending' || latestInterviewStatus === 'Rescheduled' || latestInterviewStatus === 'RescheduleRequested'
            ? 'The latest interview is not yet confirmed. Offer and reject actions stay locked until the interview is accepted and marked done.'
            : latestInterviewStatus === 'Declined'
              ? 'The latest interview was declined. Offer and reject actions stay locked until a new interview is scheduled, accepted, and completed.'
              : latestInterviewStatus === 'Cancelled'
                ? 'The latest interview was cancelled. Offer and reject actions stay locked until a new interview is scheduled, accepted, and completed.'
                : 'Schedule and complete an interview before moving to offer decisions.';

  const resetInterviewForm = () => {
    setInterviewForm({
      date: '',
      hour: '9',
      minute: '00',
      meridiem: 'AM',
      mode: 'Virtual',
      location: '',
      notes: '',
    });
    setInterviewErrors({});
  };

  const resetOfferForm = (nextCandidate: ApplicantDetailDto) => {
    setOfferErrors({});
    setOfferForm({
      title: nextCandidate.offer?.title || nextCandidate.job_title,
      employmentType: nextCandidate.offer?.employment_type || '',
      workSetup: nextCandidate.offer?.work_setup || '',
      salaryAmount:
        nextCandidate.offer?.salary_amount !== undefined && nextCandidate.offer?.salary_amount !== null
          ? String(nextCandidate.offer.salary_amount)
          : '',
      salaryType: nextCandidate.offer?.salary_type || 'Monthly',
      currency: nextCandidate.offer?.currency || 'PHP',
      startDate: nextCandidate.offer?.start_date || '',
      endDate: nextCandidate.offer?.end_date || '',
      expirationDate: nextCandidate.offer?.expiration_date || '',
      benefits: nextCandidate.offer?.benefits || '',
      message: nextCandidate.offer?.message || '',
    });
  };

  const closeCandidateModals = () => {
    setIsInterviewOpen(false);
    setIsOfferOpen(false);
    setInterviewErrors({});
    setOfferErrors({});
  };

  const openInterviewModal = () => {
    setIsOfferOpen(false);
    setInterviewErrors({});
    setIsInterviewOpen(true);
  };

  const openOfferModal = () => {
    setIsInterviewOpen(false);
    setOfferErrors({});
    setIsOfferOpen(true);
  };

  useEffect(() => {
    setCandidate(loaderCandidate);
  }, [loaderCandidate]);

  useEffect(() => {
    resetOfferForm(loaderCandidate);
  }, [loaderCandidate]);

  const primaryAction = useMemo(
    () =>
      candidate.submission_status === 'Hired'
        ? undefined
        : nextActionByStage[candidate.submission_status],
    [candidate.submission_status],
  );

  const canRunAction = (action: CandidateDetailAction) => {
    if (action.action === 'offer') {
      return canSendOffers;
    }

    return true;
  };

  const describeActionSuccess = (action: CandidateDetailAction, statusToRun: CandidateStage) =>
    action.action === 'reject'
      ? `${candidate.applicant_name} has been marked as rejected.`
      : `${candidate.applicant_name} is now in ${statusToRun} stage.`;

  const updateOfferFormField = (field: keyof OfferFormValues, value: string) => {
    setOfferForm((state) => {
      const nextState = { ...state, [field]: value };

      if (field === 'employmentType') {
        const requiresEndDate = offerEmploymentTypeRequiresEndDate(value);
        const supportsOptionalEndDate = offerEmploymentTypeSupportsOptionalEndDate(value);

        if (!requiresEndDate && !supportsOptionalEndDate) {
          nextState.endDate = '';
        }
      }

      return nextState;
    });

    setOfferErrors((current) => {
      if (!current[field] && !(field === 'employmentType' && current.endDate)) {
        return current;
      }

      const nextErrors = { ...current };
      delete nextErrors[field];
      if (field === 'employmentType') {
        delete nextErrors.endDate;
      }
      delete nextErrors.form;
      return nextErrors;
    });
  };

  const validateOfferForm = () => {
    const errors: Partial<Record<OfferFormErrorKey, string>> = {};
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayDateValue = formatDateInputValue(today);

    const normalizedTitle = offerForm.title.trim();
    const salaryAmount = Number.parseFloat(offerForm.salaryAmount);
    const requiresEndDate = offerEmploymentTypeRequiresEndDate(offerForm.employmentType);
    const supportsOptionalEndDate = offerEmploymentTypeSupportsOptionalEndDate(offerForm.employmentType);

    const startDate = parseDateInputValue(offerForm.startDate);
    const endDate = parseDateInputValue(offerForm.endDate);
    const expirationDate = parseDateInputValue(offerForm.expirationDate);

    if (!normalizedTitle) {
      errors.title = 'Please enter an offer title.';
    }

    if (!offerForm.employmentType) {
      errors.employmentType = 'Please select an employment type.';
    }

    if (!offerForm.workSetup) {
      errors.workSetup = 'Please select a work setup.';
    }

    if (!offerForm.salaryAmount.trim() || Number.isNaN(salaryAmount) || salaryAmount <= 0) {
      errors.salaryAmount = 'Please enter a valid salary amount.';
    }

    if (!offerForm.salaryType) {
      errors.salaryType = 'Please select a salary type.';
    }

    if (!offerForm.currency) {
      errors.currency = 'Please select a currency.';
    }

    if (!offerForm.startDate || !startDate) {
      errors.startDate = 'Please select a start date.';
    } else if (offerForm.startDate < todayDateValue || startDate < today) {
      errors.startDate = 'Start date cannot be in the past.';
    }

    if (requiresEndDate && (!offerForm.endDate || !endDate)) {
      errors.endDate = `End date is required for ${offerForm.employmentType.toLowerCase()} offers.`;
    }

    if ((requiresEndDate || supportsOptionalEndDate) && offerForm.endDate && !endDate) {
      errors.endDate = 'Please provide a valid end date.';
    }

    if (startDate && endDate && endDate <= startDate) {
      errors.endDate = 'End date must be after the start date.';
    }

    if (!offerForm.expirationDate || !expirationDate) {
      errors.expirationDate = 'Please select an offer expiration date.';
    } else {
      if (offerForm.expirationDate < todayDateValue || expirationDate < today) {
        errors.expirationDate = 'Expiration date cannot be in the past.';
      } else if (startDate && expirationDate < startDate) {
        errors.expirationDate = 'Expiration date must be on or after the allowed minimum date.';
      }
    }

    return errors;
  };

  const offerSalaryPreview = useMemo(() => {
    const amount = Number.parseFloat(offerForm.salaryAmount);
    if (!offerForm.salaryAmount.trim() || Number.isNaN(amount) || amount <= 0) {
      return 'Salary summary will appear here.';
    }

    return `${offerForm.currency || 'PHP'} ${amount.toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })} / ${(offerForm.salaryType || 'Monthly').toLowerCase()}`;
  }, [offerForm.currency, offerForm.salaryAmount, offerForm.salaryType]);
  const minimumOfferStartDate = getTodayDateValue();
  const minimumOfferExpirationDate = offerForm.startDate && offerForm.startDate >= minimumOfferStartDate
    ? offerForm.startDate
    : minimumOfferStartDate;

  const requestCandidateAction = async (action: CandidateDetailAction) => {
    if (!action.status) {
      return;
    }

    if (!canRunAction(action)) {
      showToast({
        title: 'Action unavailable',
        description:
          action.action === 'offer'
            ? 'You do not have permission to send offers in the current recruiter context.'
            : 'You do not have permission to complete this action in the current recruiter context.',
        tone: 'error',
      });
      return;
    }

    const confirmed = await confirm({
      title: action.title,
      message: action.message(candidate.applicant_name),
      confirmLabel: action.label,
      accent: action.accent,
    });

    if (!confirmed) {
      return;
    }

    await runCandidateAction(
      action.action,
      action.status,
      `Candidate ${action.label.toLowerCase()} successfully`,
      describeActionSuccess(action, action.status),
    );
  };

  const runCandidateAction = async (
    action: string,
    status: CandidateStage,
    successTitle: string,
    successDescription: string,
    offerPayload?: {
      title: string;
      message: string;
      benefits?: string | null;
      salary_text: string;
      salary_amount: number;
      salary_type: string;
      currency: string;
      employment_type: string;
      work_setup: string;
      start_date?: string | null;
      end_date?: string | null;
      expiration_date?: string | null;
    },
  ) => {
    try {
      if (action === 'offer') {
        if (!offerPayload) {
          throw new Error('Offer details are required before sending an offer.');
        }

        const updatedCandidate = await recruiterService.sendOffer(candidate.resume_submission_id, offerPayload);
        setCandidate((current) => ({ ...current, ...updatedCandidate }));
      } else {
        const result = await recruiterService.updateApplicantStatuses([candidate.resume_submission_id], {
          action,
          status,
        });
        const itemResult = result.results[0];

        if (!itemResult?.success || !itemResult.candidate) {
          throw new Error(itemResult?.message ?? 'Unable to update candidate stage.');
        }

        setCandidate((current) => ({ ...current, ...itemResult.candidate }));
      }

      const refreshedCandidate = await recruiterService.getApplicantBySubmissionId(candidate.resume_submission_id);
      setCandidate(refreshedCandidate);

      // Reload the canonical route payload so dashboards and detail views stay aligned with backend metrics.
      revalidator.revalidate();
      showToast({ title: successTitle, description: successDescription, tone: 'success' });
      return true;
    } catch (error) {
      const description =
        error instanceof ApiError
          ? ((error.data as { message?: string } | null)?.message ?? error.message)
          : error instanceof Error
            ? error.message
            : 'Unable to update candidate stage. Please try again.';

      showToast({ title: 'Action failed', description, tone: 'error' });
      return false;
    }
  };


  const scheduleInterview = async () => {
    if (!candidate.jobseeker_user_id) {
      throw new Error('This candidate does not have a linked jobseeker account for interview scheduling.');
    }

    const selectedHour = Number(interviewForm.hour);
    const selectedMinute = Number(interviewForm.minute);

    let hour24 = selectedHour % 12;
    if (interviewForm.meridiem === 'PM') {
      hour24 += 12;
    }

    const normalizedHour = String(hour24).padStart(2, '0');
    const normalizedMinute = String(selectedMinute).padStart(2, '0');
    const scheduledDateTimeUtc = new Date(`${interviewForm.date}T${normalizedHour}:${normalizedMinute}:00`);
    if (Number.isNaN(scheduledDateTimeUtc.getTime())) {
      throw new Error('Please provide a valid interview date and time.');
    }

    return await recruiterInterviewService.scheduleInterview({
      jobId: candidate.job_id,
      jobseekerId: candidate.jobseeker_user_id,
      scheduledDate: scheduledDateTimeUtc.toISOString(),
      interviewType: interviewForm.mode,
      meetingLink: interviewForm.mode === 'Virtual' ? interviewForm.location : undefined,
      location: interviewForm.mode === 'Onsite' ? interviewForm.location : undefined,
      message: sanitizeRichText(interviewForm.notes) || undefined,
    });
  };

  const completeInterview = async () => {
    if (!latestInterview) {
      throw new Error('No interview is linked to this candidate yet.');
    }

    const updatedInterview = await recruiterInterviewService.completeInterview(latestInterview.id);
    const refreshedCandidate = await recruiterService.getApplicantBySubmissionId(candidate.resume_submission_id);
    setCandidate(refreshedCandidate);
    revalidator.revalidate();
    return updatedInterview;
  };

  const downloadResume = async () => {
    if (!hasResume) {
      return;
    }

    setIsDownloadingResume(true);
    try {
      const result = isReadOnly
        ? await adminService.getCompanyApplicantResumeDownload(candidate.resume_submission_id)
        : await recruiterService.getApplicantResumeDownload(candidate.resume_submission_id);
      const link = document.createElement('a');
      link.href = 'download_url' in result ? result.download_url : result.downloadUrl;
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      const description =
        error instanceof ApiError
          ? ((error.data as { message?: string } | null)?.message ?? error.message)
          : error instanceof Error
            ? error.message
            : 'Unable to prepare resume download. Please try again.';

      showToast({ title: 'Download failed', description, tone: 'error' });
    } finally {
      setIsDownloadingResume(false);
    }
  };

  return (
    <div className="grid gap-4 text-zinc-900 dark:bg-zinc-900 dark:text-zinc-100 xl:grid-cols-[minmax(300px,350px)_minmax(0,1fr)]">
      <Card className="h-fit overflow-hidden p-0">
        <div className="bg-linear-to-b from-slate-50 to-white px-4 py-5 dark:from-zinc-900 dark:to-zinc-950 sm:px-5 sm:py-6">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-linear-to-br from-slate-400 to-slate-600 text-3xl font-bold text-white shadow-md">
            {getInitials(candidate.applicant_name)}
          </div>
          <h2 className="mt-4 text-center text-lg font-bold text-zinc-900 dark:text-zinc-100">{candidate.applicant_name}</h2>
          <p className="text-center text-sm text-zinc-500 dark:text-zinc-400">{personalInfo?.job_target || candidate.job_title}</p>

          <div className="mt-4 space-y-2 border-t border-zinc-200 pt-4 text-sm text-zinc-700 dark:border-zinc-800 dark:text-zinc-300">
            <p className="flex items-center gap-2">
              <Mail className="h-4 w-4 text-zinc-400 dark:text-zinc-500" /> {candidate.applicant_email}
            </p>
            <p className="flex items-center gap-2">
              <Phone className="h-4 w-4 text-zinc-400 dark:text-zinc-500" /> {personalInfo?.phone || 'Not available'}
            </p>
            <p className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-zinc-400 dark:text-zinc-500" /> {personalInfo?.location || 'Location not provided'}
            </p>
          </div>

          <div className="mt-4 space-y-3 border-t border-zinc-200 pt-4 dark:border-zinc-800">
            <div className="flex items-center justify-between text-sm">
              <span className="text-zinc-500 dark:text-zinc-400">ATS Score</span>
              <span className="font-semibold text-zinc-800 dark:text-zinc-100">{candidate.score}%</span>
            </div>
            <div className="h-2 rounded-full bg-zinc-200 dark:bg-zinc-800">
              <div
                className="h-2 rounded-full bg-linear-to-r from-zinc-800 to-gray-700 dark:from-zinc-200 dark:to-zinc-400"
                style={{ width: `${Math.max(10, Math.min(100, candidate.score))}%` }}
              />
            </div>
            <p className="text-xs text-zinc-500 capitalize dark:text-zinc-400">
              {parsedResume?.derived?.education_max_level || 'Education level unknown'} -{' '}
              {monthsToText(parsedResume?.derived?.total_experience_months)} experience
            </p>
          </div>

          {!isReadOnly && primaryAction ? (
            <button
              type="button"
              onClick={(event) => {
                // Stop propagation so the action only opens one controlled modal.
                event.stopPropagation();
                if (candidate.submission_status === 'Shortlisted') {
                  // Interview scheduling is restricted to CandidateDetailPage
                  // because interview configuration requires detailed candidate context
                  openInterviewModal();
                } else if (candidate.submission_status === 'Interview') {
                  if (!canSendOffers) {
                    showToast({
                      title: 'Action unavailable',
                      description: 'You do not have permission to send offers in the current recruiter context.',
                      tone: 'error',
                    });
                    return;
                  }

                  openOfferModal();
                } else {
                  void requestCandidateAction(primaryAction);
                }
              }}
              disabled={candidate.submission_status === 'Interview' && !canSendOffers}
              className="mt-5 w-full rounded-lg bg-zinc-900 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-zinc-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-400 focus-visible:ring-offset-2 focus-visible:ring-offset-white disabled:cursor-not-allowed disabled:opacity-60 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200 dark:focus-visible:ring-zinc-500 dark:focus-visible:ring-offset-zinc-950"
            >
              {primaryAction.label}
            </button>
          ) : null}
          {!isReadOnly && candidate.submission_status === 'Offer' ? (
            <p className="mt-3 text-center text-xs text-zinc-500 dark:text-zinc-400">
              Once the latest offer is accepted, this candidate moves to My Hires automatically.
            </p>
          ) : null}
          {!isReadOnly && interviewProgressHint ? (
            <p className="mt-3 text-center text-xs text-zinc-500 dark:text-zinc-400">
              {interviewProgressHint}
            </p>
          ) : null}
        </div>

        <RecruiterSectionCard title="Application Info" variant="compact">
          <ul className="space-y-2 text-sm">
            <li className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
              <span className="text-zinc-500 dark:text-zinc-400">Applied:</span>
              <span className="font-semibold text-zinc-800 dark:text-zinc-100">
                {new Date(candidate.created_at_utc).toLocaleDateString()}
              </span>
            </li>
            <li className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
              <span className="text-zinc-500 dark:text-zinc-400">Stage:</span>
              <StatusBadge status={candidate.submission_status} />
            </li>
            <li className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
              <span className="text-zinc-500 dark:text-zinc-400">ATS Score:</span>
              <span className="font-semibold text-zinc-800 dark:text-zinc-100">{candidate.score}</span>
            </li>
            {latestInterview ? (
              <li className="space-y-2">
                <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                  <span className="text-zinc-500 dark:text-zinc-400">Latest interview:</span>
                  <span className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide ${interviewStatusChipClassName[latestInterview.status]}`}>
                    {latestInterview.status}
                  </span>
                </div>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 sm:text-right">
                  {new Date(latestInterview.scheduled_date_time_utc).toLocaleString()}
                </p>
              </li>
            ) : null}
          </ul>
        </RecruiterSectionCard>

        <RecruiterSectionCard title="Offer Status" variant="compact">
          {candidate.offer ? (
            <div className="space-y-3 text-sm">
              <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                <span className="text-zinc-500 dark:text-zinc-400">Current offer</span>
                <StatusBadge status={candidate.offer.status} />
              </div>
              <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-3 dark:border-zinc-700 dark:bg-zinc-900/70">
                <p className="font-semibold text-zinc-900 dark:text-zinc-100">{candidate.offer.title}</p>
                <p className="mt-1 text-zinc-600 dark:text-zinc-400">{candidate.offer.salary_text}</p>
                <p className="mt-1 text-xs uppercase tracking-[0.14em] text-zinc-500 dark:text-zinc-400">
                  {formatJobLabel(candidate.offer.employment_type)}
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  <span className="rounded-full border border-zinc-200 bg-white px-2.5 py-1 text-[11px] font-medium text-zinc-600 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-300">
                    {candidate.offer.work_setup}
                  </span>
                  <span className="rounded-full border border-zinc-200 bg-white px-2.5 py-1 text-[11px] font-medium text-zinc-600 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-300">
                    {candidate.offer.currency} / {candidate.offer.salary_type}
                  </span>
                </div>
              </div>
              <div className="space-y-2 rounded-2xl border border-zinc-200 bg-white p-3 dark:border-zinc-700 dark:bg-zinc-900">
                <p className="flex items-center gap-2 text-zinc-600 dark:text-zinc-400">
                  <CalendarDays className="h-4 w-4 text-zinc-400 dark:text-zinc-500" />
                  Start date: <span className="font-semibold text-zinc-800 dark:text-zinc-100">{formatDateLabel(candidate.offer.start_date)}</span>
                </p>
                {candidate.offer.end_date ? (
                  <p className="flex items-center gap-2 text-zinc-600 dark:text-zinc-400">
                    <CalendarDays className="h-4 w-4 text-zinc-400 dark:text-zinc-500" />
                    End date: <span className="font-semibold text-zinc-800 dark:text-zinc-100">{formatDateLabel(candidate.offer.end_date)}</span>
                  </p>
                ) : null}
                <p className="flex items-center gap-2 text-zinc-600 dark:text-zinc-400">
                  <ReceiptText className="h-4 w-4 text-zinc-400 dark:text-zinc-500" />
                  Expires: <span className="font-semibold text-zinc-800 dark:text-zinc-100">{formatDateLabel(candidate.offer.expiration_date)}</span>
                </p>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">
                  Compensation: {formatCurrencyAmount(candidate.offer.salary_amount, candidate.offer.currency)} / {candidate.offer.salary_type.toLowerCase()}
                </p>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">
                  {formatRelativeExpiration(candidate.offer.expiration_date) || 'Expiration date not set'}
                </p>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">
                  Sent {new Date(candidate.offer.sent_at_utc).toLocaleString()}
                  {candidate.offer.responded_at_utc ? ` • Responded ${new Date(candidate.offer.responded_at_utc).toLocaleString()}` : ''}
                </p>
              </div>
              {candidate.offer.benefits ? (
                <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-3 text-zinc-600 dark:border-zinc-700 dark:bg-zinc-900/70 dark:text-zinc-300">
                  <p className="text-xs font-semibold uppercase tracking-[0.14em] text-zinc-500 dark:text-zinc-400">Benefits</p>
                  <p className="mt-2 whitespace-pre-wrap">{candidate.offer.benefits}</p>
                </div>
              ) : null}
              {candidate.offer.message ? (
                <div className="rounded-2xl border border-zinc-200 bg-white p-3 text-zinc-600 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-300">
                  {candidate.offer.message}
                </div>
              ) : null}
              {!isReadOnly && canSendOffers && latestInterviewStatus === 'Completed' && candidate.submission_status !== 'Hired' && candidate.offer.status !== 'Accepted' && candidate.offer.status !== 'Pending' ? (
                <button
                  type="button"
                  onClick={openOfferModal}
                  className="w-full rounded-xl border border-zinc-300 bg-white px-4 py-2.5 text-sm font-semibold text-zinc-800 transition hover:bg-zinc-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-400 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 dark:hover:bg-zinc-800 dark:focus-visible:ring-zinc-500 dark:focus-visible:ring-offset-zinc-950"
                >
                  Send new offer
                </button>
              ) : null}
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed border-zinc-300 bg-zinc-50 p-4 text-sm text-zinc-500 dark:border-zinc-700 dark:bg-zinc-900/60 dark:text-zinc-400">
              {isReadOnly
                ? 'No offer has been recorded for this candidate yet.'
                : 'No offer has been sent yet. Once the candidate is ready, send an offer from this page.'}
            </div>
          )}
        </RecruiterSectionCard>

        <RecruiterSectionCard title="Resume Information" variant="compact">
          <div className="space-y-2 text-sm">
            <p className="text-zinc-600 dark:text-zinc-400">
              Resume ID: <span className="font-semibold text-zinc-800 dark:text-zinc-100">{candidate.resume_submission_id.slice(0, 8)}</span>
            </p>
            {candidate.resume_file_name ? (
             <p className="text-zinc-600 dark:text-zinc-400">
              File:{' '}
              <span className="inline-block max-w-2xl truncate align-bottom font-semibold text-zinc-800 dark:text-zinc-100">
                {candidate.resume_file_name}
              </span>
            </p>
            ) : null}
            <p className="text-zinc-600 dark:text-zinc-400">
              Parsed: <span className="font-semibold text-emerald-600 dark:text-emerald-400">Successfully</span>
            </p>
            <button
              type="button"
              onClick={() => {
                void downloadResume();
              }}
              disabled={!hasResume || isDownloadingResume}
              className="mt-2 flex w-full items-center justify-center gap-2 rounded-lg bg-zinc-800 px-3 py-2 text-sm font-semibold text-white transition hover:bg-zinc-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-400 focus-visible:ring-offset-2 focus-visible:ring-offset-white disabled:cursor-not-allowed disabled:opacity-60 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200 dark:focus-visible:ring-zinc-500 dark:focus-visible:ring-offset-zinc-950"
            >
              <Download className="h-4 w-4" /> {isDownloadingResume ? 'Preparing...' : 'Download Resume'}
            </button>
          </div>
        </RecruiterSectionCard>

        <RecruiterSectionCard title={isReadOnly ? "Profile Status" : "Recruiter Actions"} variant="compact">
          <div className="space-y-2">
            <p className="flex items-center gap-2 text-sm text-zinc-600 dark:text-zinc-400">
              <BriefcaseBusiness className="h-4 w-4 dark:text-zinc-500" /> {candidate.job_title}
            </p>
            {!isReadOnly && candidate.submission_status !== 'Rejected' && candidate.submission_status !== 'Hired' ? (
              <>
                {candidate.submission_status === 'Interview' ? (
                  <button
                    type="button"
                    disabled={shortlistDisabled}
                    onClick={(event) => {
                      // Stop propagation so shortlist actions do not bubble into parent page handlers.
                      event.stopPropagation();
                      if (shortlistDisabled) {
                        showToast({
                          title: 'Shortlist unavailable',
                          description: 'This candidate is already shortlisted or in a later stage.',
                          tone: 'warning',
                        });
                        return;
                      }
                      void requestCandidateAction({
                        action: 'shortlist',
                        status: 'Shortlisted',
                        label: 'Shortlist',
                        title: 'Shortlist candidate',
                        message: (name) => `Move ${name} back to Shortlisted stage?`,
                        accent: 'violet',
                      });
                    }}
                    title={shortlistDisabled ? 'This candidate is already shortlisted or in a later stage.' : undefined}
                    className={`w-full rounded-lg border px-4 py-2 text-sm font-semibold transition ${
                      shortlistDisabled
                        ? 'cursor-not-allowed border-zinc-200 bg-zinc-100 text-zinc-400 opacity-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-500'
                        : 'border-zinc-300 bg-white text-zinc-800 hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 dark:hover:bg-zinc-800'
                    }`}
                  >
                    Shortlist
                  </button>
                ) : null}

                {candidate.submission_status === 'Shortlisted' ? (
                  <button
                    type="button"
                    onClick={(event) => {
                      // Stop propagation so shortlist actions do not bubble into parent page handlers.
                      event.stopPropagation();
                      void requestCandidateAction({
                        action: 'remove-shortlist',
                        status: 'Applied',
                        label: 'Remove from Shortlist',
                        title: 'Remove from shortlist',
                        message: (name) =>
                          `Remove shortlist status for ${name}? Candidate will remain active in the pipeline.`,
                        accent: 'violet',
                      });
                    }}
                    className="w-full rounded-lg border border-zinc-300 bg-white px-4 py-2 text-sm font-semibold text-zinc-800 transition hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 dark:hover:bg-zinc-800"
                  >
                    Remove from Shortlist
                  </button>
                ) : null}

                {candidate.submission_status === 'Interview' ? (
                  <button
                    type="button"
                    disabled={!canMarkInterviewDone || isCompletingInterview}
                    onClick={async (event) => {
                      event.stopPropagation();

                      if (!canMarkInterviewDone) {
                        showToast({
                          title: 'Interview not ready',
                          description: interviewProgressHint ?? 'Only accepted interviews can be marked as done.',
                          tone: 'warning',
                        });
                        return;
                      }

                      setIsCompletingInterview(true);
                      try {
                        const updatedInterview = await completeInterview();
                        showToast({
                          title: 'Interview marked done',
                          description: `${updatedInterview.candidateName} can now be rejected or moved to offer stage.`,
                          tone: 'success',
                        });
                      } catch (error) {
                        const description =
                          error instanceof ApiError
                            ? ((error.data as { message?: string } | null)?.message ?? error.message)
                            : error instanceof Error
                              ? error.message
                              : 'Unable to mark the interview as done.';

                        showToast({ title: 'Completion failed', description, tone: 'error' });
                      } finally {
                        setIsCompletingInterview(false);
                      }
                    }}
                    className={`w-full rounded-lg border px-4 py-2 text-sm font-semibold transition ${
                      canMarkInterviewDone && !isCompletingInterview
                        ? 'border-zinc-300 bg-white text-zinc-800 hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 dark:hover:bg-zinc-800'
                        : 'cursor-not-allowed border-zinc-200 bg-zinc-100 text-zinc-400 opacity-60 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-500'
                    }`}
                  >
                    {isCompletingInterview ? 'Marking Done...' : 'Mark Interview Done'}
                  </button>
                ) : null}

                {candidate.submission_status === 'Interview' ? (
                  <button
                    type="button"
                    disabled={!canOpenOfferModal}
                    onClick={(event) => {
                      event.stopPropagation();
                      if (!canOpenOfferModal) {
                        showToast({
                          title: 'Offer unavailable',
                          description: interviewProgressHint ?? 'Complete the accepted interview before sending an offer.',
                          tone: 'warning',
                        });
                        return;
                      }

                      openOfferModal();
                    }}
                    className={`w-full rounded-lg border px-4 py-2 text-sm font-semibold transition ${
                      canOpenOfferModal
                        ? 'border-zinc-900 bg-zinc-900 text-white hover:bg-zinc-700 dark:border-zinc-100 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-white'
                        : 'cursor-not-allowed border-zinc-200 bg-zinc-100 text-zinc-400 opacity-60 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-500'
                    }`}
                  >
                    Send Offer
                  </button>
                ) : null}

                <button
                  type="button"
                  disabled={!canRejectCandidate}
                  onClick={(event) => {
                    // Stop propagation so reject actions do not bubble into parent page handlers.
                    event.stopPropagation();
                    if (!canRejectCandidate) {
                      showToast({
                        title: 'Reject unavailable',
                        description: interviewProgressHint ?? 'Complete the accepted interview before rejecting this candidate.',
                        tone: 'warning',
                      });
                      return;
                    }
                    void requestCandidateAction({
                      action: 'reject',
                      status: 'Rejected',
                      label: 'Reject',
                      title: 'Reject candidate',
                      message: (name) => `Are you sure you want to reject ${name}?`,
                      accent: 'red',
                    });
                  }}
                  className={`w-full rounded-lg border px-4 py-2 text-sm font-semibold transition ${
                    canRejectCandidate
                      ? 'border-rose-300 bg-white text-rose-700 hover:bg-rose-50 dark:border-rose-900/60 dark:bg-zinc-900 dark:text-rose-300 dark:hover:bg-rose-500/10'
                      : 'cursor-not-allowed border-zinc-200 bg-zinc-100 text-zinc-400 opacity-60 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-500'
                  }`}
                >
                  Reject Candidate
                </button>
              </>
            ) : (
              <StatusBadge
                status={candidate.submission_status}
                label={
                  candidate.submission_status === 'Hired'
                    ? 'Candidate hired'
                    : candidate.submission_status === 'Rejected'
                      ? 'Candidate rejected'
                      : 'View only'
                }
                size="md"
              />
            )}
          </div>
        </RecruiterSectionCard>

        <RecruiterSectionCard title="Education" variant="compact">
          {parsedResume?.education?.length ? (
            <div className="space-y-2 text-sm">
              {parsedResume.education.map((item, index) => (
                <div key={`${item.degree}-${index}`} className="rounded-lg border border-zinc-200 p-3 dark:border-zinc-700 dark:bg-zinc-900/60">
                  <p className="flex items-center gap-2 font-semibold text-zinc-800 dark:text-zinc-100">
                    <GraduationCap className="h-4 w-4 dark:text-zinc-500" /> {item.degree || 'Education'}
                  </p>
                  <p className="mt-1 text-zinc-500 dark:text-zinc-400">
                    {[item.start_date, item.end_date].filter(Boolean).join(' - ') || 'Date not available'}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-zinc-500 dark:text-zinc-400">No education extracted.</p>
          )}
        </RecruiterSectionCard>
      </Card>

      <div className="space-y-4">
        {(candidate.submission_status !== 'Applied' && candidate.submission_status !== 'Recommended') ? (
          <RecruiterSectionCard title="Fit explanation" variant="compact">
            {hasCandidateExplanation(candidate) && candidateExplanation ? (
              <div className="rounded-lg border border-blue-200 bg-blue-50 p-4 dark:border-blue-900/60 dark:bg-blue-500/10">
                <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-blue-700 dark:text-blue-300">AI-assisted insight</p>
                <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">Why this candidate is a good fit</p>
                {candidateExplanation.summary ? (
                  <p className="mt-1 text-sm leading-6 text-zinc-700 dark:text-zinc-300">
                    {candidateExplanation.summary}
                  </p>
                ) : null}
                {candidateExplanation.strengths.length ? (
                  <ul className="mt-2 list-disc space-y-1 pl-5 text-sm leading-6 text-zinc-700 dark:text-zinc-300">
                    {candidateExplanation.strengths.map((item, index) => (
                      <li key={`${item}-${index}`}>{item}</li>
                    ))}
                  </ul>
                ) : (
                  <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">No key strengths were extracted.</p>
                )}
                {candidateExplanation.gaps?.length ? (
                  <div className="mt-4 space-y-1">
                    <p className="text-sm font-medium text-zinc-800 dark:text-zinc-100">Possible gaps</p>
                    <ul className="list-disc space-y-1 pl-5 text-sm leading-6 text-zinc-700 dark:text-zinc-300">
                      {candidateExplanation.gaps.map((item, index) => (
                        <li key={`${item}-${index}`}>{item}</li>
                      ))}
                    </ul>
                  </div>
                ) : null}
                {candidateExplanation.recommendation ? (
                  <div className="mt-4 space-y-1">
                    <p className="text-sm font-medium text-zinc-800 dark:text-zinc-100">Notes</p>
                    <p className="text-sm leading-6 text-zinc-700 dark:text-zinc-300">{candidateExplanation.recommendation}</p>
                  </div>
                ) : null}
              </div>
            ) : (
              <div className="rounded-lg border border-zinc-200 bg-zinc-50 p-3 dark:border-zinc-700 dark:bg-zinc-900/60">
                <p className="text-sm text-zinc-500 dark:text-zinc-400">Explanation not available yet.</p>
              </div>
            )}
          </RecruiterSectionCard>
        ) : null}

        <RecruiterSectionCard title="Professional Summary" variant="compact">
          {parsedResume?.summary?.length ? (
            <p className="text-sm leading-7 text-zinc-700 dark:text-zinc-300">{parsedResume.summary.join(' ')}</p>
          ) : (
            <p className="text-sm text-zinc-500 dark:text-zinc-400">No summary extracted from parsed resume.</p>
          )}
        </RecruiterSectionCard>

        <RecruiterSectionCard title="Skills" variant="compact">
          {parsedResume?.skills?.length ? (
            <div className="flex flex-wrap gap-2">
              {parsedResume.skills.map((skill) => (
                <span
                  key={skill}
                  className="rounded-md border border-zinc-300 bg-zinc-100 px-3 py-1 text-xs font-medium text-zinc-700 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300"
                >
                  {skill}
                </span>
              ))}
            </div>
          ) : (
            <p className="text-sm text-zinc-500 dark:text-zinc-400">No skills extracted.</p>
          )}
        </RecruiterSectionCard>

        <RecruiterSectionCard title="Work Experience" variant="compact">
          {parsedResume?.work_experience?.length ? (
            <div className="space-y-3">
              {parsedResume.work_experience.map((role, index) => (
                <WorkExperienceCard key={`${role.job_title}-${index}`} role={role} />
              ))}
            </div>
          ) : (
            <p className="text-sm text-zinc-500 dark:text-zinc-400">No work experience extracted.</p>
          )}
        </RecruiterSectionCard>

        <RecruiterSectionCard title="Projects" variant="compact">
          {parsedResume?.projects?.length ? (
            <div className="grid gap-3 lg:grid-cols-1">
              {parsedResume.projects.map((project, index) => (
                <ProjectCard key={`${project.name}-${index}`} project={project} />
              ))}
            </div>
          ) : (
            <p className="text-sm text-zinc-500 dark:text-zinc-400">No projects extracted.</p>
          )}
        </RecruiterSectionCard>
      </div>

      {!isReadOnly && isInterviewOpen ? (
        <InterviewModal
          open={isInterviewOpen}
          form={interviewForm}
          isSubmitting={isSchedulingInterview}
          errors={interviewErrors}
          onClose={closeCandidateModals}
          onChange={(field, value) => {
            setInterviewForm((state) => ({ ...state, [field]: value }));
            setInterviewErrors((current) => {
              if (!current[field] && !current.form) {
                return current;
              }

              const next = { ...current };
              delete next[field];
              delete next.form;
              return next;
            });
          }}
          onSubmit={async (event) => {
            event.preventDefault();
            if (isSchedulingInterview) {
              return;
            }

            setInterviewErrors({});
            setIsSchedulingInterview(true);
            try {
              // Interview scheduling is restricted to CandidateDetailPage
              // because interview configuration requires detailed candidate context.
              const scheduledInterview = await scheduleInterview();
              setCandidate((current) => ({
                ...current,
                submission_status: 'Interview',
              }));
              revalidator.revalidate();
              showToast({
                title: scheduledInterview.warningMessage ? 'Interview scheduled with warning' : 'Interview scheduled successfully',
                description:
                  scheduledInterview.warningMessage
                  ?? 'Candidate moved to interview stage and the schedule was saved.',
                tone: scheduledInterview.warningMessage ? 'warning' : 'success',
              });
              resetInterviewForm();
              closeCandidateModals();
            } catch (error) {
              const description =
                error instanceof ApiError
                  ? ((error.data as { message?: string } | null)?.message ?? error.message)
                  : error instanceof Error
                    ? error.message
                    : 'Unable to schedule interview. Please try again.';

              setInterviewErrors({ form: buildInterviewScheduleErrorMessage(description) });
              showToast({ title: 'Interview scheduling failed', description, tone: 'error' });
            } finally {
              setIsSchedulingInterview(false);
            }
          }}
        />
      ) : null}

      {!isReadOnly && isOfferOpen ? (
        <OfferModal
          open={isOfferOpen}
          form={offerForm}
          titleSuggestions={Array.from(new Set([candidate.job_title, candidate.offer?.title ?? ''].filter(Boolean)))}
          errors={offerErrors}
          isSubmitting={isSendingOffer}
          minStartDate={minimumOfferStartDate}
          minExpirationDate={minimumOfferExpirationDate}
          onClose={closeCandidateModals}
          onChange={updateOfferFormField}
          onSubmit={async (event) => {
            event.preventDefault();
            if (isSendingOffer) {
              return;
            }

            const validationErrors = validateOfferForm();
            if (Object.keys(validationErrors).length > 0) {
              setOfferErrors(validationErrors);
              return;
            }

            const salaryAmount = Number.parseFloat(offerForm.salaryAmount);
            setOfferErrors({});
            setIsSendingOffer(true);
            const succeeded = await runCandidateAction(
              'offer',
              'Offer',
              'Offer sent successfully',
              'Offer details were saved and sent to the candidate.',
              {
                title: offerForm.title.trim(),
                message: richTextToPlainText(offerForm.message),
                benefits: richTextToPlainText(offerForm.benefits),
                salary_text: offerSalaryPreview,
                salary_amount: salaryAmount,
                salary_type: offerForm.salaryType.trim(),
                currency: offerForm.currency.trim(),
                employment_type: offerForm.employmentType.trim(),
                work_setup: offerForm.workSetup.trim(),
                start_date: offerForm.startDate || null,
                end_date: offerForm.endDate || null,
                expiration_date: offerForm.expirationDate || null,
              },
            );
            setIsSendingOffer(false);
            if (succeeded) {
              closeCandidateModals();
            }
          }}
        />
      ) : null}
    </div>
  );
};

