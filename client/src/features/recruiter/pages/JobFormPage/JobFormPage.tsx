/**
 * Recruiter job form page for creating and editing job posts.
 *
 * Main exports:
 * - `JobFormPage`: Route component used by recruiter create and edit flows.
 *
 * Usage notes:
 * - The route expects loader data shaped as `{ job?: JobDto }` for edit mode.
 * - Field names are intentionally aligned with the existing action payload contract.
 * - Predictive inputs keep their own local state so the browser submits the visible value.
 */
import { Form, Link, useActionData, useLoaderData, useNavigation } from 'react-router-dom';
import {
  BriefcaseBusiness,
  Building2,
  CircleDollarSign,
  MapPin,
  Sparkles,
} from 'lucide-react';

import { RecruiterFieldLabel } from '@features/recruiter/components/RecruiterFieldLabel';
import { RecruiterInputField } from '@features/recruiter/components/RecruiterInputField';
import { PredictiveInput } from '@features/recruiter/pages/JobFormPage/components/PredictiveInput';
import { RecruiterSectionCard } from '@features/recruiter/components/RecruiterSectionCard';
import { RecruiterSelectField } from '@features/recruiter/components/RecruiterSelectField';
import { RecruiterTextareaField } from '@features/recruiter/components/RecruiterTextareaField';
import type { JobDto } from '@features/recruiter/types';
import { Card } from '@shared/components/Card';

const departments = ['Engineering', 'Product', 'Design', 'Marketing', 'Operations', 'Sales'];
const titles = ['Software Engineer', 'Frontend Engineer', 'Backend Engineer', 'Full Stack Engineer', 'Product Manager'];
const currencies = ['PHP', 'USD', 'SGD', 'EUR'];
const experienceLevels = ['Entry', 'Mid', 'Senior', 'Lead'];
const educationLevels = ['High School', 'Diploma', "Bachelor's Degree", "Master's Degree", 'PhD'];

type JobFormMode = 'create' | 'edit';

interface JobFormPageProps {
  mode: JobFormMode;
}

interface JobFormActionData {
  error?: string;
}

interface JobFormLoaderData {
  job?: Partial<JobDto>;
}

/**
 * Route component for the recruiter job form.
 */
