import type { CandidateStage } from '@features/recruiter/types/candidate.type';

export type AutomationTrigger =
  | 'candidate.stage_changed'
  | 'interview.scheduled'
  | 'interview.rescheduled'
  | 'offer.sent';

export interface AutomationRule {
  id: string;
  name: string;
  enabled: boolean;
  trigger: AutomationTrigger;
  jobId?: string;
  fromStage?: CandidateStage;
  toStage?: CandidateStage;
  subject: string;
  body: string;
  lastRunAt?: string;
}

export interface AutomationAuditLog {
  id: string;
  at: string;
  ruleId: string;
  ruleName: string;
  trigger: AutomationTrigger;
  candidateId?: string;
  jobId?: string;
  outcome: 'sent' | 'skipped';
  message: string;
}

export interface AutomationOutboxEmail {
  id: string;
  sentAt: string;
  to: string;
  subject: string;
  body: string;
  candidateId?: string;
  jobId?: string;
}
