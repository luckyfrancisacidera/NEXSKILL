import type { AutomationOutboxEmail } from '@features/recruiter/types';
import { Card } from '@shared/components/Card';

export interface AutomationOutboxCardProps {
  outbox: AutomationOutboxEmail[];
}

/**
 * Outbox card for recruiter automation email history.
 */
export const AutomationOutboxCard = ({ outbox }: AutomationOutboxCardProps) => (
  <Card>
    <h3 className="mb-2 font-semibold">Outbox</h3>
    <ul className="space-y-2 text-sm">
      {outbox.map((mail) => (
        <li key={mail.id} className="rounded border border-zinc-200 p-2">
          <p className="font-medium">{mail.subject}</p>
          <p>To: {mail.to}</p>
          <p className="text-xs text-zinc-500">{new Date(mail.sentAt).toLocaleString()}</p>
        </li>
      ))}
    </ul>
  </Card>
);
