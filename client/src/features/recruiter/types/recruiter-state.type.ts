import type {
  AutomationAuditLog,
  AutomationOutboxEmail,
  AutomationRule,
} from '@features/recruiter/types/automation.type';
import type { RecruiterCandidate } from '@features/recruiter/types/candidate.type';
import type { RecruiterInterview } from '@features/recruiter/types/interview.type';
import type { RecruiterJob } from '@features/recruiter/types/job.type';
import type { RecruiterSettings } from '@features/recruiter/types/settings.type';

export interface RecruiterState {
  jobs: RecruiterJob[];
  candidates: RecruiterCandidate[];
  interviews: RecruiterInterview[];
  automations: AutomationRule[];
  auditLog: AutomationAuditLog[];
  outbox: AutomationOutboxEmail[];
  settings: RecruiterSettings;
}
