/* eslint-disable react-refresh/only-export-components */
import { useMemo, useState } from 'react';
import { redirect, useActionData, useLoaderData, useNavigation, type ActionFunctionArgs, type LoaderFunctionArgs } from 'react-router-dom';
import { Card } from '@shared/components/Card';
import { formatCurrencyAmount } from '@shared/data/currency';
import { jobseekerService } from '@features/jobseeker/service/jobseeker.service';
import { ApiError } from '@shared/api/http';
import { ApplyModalWizard } from '@features/jobseeker/components/ApplyModalWizard';
import { DetailBlock } from '@shared/components/DetailBlock';
import { splitToBullets, toList } from '@shared/utils/formatText';

export const jobDetailLoader = async ({ params }: LoaderFunctionArgs) => {
  if (!params.jobId) throw new Response('Not found', { status: 404 });
  return jobseekerService.getJobDetail(params.jobId);
};

export const applyJobAction = async ({ request, params }: ActionFunctionArgs) => {
  if (!params.jobId) return null;
  const form = await request.formData();
  const resume = form.get('resume_file');
  if (!(resume instanceof File) || resume.size === 0) return { error: 'Resume is required.' };

  try {
    await jobseekerService.applyToJob(params.jobId, {
      full_name: String(form.get('full_name') ?? ''),
      email: String(form.get('email') ?? ''),
      postal_code: String(form.get('postal_code') ?? ''),
      location: String(form.get('location') ?? ''),
      resume_file: resume,
    });

    return redirect('/jobs');
  } catch (error) {
    if (error instanceof ApiError) {
      const payload = error.data as { message?: string; errors?: string[] } | null;
      return { error: payload?.errors?.[0] ?? payload?.message ?? 'Unable to submit application right now.' };
    }

    return { error: 'Unable to submit application right now.' };
  }
};


export const JobDetailPage = () => {
  const job = useLoaderData() as Awaited<ReturnType<typeof jobDetailLoader>>;
  const actionData = useActionData() as { error?: string } | undefined;
  const navigation = useNavigation();
  const isSubmitting = navigation.state === 'submitting';
  const [isModalOpen, setIsModalOpen] = useState(false);

  const responsibilities = useMemo(() => splitToBullets(job.responsibilities), [job.responsibilities]);
  const benefits = useMemo(() => splitToBullets(job.benefits), [job.benefits]);
  const requiredSkills = useMemo(() => toList(job.required_skills), [job.required_skills]);
  const preferredSkills = useMemo(() => toList(job.preferred_skills), [job.preferred_skills]);
  const postedDate = (job as { posted_at?: string; created_at?: string }).posted_at ?? (job as { posted_at?: string; created_at?: string }).created_at;

  return (
    <div className="space-y-4">
      <Card className="bg-zinc-50/60 p-3 sm:p-5">
          <div className="space-y-5">
            <header className="space-y-4 border-b border-zinc-200 pb-4">
              <h1 className="text-2xl font-bold text-zinc-900 sm:text-3xl">{job.title}</h1>
              <div className="flex flex-wrap gap-2">
                <span className="rounded-lg border border-zinc-200 bg-zinc-100 px-3 py-1 text-sm text-zinc-700">{job.department ?? 'General'}</span>
                <span className="rounded-lg border border-zinc-200 bg-zinc-100 px-3 py-1 text-sm text-zinc-700">{job.location || 'Location not specified'}</span>
                <span className="rounded-lg border border-zinc-200 bg-zinc-100 px-3 py-1 text-sm text-zinc-700">{job.employment_type || 'Employment type not specified'}</span>
                <span className="rounded-lg border border-zinc-200 bg-zinc-100 px-3 py-1 text-sm text-zinc-700">{job.experience_level || 'Experience level not specified'}</span>
                <span className="rounded-lg border border-zinc-200 bg-zinc-100 px-3 py-1 text-sm font-medium text-zinc-800">
                  {formatCurrencyAmount(job.salary_min_per_annum, job.currency)} - {formatCurrencyAmount(job.salary_max_per_annum, job.currency)} / year
                </span>
              </div>
            </header>

            <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_260px]">
              <div className="space-y-4">
                <DetailBlock title="About the Role">
                  <p className="whitespace-pre-wrap leading-7 text-zinc-700">{job.description}</p>
                </DetailBlock>

                <DetailBlock title="Responsibilities">
                  <ul className="list-disc space-y-2 pl-5 text-zinc-700">
                    {responsibilities.length > 0 ? responsibilities.map((item) => <li key={item}>{item}</li>) : <li>No responsibilities listed.</li>}
                  </ul>
                </DetailBlock>

                <div className="grid gap-4 xl:grid-cols-2">
                  <DetailBlock title="Required Skills">
                  <div className="flex flex-wrap gap-2">
                    {requiredSkills.length > 0 ? (
                      requiredSkills.map((skill) => (
                        <span key={skill} className="rounded-full border border-zinc-300 bg-zinc-100 px-3 py-1 text-xs font-medium text-zinc-700">
                          {skill}
                        </span>
                      ))
                    ) : (
                      <p className="text-sm text-zinc-500">No required skills listed.</p>
                    )}
                  </div>
                </DetailBlock>

                  <DetailBlock title="Preferred Skills">
                    <div className="flex flex-wrap gap-2">
                      {preferredSkills.length > 0 ? (
                        preferredSkills.map((skill) => (
                          <span key={skill} className="rounded-lg border border-zinc-300 bg-zinc-100 px-3 py-1 text-sm text-zinc-700">
                            {skill}
                          </span>
                        ))
                      ) : (
                        <p className="text-sm text-zinc-500">No preferred skills listed.</p>
                      )}
                    </div>
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
                      <li>
                        <span className="font-medium text-zinc-900">Posted:</span> {postedDate ? new Date(postedDate).toLocaleDateString() : 'Not available'}
                      </li>
                    </ul>
                  </DetailBlock>
                </div>

                <DetailBlock title="Compensation & Benefits">
                  <div className="flex flex-wrap items-center gap-2 text-zinc-700">
                    <span className="text-xl font-bold text-zinc-900">
                      {formatCurrencyAmount(job.salary_min_per_annum, job.currency)} - {formatCurrencyAmount(job.salary_max_per_annum, job.currency)}
                      <span className="text-base font-medium text-zinc-600"> / year</span>
                    </span>
                    {benefits.length > 0
                      ? benefits.map((benefit) => (
                          <span key={benefit} className="rounded-lg border border-zinc-300 bg-zinc-100 px-3 py-1 text-sm">
                            {benefit}
                          </span>
                        ))
                      : null}
                  </div>
                </DetailBlock>

                
              </div>

              <aside className="space-y-3 lg:sticky lg:top-4 lg:self-start">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(true)}
                  className="w-full rounded-lg bg-zinc-900 px-4 py-3 text-base font-semibold text-white transition hover:bg-zinc-700"
                >
                  Apply Now
                </button>
                <button
                  type="button"
                  onClick={() => { void jobseekerService.saveJob(job.id); }}
                  className="w-full rounded-lg border border-zinc-300 bg-white px-4 py-3 text-base font-semibold text-zinc-800 transition hover:bg-zinc-50"
                >
                  Save Job
                </button>
              </aside>
            </div>
          </div>
      </Card>

      {isModalOpen ? (
        <ApplyModalWizard actionData={actionData} isSubmitting={isSubmitting} onClose={() => setIsModalOpen(false)} />
      ) : null}
    </div>
  );
};