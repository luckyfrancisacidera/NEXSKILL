import { Form, useLoaderData } from 'react-router-dom';
import { Card } from '@shared/components/Card';

const stages = ['Applied', 'Screening', 'Interview', 'Offer', 'Hired', 'Rejected'];

export const CandidateDetailPage = () => {
  const { candidate, job, activity } = useLoaderData() as {
    candidate: { id: string; name: string; email: string; stage: string; notes: string; attachments: string[] };
    job?: { title: string };
    activity: Array<{ id: string; at: string; message: string }>;
  };

  return (
    <div className="grid gap-4 lg:grid-cols-3">
      <Card className="lg:col-span-2">
        <h2 className="text-xl font-semibold">{candidate.name}</h2>
        <p className="text-sm text-zinc-500">{candidate.email} · {job?.title}</p>
        <div className="mt-3 flex flex-wrap gap-2">
          {stages.map((stage) => (
            <Form key={stage} method="post">
              <input type="hidden" name="intent" value="stage" />
              <input type="hidden" name="toStage" value={stage} />
              <button className={`rounded-lg border px-3 py-1 text-sm ${stage === candidate.stage ? 'bg-zinc-900 text-white' : 'border-zinc-300'}`} type="submit">{stage}</button>
            </Form>
          ))}
        </div>
        <Form method="post" className="mt-4 space-y-2">
          <input type="hidden" name="intent" value="notes" />
          <label className="block text-sm font-medium">Notes</label>
          <textarea aria-label="candidate notes" name="notes" defaultValue={candidate.notes} rows={5} className="w-full rounded-lg border border-zinc-300 px-3 py-2" />
          <button className="rounded-lg bg-zinc-900 px-4 py-2 text-white" type="submit">Save notes</button>
        </Form>
      </Card>
      <Card>
        <h3 className="font-semibold">Attachments</h3>
        <ul className="mt-2 list-inside list-disc text-sm">{candidate.attachments.map((item) => <li key={item}>{item}</li>)}</ul>
        <h3 className="mt-4 font-semibold">Timeline</h3>
        <ul className="mt-2 space-y-2 text-sm">
          {activity.map((item) => <li key={item.id} className="rounded border border-zinc-200 p-2">{item.message}<p className="text-xs text-zinc-500">{new Date(item.at).toLocaleString()}</p></li>)}
        </ul>
      </Card>
    </div>
  );
};
