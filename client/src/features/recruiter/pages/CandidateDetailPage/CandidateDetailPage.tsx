/**
 * Recruiter candidate detail page for reviewing parsed resume data and advancing pipeline stages.
 *
 * Main exports:
 * - `CandidateDetailPage`: Route component for a single applicant detail view.
 *
 * Usage notes:
 * - The route expects loader data shaped as `{ candidate: ApplicantDetailDto }`.
 * - Stage transition buttons intentionally follow the current recruiter workflow.
 * - Interview and offer dialogs currently collect UI-only details before moving the candidate stage.
 * - TODO: wire interview and offer form payloads into backend mutations when those APIs are finalized.
 */
import { useMemo, useState } from 'react';
import { useLoaderData, useRevalidator } from 'react-router-dom';
import {
  BriefcaseBusiness,
  Download,
  GraduationCap,
  Mail,
  MapPin,
  Phone,
} from 'lucide-react';

import { useToast } from '@app/providers/ToastProvider';
import { RecruiterSectionCard } from '@features/recruiter/components/RecruiterSectionCard';
import { OfferModal, type OfferFormValues } from '@features/recruiter/pages/CandidateDetailPage/components/modals/OfferModal';
import {
  InterviewModal,
  type InterviewFormValues,
} from '@features/recruiter/pages/CandidateDetailPage/components/modals/InterviewModal';
import { ProjectCard } from '@features/recruiter/pages/CandidateDetailPage/components/ProjectCard';
import { WorkExperienceCard } from '@features/recruiter/pages/CandidateDetailPage/components/WorkExperienceCard';
import { recruiterService } from '@features/recruiter/service/recruiter.service';
import type {
  ApplicantDetailDto,
  CandidateDetailAction,
  CandidateStage,
} from '@features/recruiter/types';
import { ApiError } from '@shared/api/http';
import { Card } from '@shared/components/Card';
import { ConfirmationModal } from '@shared/components/ConfirmationModal';

const stageBadgeClass: Record<CandidateStage, string> = {
  Applied: 'border-zinc-200 bg-zinc-100 text-zinc-700',
  Recommended: 'border-indigo-200 bg-indigo-50 text-indigo-700',
  Shortlisted: 'border-emerald-200 bg-emerald-50 text-emerald-700',
  Interview: 'border-violet-200 bg-violet-50 text-violet-700',
  Offer: 'border-amber-200 bg-amber-50 text-amber-700',
  Hire: 'border-teal-200 bg-teal-50 text-teal-700',
  Rejected: 'border-rose-200 bg-rose-50 text-rose-700',
};

