import { Form } from 'react-router-dom';

import type { AutomationRule } from '@features/recruiter/types';

export interface AutomationRulesTableProps {
  rules: AutomationRule[];
}

/**
 * Automation rules listing with inline toggle and delete actions.
 */
export const AutomationRulesTable = ({ rules }: AutomationRulesTableProps) => (
  <table className="min-w-full text-sm">
    <thead>
      <tr>
        {['Name', 'Trigger', 'Template', 'Enabled', 'Last run', 'Actions'].map((column) => (
          <th key={column} className="px-3 py-2 text-left">
            {column}
          </th>
        ))}
      </tr>
    </thead>
    <tbody>
      {rules.map((rule) => (
        <tr key={rule.id}>
          <td className="px-3 py-2">{rule.name}</td>
          <td className="px-3 py-2">{rule.trigger}</td>
          <td className="px-3 py-2">{rule.subject}</td>
          <td className="px-3 py-2">{rule.enabled ? 'On' : 'Off'}</td>
          <td className="px-3 py-2">{rule.lastRunAt ? new Date(rule.lastRunAt).toLocaleString() : '-'}</td>
          <td className="px-3 py-2">
            <Form method="post" action={`/recruiter/automations/${rule.id}`} className="inline">
              <input type="hidden" name="intent" value="toggle" />
              <input type="hidden" name="enabled" value={String(!rule.enabled)} />
              <button className="mr-2 underline" type="submit">Toggle</button>
            </Form>
            <Form method="post" action={`/recruiter/automations/${rule.id}`} className="inline">
              <input type="hidden" name="intent" value="delete" />
              <button className="underline" type="submit">Delete</button>
            </Form>
          </td>
        </tr>
      ))}
    </tbody>
  </table>
);
