/* eslint-disable react-refresh/only-export-components */
import { Form, redirect, useActionData, useLoaderData, useNavigation, type ActionFunctionArgs, type LoaderFunctionArgs } from 'react-router-dom';
import { Card } from '@shared/components/Card';
import { jobseekerService } from '@features/jobseeker/service/jobseeker.service';
import { ApiError } from '@shared/api/http';

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
  const detail = useLoaderData() as Awaited<ReturnType<typeof jobDetailLoader>>;
  const actionData = useActionData() as { error?: string } | undefined;
  const navigation = useNavigation();
  const isSubmitting = navigation.state === 'submitting';

  return (
    <div className="space-y-4">

      <Card>
        <h3 className="text-lg font-semibold">Full details</h3>
        
        <p className="mt-2 whitespace-pre-wrap text-sm">{detail.description}</p>
        <p className="mt-2 whitespace-pre-wrap text-sm">{detail.responsibilities}</p>
        <p className="mt-2 whitespace-pre-wrap text-sm">{detail.benefits}</p>
      </Card>

      <Card>
        <h3 className="mb-2 font-semibold">Proceed to Apply</h3>
        {actionData?.error ? <p className="rounded bg-zinc-100 p-2 text-sm text-zinc-700">{actionData.error}</p> : null}
        <Form method="post" encType="multipart/form-data" className="space-y-2">
          <input name="full_name" required className="w-full rounded border border-zinc-300 px-3 py-2" placeholder="Full name" />
          <input type="email" name="email" required className="w-full rounded border border-zinc-300 px-3 py-2" placeholder="Email" />
          <input name="postal_code" required className="w-full rounded border border-zinc-300 px-3 py-2" placeholder="Postal code" />
          <input name="location" required className="w-full rounded border border-zinc-300 px-3 py-2" placeholder="Location" />
          <input type="file" name="resume_file" required className="w-full rounded border border-zinc-300 px-3 py-2" />
          <button type="submit" disabled={isSubmitting} className="rounded bg-zinc-900 px-4 py-2 text-white disabled:opacity-60">{isSubmitting ? 'Submitting...' : 'Apply'}</button>
        </Form>
      </Card>
    </div>
  );
};