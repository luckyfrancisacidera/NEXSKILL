/**
 * Recruiter scheduling settings page.
 *
 * Main exports:
 * - `RecruiterSettingsPage`: Route component for interview scheduling defaults.
 *
 * Usage notes:
 * - The route expects loader data shaped as `{ settings: RecruiterSettings }`.
 * - Form field names intentionally mirror the existing action contract.
 * - TODO: connect calendar provider toggles to real integration status once those APIs are available.
 */
import { Form, useLoaderData } from 'react-router-dom';

import { RecruiterLabeledField } from '@features/recruiter/components/RecruiterLabeledField';
import type { RecruiterSettings } from '@features/recruiter/types';
import { Card } from '@shared/components/Card';

interface RecruiterSettingsLoaderData {
  settings: RecruiterSettings;
}

/**
 * Route component for recruiter schedule settings.
 */
export const RecruiterSettingsPage = () => {
  const { settings } = useLoaderData() as RecruiterSettingsLoaderData;

  return (
    <Card>
      <h2 className="mb-4 text-xl font-semibold">Schedule Settings</h2>
      <Form method="post" className="space-y-4">
        <div className="grid gap-3 md:grid-cols-2">
          <RecruiterLabeledField label="Timezone">
            <select aria-label="timezone" name="timezone" defaultValue={settings.timezone} className="w-full rounded-lg border border-zinc-300 px-3 py-2">
              {['UTC', 'America/New_York', 'Europe/London', 'Asia/Manila'].map((zone) => (
                <option key={zone} value={zone}>{zone}</option>
              ))}
            </select>
          </RecruiterLabeledField>
          <RecruiterLabeledField label="Default duration">
            <input aria-label="default duration" type="number" name="defaultInterviewDuration" defaultValue={settings.defaultInterviewDuration} className="w-full rounded-lg border border-zinc-300 px-3 py-2" />
          </RecruiterLabeledField>
          <RecruiterLabeledField label="Buffer before">
            <input aria-label="buffer before" type="number" name="bufferBefore" defaultValue={settings.bufferBefore} className="w-full rounded-lg border border-zinc-300 px-3 py-2" />
          </RecruiterLabeledField>
          <RecruiterLabeledField label="Buffer after">
            <input aria-label="buffer after" type="number" name="bufferAfter" defaultValue={settings.bufferAfter} className="w-full rounded-lg border border-zinc-300 px-3 py-2" />
          </RecruiterLabeledField>
        </div>

        <div>
          <h3 className="mb-2 font-medium">Available days and working hours</h3>
          <div className="space-y-2">
            {Object.entries(settings.hoursByDay).map(([day, hours]) => (
              <div key={day} className="grid items-center gap-2 md:grid-cols-4">
                <label className="flex items-center gap-2">
                  <input type="checkbox" name={`${day}-enabled`} defaultChecked={hours.enabled} /> {day}
                </label>
                <input aria-label={`${day} start`} type="time" name={`${day}-start`} defaultValue={hours.start} className="rounded-lg border border-zinc-300 px-3 py-2" />
                <input aria-label={`${day} end`} type="time" name={`${day}-end`} defaultValue={hours.end} className="rounded-lg border border-zinc-300 px-3 py-2" />
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <h3 className="font-medium">Calendar connections (UI only)</h3>
          <label className="flex items-center gap-2">
            <input type="checkbox" name="google" defaultChecked={settings.calendarConnections.google} />
            Google Calendar
          </label>
          <label className="flex items-center gap-2">
            <input type="checkbox" name="outlook" defaultChecked={settings.calendarConnections.outlook} />
            Outlook Calendar
          </label>
        </div>

        <button className="rounded-lg bg-zinc-900 px-4 py-2 text-white" type="submit">Save settings</button>
      </Form>
    </Card>
  );
};


