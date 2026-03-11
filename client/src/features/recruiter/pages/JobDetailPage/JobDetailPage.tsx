import { useEffect, useMemo, useState } from 'react';
import { Link, useLoaderData, useNavigate, useSearchParams } from 'react-router-dom';

import { useToast } from '@app/providers/ToastProvider';
import { ApplicantsCard } from '@features/recruiter/pages/JobDetailPage/components/ApplicantsCard';
import { ApplicantsTrendCard } from '@features/recruiter/pages/JobDetailPage/components/ApplicantsTrendCard';
import { BulletList } from '@features/recruiter/pages/JobDetailPage/components/BulletList';
import { MetadataBadge } from '@features/recruiter/pages/JobDetailPage/components/MetadataBadge';
import { SkillList } from '@features/recruiter/pages/JobDetailPage/components/SkillList';
import { recruiterService } from '@features/recruiter/service/recruiter.service';
import { useSearchParamToast } from '@features/recruiter/hooks/useSearchParamToast';
import type { JobDto, RecruiterJobDetailLoaderData } from '@features/recruiter/types';
import { Card } from '@shared/components/Card';
import { DetailBlock } from '@shared/components/DetailBlock';
import { HighRiskVerificationModal } from '@shared/components/HighRiskVerificationModal';
import { useConfirmation } from '@shared/hooks/useConfirmation';
import { formatCurrencyAmount } from '@shared/data/currency';
import { splitToBullets, toList } from '@shared/utils/formatText';
import { getJobStatusAccent } from '@shared/utils/jobStatusAccent';

const isPublishedJob = (job: JobDto) => job.status?.toLowerCase() === 'published';

