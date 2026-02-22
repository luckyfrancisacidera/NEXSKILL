export type JobStatus = 'Open' | 'Paused' | 'Closed';
export type EmploymentType = 'Full-Time' | 'Part-Time' | 'Contract' | 'Internship';
export type CandidateStage = 'Applied' | 'Screening' | 'Interview' | 'Offer' | 'Hired' | 'Rejected';
export type InterviewStatus = 'Scheduled' | 'Completed' | 'Canceled';

export interface JobDescriptionSections {
  overview: string[];
  responsibilities: string[];
  requirements: string[];
  benefits: string[];
}

export interface RecruiterJob {
  id: string;
  title: string;
  department: string;
  location: string;
  type: EmploymentType;
  status: JobStatus;
  salaryMin?: number;
  salaryMax?: number;
  tags: string[];
  description: JobDescriptionSections;
  updatedAt: string;
  createdAt: string;
}

export interface RecruiterCandidate {
  id: string;
  name: string;
  email: string;
  jobId: string;
  stage: CandidateStage;
  score: number;
  notes: string;
  attachments: string[];
  lastActivityAt: string;
}

export interface RecruiterInterview {
  id: string;
  candidateId: string;
  jobId: string;
  interviewer: string;
  startsAt: string;
  durationMinutes: number;
  location: string;
  status: InterviewStatus;
  cancelReason?: string;
  updatedAt: string;
}

export type AutomationTrigger = 'candidate.stage_changed' | 'interview.scheduled' | 'interview.rescheduled' | 'offer.sent';

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

export interface DayHours {
  enabled: boolean;
  start: string;
  end: string;
}

export interface RecruiterSettings {
  timezone: string;
  defaultInterviewDuration: number;
  bufferBefore: number;
  bufferAfter: number;
  hoursByDay: Record<string, DayHours>;
  calendarConnections: {
    google: boolean;
    outlook: boolean;
  };
}

export interface RecruiterState {
  jobs: RecruiterJob[];
  candidates: RecruiterCandidate[];
  interviews: RecruiterInterview[];
  automations: AutomationRule[];
  auditLog: AutomationAuditLog[];
  outbox: AutomationOutboxEmail[];
  settings: RecruiterSettings;
}