export const JobFormPage = ({ mode }: JobFormPageProps) => {
  const actionData = useActionData() as JobFormActionData | undefined;
  const loaderData = useLoaderData() as JobFormLoaderData;
  const job = loaderData.job;
  const navigation = useNavigation();
  const isSaving = navigation.state === 'submitting';

  return (
    <div className="space-y-6">
      <Card className="border border-zinc-200 bg-linear-to-br from-white via-violet-50/30 to-white p-0 shadow-sm">
        <div className="border-b border-zinc-200 px-6 py-5">
          <div className="flex items-start gap-3">
            <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-violet-100 text-violet-700">
              <Sparkles className="h-5 w-5" />
            </span>
            <div>
              <h2 className="text-2xl font-bold text-zinc-900">
                {mode === 'create' ? 'Create Job' : 'Edit Job'}
              </h2>
              <p className="text-sm text-zinc-600">
                Use a clean and structured post so candidates can understand your role quickly.
              </p>
            </div>
          </div>
        </div>

        <Form method="post" className="space-y-6 px-6 py-6">
          {actionData?.error ? (
            <p className="rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
              {actionData.error}
            </p>
          ) : null}

          <RecruiterSectionCard
            title="Job Basics"
            description="Define the public-facing basics candidates use to scan the role quickly."
            icon={BriefcaseBusiness}
          >
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <RecruiterFieldLabel htmlFor="job-title">Job Title *</RecruiterFieldLabel>
                <PredictiveInput name="title" placeholder="e.g. Software Engineer" isRequired options={titles} defaultValue={String(job?.title ?? '')} />
              </div>
              <div>
                <RecruiterFieldLabel htmlFor="department">Department</RecruiterFieldLabel>
                <PredictiveInput name="department" placeholder="Type a department" isRequired options={departments} defaultValue={String(job?.department ?? '')} />
              </div>
              <RecruiterInputField id="location" autoComplete="off" name="location" required defaultValue={String(job?.location ?? '')} placeholder="City, Country" label="Location *" icon={MapPin} />
              <RecruiterSelectField id="work-setup" name="work_setup" defaultValue={String(job?.work_setup ?? 0)} label="Work Setup">
                <option value="0">Onsite</option>
                <option value="1">Hybrid</option>
                <option value="2">Remote</option>
              </RecruiterSelectField>
            </div>

            <div className="mt-4 grid gap-4 md:grid-cols-3">
              <RecruiterSelectField id="employment-type" name="employment_type" defaultValue={String(job?.employment_type ?? 0)} label="Employment Type">
                <option value="0">Full Time</option>
                <option value="1">Part Time</option>
                <option value="2">Contract</option>
                <option value="3">Internship</option>
                <option value="4">Temporary</option>
              </RecruiterSelectField>
              <RecruiterInputField id="schedule" autoComplete="off" name="schedule" defaultValue={String(job?.schedule ?? '')} placeholder="Mon-Fri, 9AM-6PM" label="Schedule" />
              <RecruiterInputField id="vacancies" type="number" min={0} name="number_of_vacancies" defaultValue={String(job?.number_of_vacancies ?? 1)} label="Vacancies" />
            </div>
          </RecruiterSectionCard>

          <RecruiterSectionCard title="Compensation" description="Keep salary inputs in the existing annualized format expected by the backend." icon={CircleDollarSign}>
            <div className="grid gap-4 md:grid-cols-3">
              <RecruiterInputField id="salary-min" type="number" min="0" step="1000" name="salary_min_per_annum" defaultValue={String(job?.salary_min_per_annum ?? '')} label="Minimum Salary (Annual)" />
              <RecruiterInputField id="salary-max" type="number" min="0" step="1000" name="salary_max_per_annum" defaultValue={String(job?.salary_max_per_annum ?? '')} label="Maximum Salary (Annual)" />
              <div>
                <RecruiterFieldLabel htmlFor="currency">Currency</RecruiterFieldLabel>
                <PredictiveInput name="currency" placeholder="Currency" options={currencies} defaultValue={String(job?.currency ?? 'PHP')} />
              </div>
            </div>
          </RecruiterSectionCard>

          <RecruiterSectionCard title="Role Details" description="Describe the work clearly so applicants can self-select accurately.">
            <div className="space-y-4">
              <RecruiterTextareaField id="description" required name="description" rows={5} maxLength={2000} defaultValue={String(job?.description ?? '')} placeholder="Describe the role, team, and impact." label="Description" />
              <RecruiterTextareaField id="responsibilities" required name="responsibilities" rows={4} defaultValue={String(job?.responsibilities ?? '')} placeholder="List role responsibilities" label="Responsibilities" />
            </div>
          </RecruiterSectionCard>

          <RecruiterSectionCard title="Skills & Qualifications" description="These inputs drive both the recruiter workflow and matching features.">
            <div className="grid gap-4 md:grid-cols-2">
              <RecruiterInputField id="required-skills" autoComplete="off" required name="required_skills" defaultValue={String((job?.required_skills as string[] | undefined)?.join(', ') ?? '')} placeholder="React, TypeScript, Node.js" label="Required Skills" />
              <RecruiterInputField id="preferred-skills" autoComplete="off" required name="preferred_skills" defaultValue={String((job?.preferred_skills as string[] | undefined)?.join(', ') ?? '')} placeholder="GraphQL, Docker" label="Preferred Skills" />
              <RecruiterSelectField id="experience-level" name="experience_level" defaultValue={String(job?.experience_level ?? '')} label="Experience Level">
                <option value="">Select level</option>
                {experienceLevels.map((level) => (
                  <option key={level}>{level}</option>
                ))}
              </RecruiterSelectField>
              <RecruiterInputField id="minimum-years" type="number" name="min_years" defaultValue={String(job?.min_years ?? '')} label="Minimum Years" />
              <div>
                <RecruiterFieldLabel htmlFor="education">Education</RecruiterFieldLabel>
                <PredictiveInput name="education" placeholder="Type education level" options={educationLevels} defaultValue={String(job?.education ?? '')} />
              </div>
              <RecruiterSelectField id="minimum-education" name="min_education" defaultValue={String(job?.min_education ?? '')} label="Minimum Education">
                <option value="">Select minimum education</option>
                {educationLevels.map((level) => (
                  <option key={level}>{level}</option>
                ))}
              </RecruiterSelectField>
            </div>
          </RecruiterSectionCard>

          <RecruiterSectionCard title="Benefits & Status" description="These fields influence how the posting appears and behaves in the recruiter workspace." icon={Building2}>
            <div className="grid gap-4 md:grid-cols-2">
              <RecruiterTextareaField id="benefits" name="benefits" rows={3} defaultValue={String(job?.benefits ?? '')} placeholder="Healthcare, flexible hours, leave credits" label="Benefits" />
              <RecruiterSelectField id="status" name="status" defaultValue={String(job?.status ?? 'Draft')} label="Job Status">
                <option value="Draft">Draft</option>
                <option value="Published">Published</option>
                <option value="Closed">Closed</option>
              </RecruiterSelectField>
            </div>
          </RecruiterSectionCard>

          <div className="flex flex-wrap items-center justify-end gap-2 pt-1">
            <Link to="/recruiter/job-posts" className="rounded-xl border border-zinc-300 px-4 py-2 text-zinc-700 hover:bg-zinc-100">Cancel</Link>
            <button className="rounded-xl bg-violet-700 px-4 py-2 font-semibold text-white hover:bg-violet-800 disabled:opacity-70" type="submit" disabled={isSaving}>
              {isSaving ? 'Saving...' : 'Save'}
            </button>
          </div>
        </Form>
      </Card>
    </div>
  );
};


