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

import { useToast } from '@app/providers/ToastProvider';
import { RecruiterSectionCard } from '@features/recruiter/components/RecruiterSectionCard';
import { OfferModal, type OfferFormValues } from '@features/recruiter/pages/CandidateDetailPage/components/OfferModal';
import {
  InterviewModal,
  type InterviewFormValues,
} from '@features/recruiter/pages/CandidateDetailPage/components/InterviewModal';
import { ProjectCard } from '@features/recruiter/pages/CandidateDetailPage/components/ProjectCard';
import { WorkExperienceCard } from '@features/recruiter/pages/CandidateDetailPage/components/WorkExperienceCard';
import { recruiterInterviewService } from '@features/recruiter/services/interview.service';
import { recruiterService } from '@features/recruiter/service/recruiter.service';

import type {
  ApplicantDetailDto,
  CandidateDetailAction,
  CandidateStage,
} from '@features/recruiter/types';
import { ApiError } from '@shared/api/http';
import { Card } from '@shared/components/Card';
import { StatusBadge } from '@shared/components/StatusBadge';
import { useConfirmation } from '@shared/hooks/useConfirmation';
import { usePermissions } from '@shared/hooks/usePermissions';
import { formatJobLabel } from '@shared/utils/jobLabels';
import { sanitizeRichText } from '@shared/utils/richText';

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
  Interview: {
    action: 'offer',
    status: 'Offer',
    label: 'Send Offer',
    title: 'Send offer',
    message: (name) => `Send an offer to ${name}?`,
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
  const { candidate: loaderCandidate } = useLoaderData() as { candidate: ApplicantDetailDto };
  const [candidate, setCandidate] = useState(loaderCandidate);
  const [isDownloadingResume, setIsDownloadingResume] = useState(false);
  const [isInterviewOpen, setIsInterviewOpen] = useState(false);
  const [isOfferOpen, setIsOfferOpen] = useState(false);
  const [isSchedulingInterview, setIsSchedulingInterview] = useState(false);
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
    salaryText: '',
    employmentType: '',
    startDate: '',
    expirationDate: '',
    message: '',
  });

  const { showToast } = useToast();
  const confirm = useConfirmation();
  const { canSendOffers, canHireCandidates } = usePermissions();
  const revalidator = useRevalidator();
  const parsedResume = candidate.parsed_resume_json;
  const candidateExplanation = candidate.candidate_explanation;
  const personalInfo = parsedResume?.personal_info;
  const hasResume = candidate.has_resume;

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
  };

  const closeCandidateModals = () => {
    setIsInterviewOpen(false);
    setIsOfferOpen(false);
  };

  const openInterviewModal = () => {
    setIsOfferOpen(false);
    setIsInterviewOpen(true);
  };

  const openOfferModal = () => {
    setIsInterviewOpen(false);
    setIsOfferOpen(true);
  };

  useEffect(() => {
    setCandidate(loaderCandidate);
  }, [loaderCandidate]);
  useEffect(() => {
    setOfferForm((current) => ({
      ...current,
      title: loaderCandidate.offer?.title || loaderCandidate.job_title,
    }));
  }, [loaderCandidate.job_title, loaderCandidate.offer?.title]);

  const primaryAction = useMemo(
    () =>
      candidate.submission_status === 'Offer'
        ? candidate.offer?.can_mark_hired
          ? {
              action: 'hire',
              status: 'Hire' as CandidateStage,
              label: 'Mark Hired',
              title: 'Hire candidate',
              message: (name: string) => `Mark ${name} as hired?`,
              accent: 'green' as const,
            }
          : undefined
        : nextActionByStage[candidate.submission_status],
    [candidate.offer?.can_mark_hired, candidate.submission_status],
  );

  const canRunAction = (action: CandidateDetailAction) => {
    if (action.action === 'offer') {
      return canSendOffers;
    }

    if (action.action === 'hire') {
      return canHireCandidates;
    }

    return true;
  };

  const describeActionSuccess = (action: CandidateDetailAction, statusToRun: CandidateStage) =>
    action.action === 'reject'
      ? `${candidate.applicant_name} has been marked as rejected.`
      : `${candidate.applicant_name} is now in ${statusToRun} stage.`;

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
            : 'You do not have permission to hire candidates in the current recruiter context.',
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
      salary_text: string;
      employment_type: string;
      start_date?: string | null;
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
      } else if (action === 'hire') {
        const updatedCandidate = await recruiterService.markHired(candidate.resume_submission_id);
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

  const downloadResume = async () => {
    if (!hasResume) {
      return;
    }

    setIsDownloadingResume(true);
    try {
      const result = await recruiterService.getApplicantResumeDownload(candidate.resume_submission_id);
      const link = document.createElement('a');
      link.href = result.download_url;
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
    <div className="grid gap-4 xl:grid-cols-[350px_minmax(0,1fr)]">
      <Card className="h-fit overflow-hidden p-0">
        <div className="bg-linear-to-b from-slate-50 to-white px-5 py-6">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-linear-to-br from-slate-400 to-slate-600 text-3xl font-bold text-white shadow-md">
            {getInitials(candidate.applicant_name)}
          </div>
          <h2 className="mt-4 text-center text-md font-bold text-zinc-900">{candidate.applicant_name}</h2>
          <p className="text-center text-sm text-zinc-500">{personalInfo?.job_target || candidate.job_title}</p>

          <div className="mt-4 space-y-2 border-t border-zinc-200 pt-4 text-sm text-zinc-700">
            <p className="flex items-center gap-2">
              <Mail className="h-4 w-4 text-zinc-400" /> {candidate.applicant_email}
            </p>
            <p className="flex items-center gap-2">
              <Phone className="h-4 w-4 text-zinc-400" /> {personalInfo?.phone || 'Not available'}
            </p>
            <p className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-zinc-400" /> {personalInfo?.location || 'Location not provided'}
            </p>
          </div>

          <div className="mt-4 space-y-3 border-t border-zinc-200 pt-4">
            <div className="flex items-center justify-between text-sm">
              <span className="text-zinc-500">ATS Score</span>
              <span className="font-semibold text-zinc-800">{candidate.score}%</span>
            </div>
            <div className="h-2 rounded-full bg-zinc-200">
              <div
                className="h-2 rounded-full bg-linear-to-r from-zinc-800 to-gray-700"
                style={{ width: `${Math.max(10, Math.min(100, candidate.score))}%` }}
              />
            </div>
            <p className="text-xs text-zinc-500 capitalize">
              {parsedResume?.derived?.education_max_level || 'Education level unknown'} -{' '}
              {monthsToText(parsedResume?.derived?.total_experience_months)} experience
            </p>
          </div>

          {primaryAction ? (
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
              disabled={
                (candidate.submission_status === 'Interview' && !canSendOffers)
                || (candidate.submission_status === 'Offer'
                  && (!canHireCandidates || !candidate.offer?.can_mark_hired))
              }
              className="mt-5 w-full rounded-lg bg-zinc-900 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-zinc-600 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {primaryAction.label}
            </button>
          ) : null}
          {candidate.submission_status === 'Offer' && !candidate.offer?.can_mark_hired ? (
            <p className="mt-3 text-center text-xs text-zinc-500">
              Hire is available only after the candidate accepts the latest offer.
            </p>
          ) : null}
        </div>

        <RecruiterSectionCard title="Application Info" variant="compact">
          <ul className="space-y-2 text-sm">
            <li className="flex items-center justify-between">
              <span className="text-zinc-500">Applied:</span>
              <span className="font-semibold text-zinc-800">
                {new Date(candidate.created_at_utc).toLocaleDateString()}
              </span>
            </li>
            <li className="flex items-center justify-between">
              <span className="text-zinc-500">Stage:</span>
              <StatusBadge status={candidate.submission_status} />
            </li>
            <li className="flex items-center justify-between">
              <span className="text-zinc-500">ATS Score:</span>
              <span className="font-semibold text-zinc-800">{candidate.score}</span>
            </li>
          </ul>
        </RecruiterSectionCard>

        <RecruiterSectionCard title="Offer Status" variant="compact">
          {candidate.offer ? (
            <div className="space-y-3 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-zinc-500">Current offer</span>
                <StatusBadge status={candidate.offer.status} />
              </div>
              <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-3">
                <p className="font-semibold text-zinc-900">{candidate.offer.title}</p>
                <p className="mt-1 text-zinc-600">{candidate.offer.salary_text}</p>
                <p className="mt-1 text-xs uppercase tracking-[0.14em] text-zinc-500">
                  {formatJobLabel(candidate.offer.employment_type)}
                </p>
              </div>
              <div className="space-y-2 rounded-2xl border border-zinc-200 bg-white p-3">
                <p className="flex items-center gap-2 text-zinc-600">
                  <CalendarDays className="h-4 w-4 text-zinc-400" />
                  Start date: <span className="font-semibold text-zinc-800">{formatDateLabel(candidate.offer.start_date)}</span>
                </p>
                <p className="flex items-center gap-2 text-zinc-600">
                  <ReceiptText className="h-4 w-4 text-zinc-400" />
                  Expires: <span className="font-semibold text-zinc-800">{formatDateLabel(candidate.offer.expiration_date)}</span>
                </p>
                <p className="text-xs text-zinc-500">
                  Sent {new Date(candidate.offer.sent_at_utc).toLocaleString()}
                  {candidate.offer.responded_at_utc ? ` • Responded ${new Date(candidate.offer.responded_at_utc).toLocaleString()}` : ''}
                </p>
              </div>
              {candidate.offer.message ? (
                <div className="rounded-2xl border border-zinc-200 bg-white p-3 text-zinc-600">
                  {candidate.offer.message}
                </div>
              ) : null}
              {canSendOffers && candidate.offer.status !== 'Accepted' && candidate.offer.status !== 'Pending' ? (
                <button
                  type="button"
                  onClick={openOfferModal}
                  className="w-full rounded-xl border border-zinc-300 bg-white px-4 py-2.5 text-sm font-semibold text-zinc-800 transition hover:bg-zinc-50"
                >
                  Send new offer
                </button>
              ) : null}
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed border-zinc-300 bg-zinc-50 p-4 text-sm text-zinc-500">
              No offer has been sent yet. Once the candidate is ready, send an offer from this page.
            </div>
          )}
        </RecruiterSectionCard>

        <RecruiterSectionCard title="Resume Information" variant="compact">
          <div className="space-y-2 text-sm">
            <p className="text-zinc-600">
              Resume ID: <span className="font-semibold text-zinc-800">{candidate.resume_submission_id.slice(0, 8)}</span>
            </p>
            {candidate.resume_file_name ? (
             <p className="text-zinc-600">
              File:{' '}
              <span className="inline-block max-w-2xl truncate align-bottom font-semibold text-zinc-800">
                {candidate.resume_file_name}
              </span>
            </p>
            ) : null}
            <p className="text-zinc-600">
              Parsed: <span className="font-semibold text-emerald-600">Successfully</span>
            </p>
            <button
              type="button"
              onClick={() => {
                void downloadResume();
              }}
              disabled={!hasResume || isDownloadingResume}
              className="mt-2 flex w-full items-center justify-center gap-2 rounded-lg bg-zinc-800 px-3 py-2 text-sm font-semibold text-white hover:bg-gray-600 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <Download className="h-4 w-4" /> {isDownloadingResume ? 'Preparing...' : 'Download Resume'}
            </button>
          </div>
        </RecruiterSectionCard>

        <RecruiterSectionCard title="Recruiter Actions" variant="compact">
          <div className="space-y-2">
            <p className="flex items-center gap-2 text-sm text-zinc-600">
              <BriefcaseBusiness className="h-4 w-4" /> {candidate.job_title}
            </p>
            {candidate.submission_status !== 'Rejected' ? (
              <>
                {candidate.submission_status === 'Interview' ? (
                  <button
                    type="button"
                    onClick={(event) => {
                      // Stop propagation so shortlist actions do not bubble into parent page handlers.
                      event.stopPropagation();
                      void requestCandidateAction({
                        action: 'shortlist',
                        status: 'Shortlisted',
                        label: 'Shortlist',
                        title: 'Shortlist candidate',
                        message: (name) => `Move ${name} back to Shortlisted stage?`,
                        accent: 'violet',
                      });
                    }}
                    className="w-full rounded-lg border border-violet-300 bg-white px-4 py-2 text-sm font-semibold text-violet-700 transition hover:bg-violet-50"
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
                    className="w-full rounded-lg border border-violet-300 bg-white px-4 py-2 text-sm font-semibold text-violet-700 transition hover:bg-violet-50"
                  >
                    Remove from Shortlist
                  </button>
                ) : null}

                <button
                  type="button"
                  onClick={(event) => {
                    // Stop propagation so reject actions do not bubble into parent page handlers.
                    event.stopPropagation();
                    void requestCandidateAction({
                      action: 'reject',
                      status: 'Rejected',
                      label: 'Reject',
                      title: 'Reject candidate',
                      message: (name) => `Are you sure you want to reject ${name}?`,
                      accent: 'red',
                    });
                  }}
                  className="w-full rounded-lg border border-rose-300 bg-white px-4 py-2 text-sm font-semibold text-rose-700 transition hover:bg-rose-50"
                >
                  Reject Candidate
                </button>
              </>
            ) : (
              <StatusBadge
                status={candidate.submission_status}
                label="Candidate rejected"
                size="md"
              />
            )}
          </div>
        </RecruiterSectionCard>

        <RecruiterSectionCard title="Education" variant="compact">
          {parsedResume?.education?.length ? (
            <div className="space-y-2 text-sm">
              {parsedResume.education.map((item, index) => (
                <div key={`${item.degree}-${index}`} className="rounded-lg border border-zinc-200 p-3">
                  <p className="flex items-center gap-2 font-semibold text-zinc-800">
                    <GraduationCap className="h-4 w-4" /> {item.degree || 'Education'}
                  </p>
                  <p className="mt-1 text-zinc-500">
                    {[item.start_date, item.end_date].filter(Boolean).join(' - ') || 'Date not available'}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-zinc-500">No education extracted.</p>
          )}
        </RecruiterSectionCard>
      </Card>

      <div className="space-y-4">
        {(candidate.submission_status !== 'Applied' && candidate.submission_status !== 'Recommended') ? (
          <RecruiterSectionCard title="Fit explanation" variant="compact">
            {hasCandidateExplanation(candidate) && candidateExplanation ? (
              <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
                <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-blue-700">AI-assisted insight</p>
                <p className="text-sm font-semibold text-zinc-900">Why this candidate is a good fit</p>
                {candidateExplanation.summary ? (
                  <p className="mt-1 text-sm leading-6 text-zinc-700">
                    {candidateExplanation.summary}
                  </p>
                ) : null}
                {candidateExplanation.strengths.length ? (
                  <ul className="mt-2 list-disc space-y-1 pl-5 text-sm leading-6 text-zinc-700">
                    {candidateExplanation.strengths.map((item, index) => (
                      <li key={`${item}-${index}`}>{item}</li>
                    ))}
                  </ul>
                ) : (
                  <p className="mt-2 text-sm text-zinc-500">No key strengths were extracted.</p>
                )}
                {candidateExplanation.gaps?.length ? (
                  <div className="mt-4 space-y-1">
                    <p className="text-sm font-medium text-zinc-800">Possible gaps</p>
                    <ul className="list-disc space-y-1 pl-5 text-sm leading-6 text-zinc-700">
                      {candidateExplanation.gaps.map((item, index) => (
                        <li key={`${item}-${index}`}>{item}</li>
                      ))}
                    </ul>
                  </div>
                ) : null}
                {candidateExplanation.recommendation ? (
                  <div className="mt-4 space-y-1">
                    <p className="text-sm font-medium text-zinc-800">Notes</p>
                    <p className="text-sm leading-6 text-zinc-700">{candidateExplanation.recommendation}</p>
                  </div>
                ) : null}
              </div>
            ) : (
              <div className="rounded-lg border border-zinc-200 bg-zinc-50 p-3">
                <p className="text-sm text-zinc-500">Explanation not available yet.</p>
              </div>
            )}
          </RecruiterSectionCard>
        ) : null}

        <RecruiterSectionCard title="Professional Summary" variant="compact">
          {parsedResume?.summary?.length ? (
            <p className="text-sm leading-7 text-zinc-700">{parsedResume.summary.join(' ')}</p>
          ) : (
            <p className="text-sm text-zinc-500">No summary extracted from parsed resume.</p>
          )}
        </RecruiterSectionCard>

        <RecruiterSectionCard title="Skills" variant="compact">
          {parsedResume?.skills?.length ? (
            <div className="flex flex-wrap gap-2">
              {parsedResume.skills.map((skill) => (
                <span key={skill} className="rounded-md border border-zinc-300 bg-zinc-100 px-3 py-1 text-xs font-medium text-zinc-700">
                  {skill}
                </span>
              ))}
            </div>
          ) : (
            <p className="text-sm text-zinc-500">No skills extracted.</p>
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
            <p className="text-sm text-zinc-500">No work experience extracted.</p>
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
            <p className="text-sm text-zinc-500">No projects extracted.</p>
          )}
        </RecruiterSectionCard>
      </div>

      {isInterviewOpen ? (
        <InterviewModal
          open={isInterviewOpen}
          form={interviewForm}
          isSubmitting={isSchedulingInterview}
          onClose={closeCandidateModals}
          onChange={(field, value) => setInterviewForm((state) => ({ ...state, [field]: value }))}
          onSubmit={async (event) => {
            event.preventDefault();
            if (isSchedulingInterview) {
              return;
            }

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

              showToast({ title: 'Interview scheduling failed', description, tone: 'error' });
            } finally {
              setIsSchedulingInterview(false);
            }
          }}
        />
      ) : null}

      {isOfferOpen ? (
        <OfferModal
          open={isOfferOpen}
          form={offerForm}
          onClose={closeCandidateModals}
          onChange={(field, value) => setOfferForm((state) => ({ ...state, [field]: value }))}
          onSubmit={async (event) => {
            event.preventDefault();
            const succeeded = await runCandidateAction(
              'offer',
              'Offer',
              'Offer sent successfully',
              'Offer details were saved and sent to the candidate.',
              {
                title: offerForm.title.trim(),
                message: sanitizeRichText(offerForm.message) || '',
                salary_text: offerForm.salaryText.trim(),
                employment_type: offerForm.employmentType.trim(),
                start_date: offerForm.startDate || null,
                expiration_date: offerForm.expirationDate || null,
              },
            );
            if (succeeded) {
              closeCandidateModals();
            }
          }}
        />
      ) : null}
    </div>
  );
};