export const JobDetailPage = () => {
  const { job: loaderJob, applicants, trend } = useLoaderData() as RecruiterJobDetailLoaderData;
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { showToast } = useToast();
  const confirm = useConfirmation();

  const [job, setJob] = useState(loaderJob);
  const [isVerificationOpen, setIsVerificationOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [deleteError, setDeleteError] = useState<string | undefined>();

  useEffect(() => {
    setJob(loaderJob);
  }, [loaderJob]);



  const statusAccent = getJobStatusAccent(job.status);
  const responsibilities = useMemo(() => splitToBullets(job.responsibilities), [job.responsibilities]);
  const benefits = useMemo(() => splitToBullets(job.benefits), [job.benefits]);
  const requiredSkills = useMemo(() => toList(job.required_skills), [job.required_skills]);
  const preferredSkills = useMemo(() => toList(job.preferred_skills), [job.preferred_skills]);

  const toastHandlers = useMemo(
    () => ({
      created: () => {
        showToast({
          title: 'Job created successfully',
          description: `${job.title} is ready for recruiter workflows.`,
          tone: 'success',
        });
      },
      updated: () => {
        showToast({
          title: 'Job updated successfully',
          description: `${job.title} was updated.`,
          tone: 'success',
        });
      },
    }),
    [job.title, showToast],
  );

  useSearchParamToast({
    searchParams,
    handlers: toastHandlers,
    onCleanup: () => setSearchParams({}, { replace: true }),
  });

  const updateStatus = async (status: 'Draft' | 'Published' | 'Closed') => {
    try {
      setIsUpdatingStatus(true);
      const updated = await recruiterService.updateJobStatus(job.id, status);
      setJob(updated);
      showToast({
        title: 'Job status updated',
        description: `${updated.title} is now ${updated.status}.`,
        tone: 'success',
      });
    } catch {
      showToast({
        title: 'Unable to update job status',
        description: 'Please try again.',
        tone: 'error',
      });
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const deleteJob = async () => {
    try {
      setIsDeleting(true);
      setDeleteError(undefined);
      await recruiterService.deleteJob(job.id);
      showToast({
        title: 'Job deleted successfully',
        description: `${job.title} was removed from your job posts.`,
        tone: 'success',
      });
      setIsVerificationOpen(false);
      navigate('/recruiter/job-posts');
    } catch {
      setDeleteError('Unable to delete this job right now. Please try again.');
      showToast({ title: 'Unable to delete job', description: 'Please try again.', tone: 'error' });
    } finally {
      setIsDeleting(false);
    }
  };

  const openDeleteFlow = async () => {
    if (isDeleting) {
      return;
    }

    setIsVerificationOpen(false);
    setDeleteError(undefined);

    const confirmed = await confirm({
      title: isPublishedJob(job) ? 'Delete published job?' : 'Delete this job?',
      message: isPublishedJob(job)
        ? 'This job is published and needs an additional verification step before deletion.'
        : 'This action permanently removes the job post and cannot be undone.',
      confirmLabel: isPublishedJob(job) ? 'Continue' : 'Delete Job',
      accent: 'red',
    });

    if (!confirmed) {
      return;
    }

    if (isPublishedJob(job)) {
      setIsVerificationOpen(true);
      return;
    }

    await deleteJob();
  };

  return (
    <div className="space-y-4">
      <Card className="bg-zinc-50/60 p-3 sm:p-5">
        <div className="space-y-5">
          <header className="space-y-4 border-b border-zinc-200 pb-4">
            <h1 className="text-2xl font-bold text-zinc-900 sm:text-3xl">{job.title}</h1>
            <div className="flex flex-wrap gap-2">
              <span className={`rounded-lg border px-3 py-1 text-sm font-medium ${statusAccent.className}`}>
                {statusAccent.label}
              </span>
              <MetadataBadge>{job.department ?? 'General'}</MetadataBadge>
              <MetadataBadge>{job.location || 'Location not specified'}</MetadataBadge>
              <MetadataBadge>{job.employment_type || 'Employment type not specified'}</MetadataBadge>
              <MetadataBadge>{job.experience_level || 'Experience level not specified'}</MetadataBadge>
              <MetadataBadge className="font-medium text-zinc-800">
                {formatCurrencyAmount(job.salary_min_per_annum, job.currency)} -{' '}
                {formatCurrencyAmount(job.salary_max_per_annum, job.currency)} / year
              </MetadataBadge>
              <MetadataBadge>
                Vacancies: {job.remaining_vacancies ?? 0} / {job.number_of_vacancies ?? 0}
              </MetadataBadge>
            </div>
          </header>

          <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_260px]">
            <div className="space-y-4">
              <DetailBlock title="About the Role">
                <p className="whitespace-pre-wrap leading-7 text-zinc-700">
                  {job.description || 'No description provided.'}
                </p>
              </DetailBlock>

              <DetailBlock title="Responsibilities">
                <BulletList items={responsibilities} emptyLabel="No responsibilities listed." />
              </DetailBlock>

              <div className="grid gap-4 xl:grid-cols-2">
                <DetailBlock title="Required Skills">
                  <SkillList
                    items={requiredSkills}
                    emptyLabel="No required skills listed."
                    roundedClassName="rounded-full text-xs font-medium"
                  />
                </DetailBlock>
                <DetailBlock title="Preferred Skills">
                  <SkillList
                    items={preferredSkills}
                    emptyLabel="No preferred skills listed."
                    roundedClassName="rounded-lg"
                  />
                </DetailBlock>
              </div>

              <div className="grid gap-4 xl:grid-cols-2">
                <DetailBlock title="Qualifications">
                  <ul className="list-disc space-y-2 pl-5 text-zinc-700">
                    <li>{job.min_years ? `${job.min_years}+ years of experience` : 'Experience not specified'}</li>
                    <li>{job.education || job.min_education || 'Education not specified'}</li>
                    <li>{job.experience_level || 'Role level not specified'}</li>
                  </ul>
                </DetailBlock>
                <DetailBlock title="Work Details">
                  <ul className="space-y-2 text-zinc-700">
                    <li>
                      <span className="font-medium text-zinc-900">Schedule:</span> {job.schedule || 'Not specified'}
                    </li>
                    <li>
                      <span className="font-medium text-zinc-900">Work Setup:</span> {job.work_setup || 'Not specified'}
                    </li>
                    <li>
                      <span className="font-medium text-zinc-900">Location:</span> {job.location || 'Not specified'}
                    </li>
                  </ul>
                </DetailBlock>
              </div>

              <DetailBlock title="Compensation & Benefits">
                <div className="flex flex-wrap items-center gap-2 text-zinc-700">
                  <span className="text-xl font-bold text-zinc-900">
                    {formatCurrencyAmount(job.salary_min_per_annum, job.currency)} -{' '}
                    {formatCurrencyAmount(job.salary_max_per_annum, job.currency)}
                    <span className="text-base font-medium text-zinc-600"> / year</span>
                  </span>
                  {benefits.map((benefit) => (
                    <span key={benefit} className="rounded-lg border border-zinc-300 bg-zinc-100 px-3 py-1 text-sm">
                      {benefit}
                    </span>
                  ))}
                </div>
              </DetailBlock>
            </div>

            <aside className="space-y-3 lg:sticky lg:top-4 lg:self-start">
              <Link
                to={`/recruiter/job-posts/${job.id}/edit`}
                className="block w-full rounded-lg bg-zinc-900 px-4 py-3 text-center text-base font-semibold text-white transition hover:bg-zinc-700"
              >
                Edit Job
              </Link>
              <button
                type="button"
                onClick={() => void updateStatus('Draft')}
                disabled={isUpdatingStatus || job.status === 'Draft'}
                className="w-full rounded-lg border border-zinc-300 bg-white px-4 py-3 text-base font-semibold text-zinc-700 transition hover:bg-zinc-50 disabled:opacity-50"
              >
                Move to Draft
              </button>
              <button
                type="button"
                onClick={() => void updateStatus('Published')}
                disabled={isUpdatingStatus || job.status === 'Published'}
                className="w-full rounded-lg border border-emerald-300 bg-white px-4 py-3 text-base font-semibold text-emerald-700 transition hover:bg-emerald-50 disabled:opacity-50"
              >
                Publish Job
              </button>
              <button
                type="button"
                onClick={() => void updateStatus('Closed')}
                disabled={isUpdatingStatus || job.status === 'Closed'}
                className="w-full rounded-lg border border-amber-300 bg-white px-4 py-3 text-base font-semibold text-amber-700 transition hover:bg-amber-50 disabled:opacity-50"
              >
                Close Job
              </button>
              <button
                type="button"
                onClick={openDeleteFlow}
                className="w-full rounded-lg border border-red-300 bg-white px-4 py-3 text-base font-semibold text-red-700 transition hover:bg-red-50"
              >
                Delete Job
              </button>
            </aside>
          </div>
        </div>
      </Card>

      <div className="grid gap-4 lg:grid-cols-2">
        <ApplicantsCard applicants={applicants} />
        <ApplicantsTrendCard trend={trend} />
      </div>

      <HighRiskVerificationModal
        open={isVerificationOpen}
        title="Final verification required"
        message="Type DELETE or the exact job title to permanently delete this published job."
        expectedKeyword="DELETE"
        expectedText={job.title}
        loading={isDeleting}
        error={deleteError}
        onClose={() => setIsVerificationOpen(false)}
        onCancel={() => setIsVerificationOpen(false)}
        onConfirm={deleteJob}
      />
    </div>
  );
};