const nextActionByStage: Partial<Record<CandidateStage, CandidateDetailAction>> = {
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
    label: 'Offer',
    title: 'Send offer',
    message: (name) => `Move ${name} to Offer stage?`,
    accent: 'green',
  },
  Offer: {
    action: 'hire',
    status: 'Hire',
    label: 'Hire',
    title: 'Hire candidate',
    message: (name) => `Move ${name} to Hire stage?`,
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

/**
 * Route component for recruiter candidate details.
 */
export const CandidateDetailPage = () => {
  const { candidate: loaderCandidate } = useLoaderData() as { candidate: ApplicantDetailDto };
  const [candidate, setCandidate] = useState(loaderCandidate);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [isInterviewOpen, setIsInterviewOpen] = useState(false);
  const [isOfferOpen, setIsOfferOpen] = useState(false);
  const [pendingAction, setPendingAction] = useState<CandidateDetailAction | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [interviewForm, setInterviewForm] = useState<InterviewFormValues>({
    date: '',
    time: '',
    mode: 'Virtual',
    location: '',
    notes: '',
  });
  const [offerForm, setOfferForm] = useState<OfferFormValues>({
    role: candidate.job_title,
    packageSummary: '',
    startDate: '',
    message: '',
  });

  const { showToast } = useToast();
  const revalidator = useRevalidator();
  const parsedResume = candidate.parsed_resume_json;
  const personalInfo = parsedResume?.personal_info;

  const primaryAction = useMemo(
    () => nextActionByStage[candidate.submission_status],
    [candidate.submission_status],
  );

  const runStageTransition = async (
    action: string,
    status: CandidateStage,
    successTitle: string,
    successDescription: string,
  ) => {
    try {
      setIsSubmitting(true);
      const result = await recruiterService.updateApplicantStatuses([candidate.resume_submission_id], {
        action,
        status,
      });
      const itemResult = result.results[0];

      if (itemResult && !itemResult.success) {
        throw new Error(itemResult.message);
      }

      setCandidate((current) => ({ ...current, submission_status: status }));
      showToast({ title: successTitle, description: successDescription, tone: 'success' });
      revalidator.revalidate();
    } catch (error) {
      const description =
        error instanceof ApiError
          ? ((error.data as { message?: string } | null)?.message ?? error.message)
          : error instanceof Error
            ? error.message
            : 'Unable to update candidate stage. Please try again.';

      showToast({ title: 'Action failed', description, tone: 'error' });
    } finally {
      setIsSubmitting(false);
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
              onClick={() => {
                if (candidate.submission_status === 'Shortlisted') {
                  setIsInterviewOpen(true);
                } else if (candidate.submission_status === 'Interview') {
                  setIsOfferOpen(true);
                } else {
                  setPendingAction(primaryAction);
                  setIsConfirmOpen(true);
                }
              }}
              className="mt-5 w-full rounded-lg bg-zinc-900 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-zinc-600"
            >
              {primaryAction.label}
            </button>
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
              <span className={`rounded-md border px-2 py-0.5 text-xs font-semibold ${stageBadgeClass[candidate.submission_status]}`}>
                {candidate.submission_status}
              </span>
            </li>
            <li className="flex items-center justify-between">
              <span className="text-zinc-500">ATS Score:</span>
              <span className="font-semibold text-zinc-800">{candidate.score}</span>
            </li>
          </ul>
        </RecruiterSectionCard>

        <RecruiterSectionCard title="Resume Information" variant="compact">
          <div className="space-y-2 text-sm">
            <p className="text-zinc-600">
              Resume ID: <span className="font-semibold text-zinc-800">{candidate.resume_submission_id.slice(0, 8)}</span>
            </p>
            <p className="text-zinc-600">
              Parsed: <span className="font-semibold text-emerald-600">Successfully</span>
            </p>
            <button
              type="button"
              className="mt-2 flex w-full items-center justify-center gap-2 rounded-lg bg-zinc-800 px-3 py-2 text-sm font-semibold text-white hover:bg-gray-600"
            >
              <Download className="h-4 w-4" /> Download Resume
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
                    onClick={() => {
                      setPendingAction({
                        action: 'shortlist',
                        status: 'Shortlisted',
                        label: 'Shortlist',
                        title: 'Shortlist candidate',
                        message: (name) => `Move ${name} back to Shortlisted stage?`,
                        accent: 'violet',
                      });
                      setIsConfirmOpen(true);
                    }}
                    className="w-full rounded-lg border border-violet-300 bg-white px-4 py-2 text-sm font-semibold text-violet-700 transition hover:bg-violet-50"
                  >
                    Shortlist
                  </button>
                ) : null}

                {candidate.submission_status === 'Shortlisted' ? (
                  <button
                    type="button"
                    onClick={() => {
                      setPendingAction({
                        action: 'remove-shortlist',
                        status: 'Applied',
                        label: 'Remove from Shortlist',
                        title: 'Remove from shortlist',
                        message: (name) =>
                          `Remove shortlist status for ${name}? Candidate will remain active in the pipeline.`,
                        accent: 'violet',
                      });
                      setIsConfirmOpen(true);
                    }}
                    className="w-full rounded-lg border border-violet-300 bg-white px-4 py-2 text-sm font-semibold text-violet-700 transition hover:bg-violet-50"
                  >
                    Remove from Shortlist
                  </button>
                ) : null}

                <button
                  type="button"
                  onClick={() => {
                    setPendingAction({
                      action: 'reject',
                      status: 'Rejected',
                      label: 'Reject',
                      title: 'Reject candidate',
                      message: (name) => `Are you sure you want to reject ${name}?`,
                      accent: 'red',
                    });
                    setIsConfirmOpen(true);
                  }}
                  className="w-full rounded-lg border border-rose-300 bg-white px-4 py-2 text-sm font-semibold text-rose-700 transition hover:bg-rose-50"
                >
                  Reject Candidate
                </button>
              </>
            ) : (
              <p className={`rounded-md border px-2 py-1 text-sm font-semibold ${stageBadgeClass[candidate.submission_status]}`}>
                Candidate rejected
              </p>
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
        {candidate.submission_status === 'Shortlisted' ? (
          <RecruiterSectionCard title="Fit explanation" variant="compact">
            {candidate.candidate_explanation?.strengths?.length ? (
              <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
                <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-blue-700">AI-assisted insight</p>
                <p className="text-sm font-semibold text-zinc-900">Why this candidate is a good fit</p>
                {candidate.candidate_explanation.summary ? (
                  <p className="mt-1 text-sm leading-6 text-zinc-700">
                    {candidate.candidate_explanation.summary}
                  </p>
                ) : null}
                <ul className="mt-2 list-disc space-y-1 pl-5 text-sm leading-6 text-zinc-700">
                  {candidate.candidate_explanation.strengths.map((item, index) => (
                    <li key={`${item}-${index}`}>{item}</li>
                  ))}
                </ul>
                {candidate.candidate_explanation.gaps?.length ? (
                  <div className="mt-4 space-y-1">
                    <p className="text-sm font-medium text-zinc-800">Possible gaps</p>
                    <ul className="list-disc space-y-1 pl-5 text-sm leading-6 text-zinc-700">
                      {candidate.candidate_explanation.gaps.map((item, index) => (
                        <li key={`${item}-${index}`}>{item}</li>
                      ))}
                    </ul>
                  </div>
                ) : null}
                <p className="mt-3 text-xs text-zinc-500">These are insights based on the extracted resume</p>
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

      <ConfirmationModal
        open={isConfirmOpen}
        title={pendingAction?.title ?? 'Confirm action'}
        message={pendingAction?.message(candidate.applicant_name) ?? 'Are you sure?'}
        confirmLabel={pendingAction?.label ?? 'Confirm'}
        accent={pendingAction?.accent ?? 'violet'}
        loading={isSubmitting}
        onClose={() => {
          setIsConfirmOpen(false);
          setPendingAction(null);
        }}
        onCancel={() => {
          setIsConfirmOpen(false);
          setPendingAction(null);
        }}
        onConfirm={async () => {
          if (!pendingAction || !pendingAction.status) {
            setIsConfirmOpen(false);
            setPendingAction(null);
            return;
          }

          setIsConfirmOpen(false);
          const actionToRun = pendingAction;
          setPendingAction(null);
          const statusToRun = actionToRun.status;
          if (!statusToRun) {
            return;
          }

          await runStageTransition(
            actionToRun.action,
            statusToRun,
            `Candidate ${actionToRun.label.toLowerCase()} successfully`,
            actionToRun.action === 'reject'
              ? `${candidate.applicant_name} has been marked as rejected.`
              : `${candidate.applicant_name} is now in ${statusToRun} stage.`,
          );
        }}
      />

      <InterviewModal
        open={isInterviewOpen}
        form={interviewForm}
        onClose={() => setIsInterviewOpen(false)}
        onChange={(field, value) => setInterviewForm((state) => ({ ...state, [field]: value }))}
        onSubmit={async (event) => {
          event.preventDefault();
          await runStageTransition(
            'set-interview',
            'Interview',
            'Interview scheduled successfully',
            'Candidate moved to interview stage.',
          );
          setIsInterviewOpen(false);
        }}
      />

      <OfferModal
        open={isOfferOpen}
        form={offerForm}
        onClose={() => setIsOfferOpen(false)}
        onChange={(field, value) => setOfferForm((state) => ({ ...state, [field]: value }))}
        onSubmit={async (event) => {
          event.preventDefault();
          await runStageTransition('offer', 'Offer', 'Offer sent successfully', 'Candidate moved to offer stage.');
          setIsOfferOpen(false);
        }}
      />
    </div>
  );
};



