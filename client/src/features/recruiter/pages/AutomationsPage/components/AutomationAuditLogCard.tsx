import { Form } from 'react-router-dom';

import type { AutomationAuditLog } from '@features/recruiter/types';
import { Card } from '@shared/components/Card';

export interface AutomationAuditLogCardProps {
  auditLog: AutomationAuditLog[];
}

/**
 * Audit log card for recruiter automation activity.
 */
export const AutomationAuditLogCard = ({ auditLog }: AutomationAuditLogCardProps) => (
  <Card>
    <div className="mb-2 flex items-center justify-between">
      <h3 className="font-semibold">Audit log</h3>
      <Form method="post" action="/recruiter/automations/run-offer">
        <input type="hidden" name="candidateId" value="cand-1" />
        <input type="hidden" name="jobId" value="job-1" />
        <button className="rounded border border-zinc-300 px-2 py-1 text-xs" type="submit">Mock offer trigger</button>
      </Form>
    </div>
    <ul className="space-y-2 text-sm">
      {auditLog.map((log) => (
        <li key={log.id} className="rounded border border-zinc-200 p-2">
          {log.ruleName} - {log.outcome}
          <p className="text-xs text-zinc-500">
            {log.message} - {new Date(log.at).toLocaleString()}
          </p>
        </li>
      ))}
    </ul>
  </Card>
);
