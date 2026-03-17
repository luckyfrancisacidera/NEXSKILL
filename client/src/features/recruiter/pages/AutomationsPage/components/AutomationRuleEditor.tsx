import { useState } from 'react';
import { Form } from 'react-router-dom';
import { RichTextField } from '@shared/components/RichTextField';
import { stripRichText } from '@shared/utils/richText';

export interface AutomationRuleEditorProps {
  jobs: Array<{ id: string; title: string }>;
  variables: string[];
}

/**
 * Rule editor form for recruiter automations.
 *
 * TODO: replace the hard-coded trigger list when the backend exposes trigger metadata.
 */
export const AutomationRuleEditor = ({ jobs, variables }: AutomationRuleEditorProps) => {
  const [body, setBody] = useState('');
  const [bodyError, setBodyError] = useState('');

  return (
    <Form
      method="post"
      action="/recruiter/automations"
      className="grid gap-3 md:grid-cols-2"
      onSubmit={(event) => {
        if (!stripRichText(body)) {
          setBodyError('Email body is required.');
          event.preventDefault();
        }
      }}
    >
      <input aria-label="rule name" name="name" placeholder="Rule name" className="rounded-lg border border-zinc-300 px-3 py-2" required />
      <select aria-label="trigger" name="trigger" className="rounded-lg border border-zinc-300 px-3 py-2">
        {['candidate.stage_changed', 'interview.scheduled', 'interview.rescheduled', 'offer.sent'].map((item) => (
          <option key={item} value={item}>{item}</option>
        ))}
      </select>
      <select aria-label="job condition" name="jobId" className="rounded-lg border border-zinc-300 px-3 py-2">
        <option value="">All jobs</option>
        {jobs.map((job) => (
          <option key={job.id} value={job.id}>{job.title}</option>
        ))}
      </select>
      <input aria-label="from stage" name="fromStage" placeholder="From stage optional" className="rounded-lg border border-zinc-300 px-3 py-2" />
      <input aria-label="to stage" name="toStage" placeholder="To stage optional" className="rounded-lg border border-zinc-300 px-3 py-2" />
      <input aria-label="subject" name="subject" placeholder="Email subject" className="rounded-lg border border-zinc-300 px-3 py-2 md:col-span-2" required />
      <div className="md:col-span-2">
        <RichTextField
          label="Email body"
          name="body"
          value={body}
          onChange={(value) => {
            setBody(value);
            setBodyError('');
          }}
          placeholder="Write the email body"
          helperText="Use lightweight formatting and variables to keep automated messages clear and readable."
          required
          minHeightClassName="min-h-[170px]"
          error={bodyError}
        />
      </div>
      <label className="flex items-center gap-2"><input type="checkbox" name="enabled" defaultChecked /> Enabled</label>
      <div className="text-xs text-zinc-500">Variables: {variables.join(' ')}</div>
      <button className="rounded-lg bg-zinc-900 px-4 py-2 text-white md:col-span-2" type="submit">Save automation</button>
    </Form>
  );
};
