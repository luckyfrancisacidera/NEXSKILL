/* eslint-disable react-hooks/set-state-in-effect */
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
import { useCallback, useEffect, useState } from 'react';
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
import type { JobDto } from '@features/recruiter/types';
import { Button } from '@shared/components/actions/Button';
import { Card } from '@shared/components/data-display/Card';
import { Dropdown, type DropdownOption } from '@shared/components/form';
import { PredictiveInput } from '@shared/components/form/PredictiveInput';
import { RichTextField } from '@shared/components/form/RichTextField';
import { http } from '@shared/api/http';
import { arrayToRichTextList, plainTextToRichText, stripRichText } from '@shared/utils/richText';

const departments = ['Engineering', 'Product', 'Design', 'Marketing', 'Operations', 'Sales'];
const titles = ['Software Engineer', 'Frontend Engineer', 'Backend Engineer', 'Full Stack Engineer', 'Product Manager'];
const currencies = ['PHP', 'USD', 'SGD', 'EUR'];
const experienceLevels = ['Entry', 'Mid', 'Senior', 'Lead'];
const educationLevels = [
  'High School',
  'GED',
  'Diploma',
  'Vocational Certificate',
  "Associate's Degree",
  "Bachelor's Degree",
  "Master's Degree",
  'MBA',
  'PhD',
  'Doctorate',
];

const dedupeEducationLevels = (values: string[]) => {
  const seen = new Set<string>();

  return values.filter((value) => {
    const normalized = value.trim().toLowerCase();
    if (!normalized || seen.has(normalized)) {
      return false;
    }

    seen.add(normalized);
    return true;
  });
};

const parseEducationLevelsResponse = (payload: unknown): string[] => {
  if (Array.isArray(payload)) {
    return payload.filter((item): item is string => typeof item === 'string');
  }

  if (!payload || typeof payload !== 'object') {
    return [];
  }

  const record = payload as Record<string, unknown>;
  const candidateKeys = ['data', 'items', 'results', 'educationLevels', 'education_levels'];

  for (const key of candidateKeys) {
    const value = record[key];
    if (Array.isArray(value)) {
      return value.filter((item): item is string => typeof item === 'string');
    }
  }

  return [];
};

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

const jobFormInputClassName =
  'w-full rounded-xl border border-zinc-300 bg-white px-3 py-2 text-xs text-zinc-900 shadow-sm outline-none transition hover:border-zinc-400 focus:border-zinc-400 focus:ring-4 focus:ring-zinc-200 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 dark:hover:border-zinc-600 dark:focus:border-zinc-400 dark:focus:ring-white/15 sm:py-2.5 sm:text-sm';

const workSetupOptions: DropdownOption[] = [
  { value: '0', label: 'Onsite' },
  { value: '1', label: 'Hybrid' },
  { value: '2', label: 'Remote' },
];

const employmentTypeOptions: DropdownOption[] = [
  { value: '0', label: 'Full Time' },
  { value: '1', label: 'Part Time' },
  { value: '2', label: 'Contract' },
  { value: '3', label: 'Internship' },
  { value: '4', label: 'Temporary' },
];

const currencyOptions: DropdownOption[] = currencies.map((currency) => ({
  value: currency,
  label: currency,
}));

const experienceLevelOptions: DropdownOption[] = [
  { value: '', label: 'Select level' },
  ...experienceLevels.map((level) => ({
    value: level,
    label: level,
  })),
];

const educationOptions: DropdownOption[] = [
  { value: '', label: 'Select education' },
  ...educationLevels.map((level) => ({
    value: level,
    label: level,
  })),
];

