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
    <Card className="min-w-0 p-4 sm:p-6">
      <h2 className="mb-4 text-lg font-semibold text-zinc-900 dark:text-zinc-100 sm:text-xl">Schedule Settings</h2>
      <Form method="post" className="space-y-4">
        <div className="grid gap-3 md:grid-cols-2">
          <RecruiterLabeledField label="Timezone">
            <select aria-label="timezone" name="timezone" defaultValue={settings.timezone} className="w-full rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-3 py-2 text-zinc-800 dark:text-zinc-100 focus:border-violet-500 dark:focus:border-violet-600 focus:ring-4 focus:ring-violet-100 dark:focus:ring-violet-900" style={{ colorScheme: 'light dark' }}>
              {['UTC', 'America/New_York', 'Europe/London', 'Asia/Manila'].map((zone) => (
                <option key={zone} value={zone}>{zone}</option>
              ))}
            </select>
          </RecruiterLabeledField>
          <RecruiterLabeledField label="Default duration">
            <input aria-label="default duration" type="number" name="defaultInterviewDuration" defaultValue={settings.defaultInterviewDuration} className="w-full rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-3 py-2 text-zinc-800 dark:text-zinc-100 focus:border-violet-500 dark:focus:border-violet-600 focus:ring-4 focus:ring-violet-100 dark:focus:ring-violet-900" />
          </RecruiterLabeledField>
          <RecruiterLabeledField label="Buffer before">
            <input aria-label="buffer before" type="number" name="bufferBefore" defaultValue={settings.bufferBefore} className="w-full rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-3 py-2 text-zinc-800 dark:text-zinc-100 focus:border-violet-500 dark:focus:border-violet-600 focus:ring-4 focus:ring-violet-100 dark:focus:ring-violet-900" />
          </RecruiterLabeledField>
          <RecruiterLabeledField label="Buffer after">
            <input aria-label="buffer after" type="number" name="bufferAfter" defaultValue={settings.bufferAfter} className="w-full rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-3 py-2 text-zinc-800 dark:text-zinc-100 focus:border-violet-500 dark:focus:border-violet-600 focus:ring-4 focus:ring-violet-100 dark:focus:ring-violet-900" />
          </RecruiterLabeledField>
        </div>

        <div>
          <h3 className="mb-2 font-medium text-zinc-900 dark:text-zinc-100">Available days and working hours</h3>
          <div className="space-y-2">
            {Object.entries(settings.hoursByDay).map(([day, hours]) => (
              <div key={day} className="grid items-center gap-2 sm:grid-cols-2 lg:grid-cols-4">
                <label className="flex items-center gap-2 text-zinc-700 dark:text-zinc-300 cursor-pointer">
                  <input type="checkbox" name={`${day}-enabled`} defaultChecked={hours.enabled} className="appearance-none h-4 w-4 rounded bg-zinc-900 checked:bg-zinc-100 border border-zinc-300 dark:border-zinc-600 cursor-pointer focus:ring-2 focus:ring-violet-500 dark:focus:ring-violet-600 focus:ring-offset-1 dark:focus:ring-offset-zinc-950" /> {day}
                </label>
                <input aria-label={`${day} start`} type="time" name={`${day}-start`} defaultValue={hours.start} className="rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-3 py-2 text-zinc-800 dark:text-zinc-100 focus:border-violet-500 dark:focus:border-violet-600 focus:ring-4 focus:ring-violet-100 dark:focus:ring-violet-900" style={{ colorScheme: 'light dark' }} />
                <input aria-label={`${day} end`} type="time" name={`${day}-end`} defaultValue={hours.end} className="rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-3 py-2 text-zinc-800 dark:text-zinc-100 focus:border-violet-500 dark:focus:border-violet-600 focus:ring-4 focus:ring-violet-100 dark:focus:ring-violet-900" style={{ colorScheme: 'light dark' }} />
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <h3 className="font-medium text-zinc-900 dark:text-zinc-100">Calendar connections (UI only)</h3>
          <label className="flex items-center gap-2 text-zinc-700 dark:text-zinc-300 cursor-pointer">
            <input type="checkbox" name="google" defaultChecked={settings.calendarConnections.google} className="appearance-none h-4 w-4 rounded bg-zinc-900 checked:bg-zinc-100 border border-zinc-300 dark:border-zinc-600 cursor-pointer focus:ring-2 focus:ring-violet-500 dark:focus:ring-violet-600 focus:ring-offset-1 dark:focus:ring-offset-zinc-950" />
            Google Calendar
          </label>
          <label className="flex items-center gap-2 text-zinc-700 dark:text-zinc-300 cursor-pointer">
            <input type="checkbox" name="outlook" defaultChecked={settings.calendarConnections.outlook} className="appearance-none h-4 w-4 rounded bg-zinc-900 checked:bg-zinc-100 border border-zinc-300 dark:border-zinc-600 cursor-pointer focus:ring-2 focus:ring-violet-500 dark:focus:ring-violet-600 focus:ring-offset-1 dark:focus:ring-offset-zinc-950" />
            Outlook Calendar
          </label>
        </div>

        <button className="w-full rounded-lg bg-zinc-900 px-4 py-2 text-white hover:bg-zinc-800 font-semibold transition dark:bg-violet-600 dark:hover:bg-violet-700 sm:w-auto" type="submit">Save settings</button>
      </Form>
    </Card>
  );
};

