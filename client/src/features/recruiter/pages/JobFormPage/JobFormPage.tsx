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
import { useEffect, useState } from 'react';
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
import { RecruiterSectionCard } from '@features/recruiter/components/RecruiterSectionCard';
import { RecruiterSelectField } from '@features/recruiter/components/RecruiterSelectField';
import type { JobDto } from '@features/recruiter/types';
import { Card } from '@shared/components/Card';
import { PredictiveInput } from '@shared/components/PredictiveInput';
import { RichTextField } from '@shared/components/RichTextField';
import { arrayToRichTextList, plainTextToRichText, stripRichText } from '@shared/utils/richText';

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

const getEditorValue = (value?: string | string[] | null, asList = false) => {
  if (asList || Array.isArray(value)) {
    return arrayToRichTextList(value);
  }

  return plainTextToRichText(typeof value === 'string' ? value : '');
};

/**
 * Route component for the recruiter job form.
 */
export const JobFormPage = ({ mode }: JobFormPageProps) => {
  const actionData = useActionData() as JobFormActionData | undefined;
  const loaderData = useLoaderData() as JobFormLoaderData;
  const job = loaderData.job;
  const navigation = useNavigation();
  const isSaving = navigation.state === 'submitting';
  const [description, setDescription] = useState(getEditorValue(job?.description));
  const [responsibilities, setResponsibilities] = useState(getEditorValue(job?.responsibilities, true));
  const [benefits, setBenefits] = useState(getEditorValue(job?.benefits));
  const [editorErrors, setEditorErrors] = useState<{ description?: string; responsibilities?: string }>({});

  useEffect(() => {
    setDescription(getEditorValue(job?.description));
    setResponsibilities(getEditorValue(job?.responsibilities, true));
    setBenefits(getEditorValue(job?.benefits));
    setEditorErrors({});
  }, [job?.benefits, job?.description, job?.responsibilities]);

  return (
    <div className="space-y-6">
      <Card className="border border-zinc-200 dark:border-zinc-800 bg-linear-to-br from-white via-violet-50/30 to-white dark:from-zinc-950 dark:via-zinc-950/20 dark:to-zinc-950 p-0 shadow-sm">
        <div className="border-b border-zinc-200 dark:border-zinc-800 px-6 py-5">
          <div className="flex items-start gap-3">
            <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-zinc-200 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-400">
              <Sparkles className="h-5 w-5" />
            </span>
            <div>
              <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
                {mode === 'create' ? 'Create Job' : 'Edit Job'}
              </h2>
              <p className="text-sm text-zinc-600 dark:text-zinc-100">
                Use a clean and structured post so candidates can understand your role quickly.
              </p>
            </div>
          </div>
        </div>

        <Form
          method="post"
          className="space-y-6 px-6 py-6"
          onSubmit={(event) => {
            const nextErrors: { description?: string; responsibilities?: string } = {};

            if (!stripRichText(description)) {
              nextErrors.description = 'Description is required.';
            }

            if (!stripRichText(responsibilities)) {
              nextErrors.responsibilities = 'Responsibilities are required.';
            }

            setEditorErrors(nextErrors);
            if (Object.keys(nextErrors).length > 0) {
              event.preventDefault();
            }
          }}
        >
          {actionData?.error ? (
            <p className="rounded-xl border border-rose-200 dark:border-rose-900 bg-rose-50 dark:bg-rose-950/40 px-3 py-2 text-sm text-rose-700 dark:text-rose-300">
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
              <RichTextField
                label="Description"
                name="description"
                required
                value={description}
                onChange={(value) => {
                  setDescription(value);
                  setEditorErrors((current) => ({ ...current, description: undefined }));
                }}
                placeholder="Describe the role, team, and impact."
                helperText="Use a concise role overview with simple emphasis, lists, and links where helpful."
                error={editorErrors.description}
              />
              <RichTextField
                label="Responsibilities"
                name="responsibilities"
                required
                value={responsibilities}
                onChange={(value) => {
                  setResponsibilities(value);
                  setEditorErrors((current) => ({ ...current, responsibilities: undefined }));
                }}
                placeholder="List role responsibilities"
                helperText="Structured lists work best here for daily ownership and expected outcomes."
                minHeightClassName="min-h-[160px]"
                error={editorErrors.responsibilities}
              />
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
              <RichTextField
                label="Benefits"
                name="benefits"
                value={benefits}
                onChange={setBenefits}
                placeholder="Healthcare, flexible hours, leave credits"
                helperText="Add a short list of benefits or perks candidates should notice quickly."
                minHeightClassName="min-h-[150px]"
              />
              <RecruiterSelectField id="status" name="status" defaultValue={String(job?.status ?? 'Draft')} label="Job Status">
                <option value="Draft">Draft</option>
                <option value="Published">Published</option>
                <option value="Closed">Closed</option>
              </RecruiterSelectField>
            </div>
          </RecruiterSectionCard>

          <div className="flex flex-wrap items-center justify-end gap-2 pt-1">
            <Link to="/recruiter/job-posts" className="rounded-xl border border-zinc-300 dark:border-zinc-700 px-4 py-2 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800">Cancel</Link>
            <button className="rounded-xl bg-violet-700 dark:bg-violet-600 px-4 py-2 font-semibold text-white hover:bg-violet-800 dark:hover:bg-violet-700 disabled:opacity-70" type="submit" disabled={isSaving}>
              {isSaving ? 'Saving...' : 'Save'}
            </button>
          </div>
        </Form>
      </Card>
    </div>
  );
};