const statusOptions: DropdownOption[] = [
  { value: 'Draft', label: 'Draft' },
  { value: 'Published', label: 'Published' },
  { value: 'Closed', label: 'Closed' },
];

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
  const [workSetup, setWorkSetup] = useState(String(job?.work_setup ?? 0));
  const [employmentType, setEmploymentType] = useState(String(job?.employment_type ?? 0));
  const [currency, setCurrency] = useState(String(job?.currency ?? 'PHP'));
  const [experienceLevel, setExperienceLevel] = useState(String(job?.experience_level ?? ''));
  const [education, setEducation] = useState(String(job?.education ?? ''));
  const [minimumEducation, setMinimumEducation] = useState(String(job?.min_education ?? ''));
  const [status, setStatus] = useState(String(job?.status ?? 'Draft'));
  const [editorErrors, setEditorErrors] = useState<{ description?: string; responsibilities?: string }>({});

  const getEducationSuggestions = useCallback(async (query: string) => {
    const normalizedQuery = query.trim().toLowerCase();
    const fallbackSuggestions = educationLevels.filter((level) =>
      level.toLowerCase().includes(normalizedQuery),
    );

    try {
      const response = await http.get<unknown>('/api/education-levels', {
        params: normalizedQuery ? { q: normalizedQuery } : undefined,
      });

      const apiSuggestions = parseEducationLevelsResponse(response.data);
      const merged = dedupeEducationLevels([...apiSuggestions, ...fallbackSuggestions, ...educationLevels]);

      return normalizedQuery
        ? merged.filter((level) => level.toLowerCase().includes(normalizedQuery))
        : merged;
    } catch {
      return fallbackSuggestions.length > 0 ? fallbackSuggestions : educationLevels;
    }
  }, []);

  useEffect(() => {
    setDescription(getEditorValue(job?.description));
    setResponsibilities(getEditorValue(job?.responsibilities, true));
    setBenefits(getEditorValue(job?.benefits));
    setWorkSetup(String(job?.work_setup ?? 0));
    setEmploymentType(String(job?.employment_type ?? 0));
    setCurrency(String(job?.currency ?? 'PHP'));
    setExperienceLevel(String(job?.experience_level ?? ''));
    setEducation(String(job?.education ?? ''));
    setMinimumEducation(String(job?.min_education ?? ''));
    setStatus(String(job?.status ?? 'Draft'));
    setEditorErrors({});
  }, [job?.benefits, job?.currency, job?.description, job?.education, job?.employment_type, job?.experience_level, job?.min_education, job?.responsibilities, job?.status, job?.work_setup]);

  return (
    <div className="space-y-6">
      <Card className="border border-zinc-200 dark:border-zinc-800 bg-linear-to-br from-white via-violet-50/30 to-white dark:from-zinc-950 dark:via-zinc-950/20 dark:to-zinc-950 p-0 shadow-sm">
        <div className="border-b border-zinc-200 px-3 py-4 dark:border-zinc-800 sm:px-4 sm:py-5 lg:px-5">
          <div className="flex items-start gap-3">
            <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-zinc-200 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-400">
              <Sparkles className="h-5 w-5" />
            </span>
            <div>
              <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-100 sm:text-2xl">
                {mode === 'create' ? 'Create Job' : 'Edit Job'}
              </h2>
              <p className="text-xs text-zinc-600 dark:text-zinc-100 sm:text-sm">
                Use a clean and structured post so candidates can understand your role quickly.
              </p>
            </div>
          </div>
        </div>

        <Form
          method="post"
          className="space-y-6 px-3 py-4 sm:px-4 sm:py-5 lg:px-5 lg:py-6"
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
              <div className="min-w-0">
                <RecruiterFieldLabel htmlFor="job-title">Job Title *</RecruiterFieldLabel>
                <PredictiveInput
                  name="title"
                  placeholder="e.g. Software Engineer"
                  isRequired
                  options={titles}
                  defaultValue={String(job?.title ?? '')}
                  className={jobFormInputClassName}
                />
              </div>
              <div className="min-w-0">
                <RecruiterFieldLabel htmlFor="department">Department</RecruiterFieldLabel>
                <PredictiveInput
                  name="department"
                  placeholder="Type a department"
                  isRequired
                  options={departments}
                  defaultValue={String(job?.department ?? '')}
                  className={jobFormInputClassName}
                />
              </div>
              <RecruiterInputField id="location" autoComplete="off" name="location" required defaultValue={String(job?.location ?? '')} placeholder="City, Country" label="Location *" icon={MapPin} className={jobFormInputClassName} />
              <Dropdown
                id="work-setup"
                name="work_setup"
                label="Work Setup"
                value={workSetup}
                options={workSetupOptions}
                compactOnMobile={false}
                buttonClassName="h-11"
                onChange={(event) => setWorkSetup(event.target.value)}
              />
            </div>

            <div className="mt-4 grid gap-4 md:grid-cols-3">
              <Dropdown
                id="employment-type"
                name="employment_type"
                label="Employment Type"
                value={employmentType}
                options={employmentTypeOptions}
                compactOnMobile={false}
                buttonClassName="h-11"
                onChange={(event) => setEmploymentType(event.target.value)}
              />
              <RecruiterInputField id="schedule" autoComplete="off" name="schedule" defaultValue={String(job?.schedule ?? '')} placeholder="Mon-Fri, 9AM-6PM" label="Schedule" className={jobFormInputClassName} />
              <RecruiterInputField id="vacancies" type="number" min={0} name="number_of_vacancies" defaultValue={String(job?.number_of_vacancies ?? 1)} label="Vacancies" className={jobFormInputClassName} />
            </div>
          </RecruiterSectionCard>

          <RecruiterSectionCard title="Compensation" description="Keep salary inputs in the existing annualized format expected by the backend." icon={CircleDollarSign}>
            <div className="grid gap-4 md:grid-cols-3">
              <RecruiterInputField id="salary-min" type="number" min="0" step="1000" name="salary_min_per_annum" defaultValue={String(job?.salary_min_per_annum ?? '')} label="Minimum Salary (Annual)" className={jobFormInputClassName} />
              <RecruiterInputField id="salary-max" type="number" min="0" step="1000" name="salary_max_per_annum" defaultValue={String(job?.salary_max_per_annum ?? '')} label="Maximum Salary (Annual)" className={jobFormInputClassName} />
              <Dropdown
                id="currency"
                name="currency"
                label="Currency"
                value={currency}
                options={currencyOptions}
                compactOnMobile={false}
                buttonClassName="h-11"
                onChange={(event) => setCurrency(event.target.value)}
              />
            </div>
          </RecruiterSectionCard>

          <RecruiterSectionCard title="Role Details" description="Describe the work clearly so applicants can self-select accurately.">
            <div className="space-y-4 min-w-0">
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
              <RecruiterInputField id="required-skills" autoComplete="off" required name="required_skills" defaultValue={String((job?.required_skills as string[] | undefined)?.join(', ') ?? '')} placeholder="React, TypeScript, Node.js" label="Required Skills" className={jobFormInputClassName} />
              <RecruiterInputField id="preferred-skills" autoComplete="off" required name="preferred_skills" defaultValue={String((job?.preferred_skills as string[] | undefined)?.join(', ') ?? '')} placeholder="GraphQL, Docker" label="Preferred Skills" className={jobFormInputClassName} />
              <Dropdown
                id="experience-level"
                name="experience_level"
                label="Experience Level"
                value={experienceLevel}
                options={experienceLevelOptions}
                compactOnMobile={false}
                buttonClassName="h-11"
                onChange={(event) => setExperienceLevel(event.target.value)}
              />
              <RecruiterInputField id="minimum-years" type="number" name="min_years" defaultValue={String(job?.min_years ?? '')} label="Minimum Years" className={jobFormInputClassName} />
              <div className="min-w-0">
                <RecruiterFieldLabel htmlFor="education">Education</RecruiterFieldLabel>
                <PredictiveInput
                  id="education"
                  name="education"
                  placeholder="Type or select education"
                  options={educationLevels}
                  fetchOptions={getEducationSuggestions}
                  debounceMs={400}
                  value={education}
                  onChange={setEducation}
                  emptyState="No matching education found. You can keep typing your own entry."
                  className={jobFormInputClassName}
                />
              </div>
              <Dropdown
                id="minimum-education"
                name="min_education"
                label="Minimum Education"
                value={minimumEducation}
                options={educationOptions}
                compactOnMobile={false}
                buttonClassName="h-11"
                onChange={(event) => setMinimumEducation(event.target.value)}
              />
            </div>
          </RecruiterSectionCard>

          <RecruiterSectionCard title="Benefits & Status" description="These fields influence how the posting appears and behaves in the recruiter workspace." icon={Building2}>
            <div className="grid min-w-0 gap-4 md:grid-cols-[minmax(0,1fr)_minmax(220px,0.75fr)] md:items-start">
              <RichTextField
                label="Benefits"
                name="benefits"
                value={benefits}
                onChange={setBenefits}
                placeholder="Healthcare, flexible hours, leave credits"
                helperText="Add a short list of benefits or perks candidates should notice quickly."
                minHeightClassName="min-h-[150px]"
              />
              <Dropdown
                id="status"
                name="status"
                label="Job Status"
                value={status}
                options={statusOptions}
                compactOnMobile={false}
                buttonClassName="h-11"
                onChange={(event) => setStatus(event.target.value)}
              />
            </div>
          </RecruiterSectionCard>

          <div className="flex flex-col-reverse gap-2 pt-1 sm:flex-row sm:flex-wrap sm:items-center sm:justify-end">
            <Link to="/recruiter/job-posts" className="inline-flex items-center justify-center rounded-xl border border-zinc-300 dark:border-zinc-700 px-4 py-2 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800">Cancel</Link>
            <Button className="rounded-xl bg-zinc-800 px-4 py-2 font-semibold text-white hover:bg-zinc-700 focus-visible:ring-zinc-400 dark:bg-zinc-200 dark:text-zinc-900 dark:hover:bg-zinc-300" type="submit" loading={isSaving} loadingText="Saving">
              Save
            </Button>
          </div>
        </Form>
      </Card>
    </div>
  );
};

