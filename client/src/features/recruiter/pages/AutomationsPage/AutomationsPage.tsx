/**
 * Recruiter automations page for managing rule templates, audit history, and mock triggers.
 *
 * Main exports:
 * - `AutomationsPage`: Route component for recruiter automation administration.
 *
 * Usage notes:
 * - The route expects rule, audit log, outbox, and job collections from the loader.
 * - Current forms intentionally post directly to route actions to preserve existing behavior.
 * - TODO: confirm whether additional trigger types should be surfaced once backend support is finalized.
 */
import { useLoaderData } from 'react-router-dom';

import { AutomationAuditLogCard } from '@features/recruiter/pages/AutomationsPage/components/AutomationAuditLogCard';
import { AutomationOutboxCard } from '@features/recruiter/pages/AutomationsPage/components/AutomationOutboxCard';
import { AutomationRuleEditor } from '@features/recruiter/pages/AutomationsPage/components/AutomationRuleEditor';
import { AutomationRulesTable } from '@features/recruiter/pages/AutomationsPage/components/AutomationRulesTable';
import type { AutomationAuditLog, AutomationOutboxEmail, AutomationRule } from '@features/recruiter/types';
import { Card } from '@shared/components/Card';

const variables = ['{{candidateName}}', '{{jobTitle}}', '{{interviewDate}}'];

interface AutomationsLoaderData {
  rules: AutomationRule[];
  auditLog: AutomationAuditLog[];
  outbox: AutomationOutboxEmail[];
  jobs: Array<{ id: string; title: string }>;
}

/**
 * Route component for recruiter automation management.
 */
export const AutomationsPage = () => {
  const { rules, auditLog, outbox, jobs } = useLoaderData() as AutomationsLoaderData;

  return (
    <div className="space-y-4">
      <Card>
        <h2 className="mb-3 text-xl font-semibold">Automation Rules</h2>
        <AutomationRulesTable rules={rules} />
      </Card>

      <Card>
        <h3 className="mb-3 text-lg font-semibold">Rule Editor</h3>
        <AutomationRuleEditor jobs={jobs} variables={variables} />
      </Card>

      <div className="grid gap-4 lg:grid-cols-2">
        <AutomationAuditLogCard auditLog={auditLog} />
        <AutomationOutboxCard outbox={outbox} />
      </div>
    </div>
  );
};
