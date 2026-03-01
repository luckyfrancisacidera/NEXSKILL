import { Form, useActionData, useLoaderData, useNavigation } from 'react-router-dom';
import { Card } from '@shared/components/Card'

const departments = ['Engineering', 'Product', 'Design', 'Marketing', 'Operations', 'Sales'];
const titles = ['Software Engineer', 'Frontend Engineer', 'Backend Engineer', 'Full Stack Engineer', 'Product Manager'];
const currencies = ['PHP', 'USD', 'SGD', 'EUR'];

export const JobFormPage = ({ mode }: { mode: 'create' | 'edit' }) => {
  const actionData = useActionData() as { error?: string } | undefined;
  const loaderData = useLoaderData() as { job?: Record<string, unknown> };
  const job = loaderData?.job;
  const navigation = useNavigation();
  const isSaving = navigation.state === 'submitting';

  return (
    <div className="space-y-4">
      <Card>
       <h2 className="mb-4 text-xl font-semibold">{mode === 'create' ? 'Create Job' : 'Edit Job'}</h2>
        <Form method="post" className="space-y-3">
          {actionData?.error ? <p className="rounded bg-zinc-100 p-2 text-sm text-zinc-700">{actionData.error}</p> : null}
          <input list="title-options" name="title" required defaultValue={String(job?.title ?? '')} placeholder="Job title" className="w-full rounded-lg border border-zinc-300 px-3 py-2" />
          <datalist id="title-options">{titles.map((v) => <option key={v} value={v} />)}</datalist>

          <input list="department-options" name="department" defaultValue={String(job?.department ?? '')} placeholder="Department" className="w-full rounded-lg border border-zinc-300 px-3 py-2" />
          <datalist id="department-options">{departments.map((v) => <option key={v} value={v} />)}</datalist>

          <input name="location" required defaultValue={String(job?.location ?? '')} placeholder="Location" className="w-full rounded-lg border border-zinc-300 px-3 py-2" />
          <input name="schedule" defaultValue={String(job?.schedule ?? '')} placeholder="Schedule (e.g. Mon-Fri)" className="w-full rounded-lg border border-zinc-300 px-3 py-2" />

          <select name="work_setup" defaultValue={String(job?.work_setup ?? 0)} className="w-full rounded-lg border border-zinc-300 px-3 py-2">
            <option value="0">Onsite</option><option value="1">Hybrid</option><option value="2">Remote</option>
          </select>

          <select name="employment_type" defaultValue={String(job?.employment_type ?? 0)} className="w-full rounded-lg border border-zinc-300 px-3 py-2">
            <option value="0">FullTime</option><option value="1">PartTime</option><option value="2">Contract</option><option value="3">Internship</option><option value="4">Temporary</option>
          </select>

          
          <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
            <input type="number" name="salary_min_per_annum" defaultValue={String(job?.salary_min_per_annum ?? '')} placeholder="Salary min" className="w-full rounded-lg border border-zinc-300 px-3 py-2" />
            <input type="number" name="salary_max_per_annum" defaultValue={String(job?.salary_max_per_annum ?? '')} placeholder="Salary max" className="w-full rounded-lg border border-zinc-300 px-3 py-2" />
            <input list="currency-options" name="currency" defaultValue={String(job?.currency ?? 'PHP')} className="w-full rounded-lg border border-zinc-300 px-3 py-2" />
            <datalist id="currency-options">{currencies.map((v) => <option key={v} value={v} />)}</datalist>
          </div>

          <textarea name="description" rows={4} defaultValue={String(job?.description ?? '')} placeholder="Description" className="w-full rounded-lg border border-zinc-300 px-3 py-2" />
          <textarea name="responsibilities" rows={4} defaultValue={String(job?.responsibilities ?? '')} placeholder="Responsibilities" className="w-full rounded-lg border border-zinc-300 px-3 py-2" />
          <textarea name="benefits" rows={3} defaultValue={String(job?.benefits ?? '')} placeholder="Benefits" className="w-full rounded-lg border border-zinc-300 px-3 py-2" />

          <input name="required_skills" defaultValue={String((job?.required_skills as string[] | undefined)?.join(', ') ?? '')} placeholder="Required skills (comma-separated)" className="w-full rounded-lg border border-zinc-300 px-3 py-2" />
          <input name="preferred_skills" defaultValue={String((job?.preferred_skills as string[] | undefined)?.join(', ') ?? '')} placeholder="Preferred skills (comma-separated)" className="w-full rounded-lg border border-zinc-300 px-3 py-2" />

          <input name="experience_level" defaultValue={String(job?.experience_level ?? '')} placeholder="experience_level" className="w-full rounded-lg border border-zinc-300 px-3 py-2" />
          <input type="number" name="min_years" defaultValue={String(job?.min_years ?? '')} placeholder="min_years" className="w-full rounded-lg border border-zinc-300 px-3 py-2" />
          <input name="education" defaultValue={String(job?.education ?? '')} placeholder="education" className="w-full rounded-lg border border-zinc-300 px-3 py-2" />
          <input name="min_education" defaultValue={String(job?.min_education ?? '')} placeholder="min_education" className="w-full rounded-lg border border-zinc-300 px-3 py-2" />

          <select name="status" defaultValue={String(job?.status ?? 'Draft')} className="w-full rounded-lg border border-zinc-300 px-3 py-2">
            <option value="Draft">Draft</option><option value="Published">Published</option><option value="Closed">Closed</option>
          </select>

          <button className="rounded-lg bg-zinc-900 px-4 py-2 text-white disabled:opacity-70" type="submit" disabled={isSaving}>{isSaving ? 'Saving...' : 'Save'}</button>

        </Form>
      </Card>
    </div>
  );
};
