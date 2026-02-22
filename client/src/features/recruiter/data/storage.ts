import { readStorage, writeStorage } from '@shared/utils/storage';
import type {
  AutomationAuditLog,
  AutomationOutboxEmail,
  AutomationRule,
  CandidateStage,
  RecruiterCandidate,
  RecruiterInterview,
  RecruiterJob,
  RecruiterSettings,
  RecruiterState,
} from '@features/recruiter/types/recruiter.type';

const KEY = 'nexskill.recruiter';

const now = () => new Date().toISOString();

const seedSettings: RecruiterSettings = {
  timezone: 'UTC',
  defaultInterviewDuration: 60,
  bufferBefore: 15,
  bufferAfter: 15,
  hoursByDay: {
    Monday: { enabled: true, start: '09:00', end: '17:00' },
    Tuesday: { enabled: true, start: '09:00', end: '17:00' },
    Wednesday: { enabled: true, start: '09:00', end: '17:00' },
    Thursday: { enabled: true, start: '09:00', end: '17:00' },
    Friday: { enabled: true, start: '09:00', end: '17:00' },
    Saturday: { enabled: false, start: '10:00', end: '14:00' },
    Sunday: { enabled: false, start: '10:00', end: '14:00' },
  },
  calendarConnections: { google: true, outlook: false },
};

const seedJobs: RecruiterJob[] = [
  {
    id: 'job-1', title: 'Product Manager', department: 'Product', location: 'New York, NY', type: 'Full-Time', status: 'Open',
    tags: ['Roadmaps', 'B2B', 'Leadership'], salaryMin: 130000, salaryMax: 165000,
    description: {
      overview: ['Lead product strategy for the recruiting platform.'],
      responsibilities: ['Define quarterly roadmap', 'Partner with engineering and design'],
      requirements: ['5+ years PM experience', 'Strong analytics mindset'],
      benefits: ['Health insurance', 'Remote flexibility'],
    },
    createdAt: now(), updatedAt: now(),
  },
  {
    id: 'job-2', title: 'UX Designer', department: 'Design', location: 'Remote', type: 'Contract', status: 'Paused',
    tags: ['Figma', 'Research'], description: { overview: ['Design end-to-end candidate flows.'], responsibilities: ['Create wireframes'], requirements: ['Portfolio required'], benefits: ['Flexible hours'] },
    createdAt: now(), updatedAt: now(),
  },
];

const seedCandidates: RecruiterCandidate[] = [
  { id: 'cand-1', name: 'Alex Johnson', email: 'alex@example.com', jobId: 'job-1', stage: 'Screening', score: 86, notes: 'Strong product sense.', attachments: ['resume.pdf'], lastActivityAt: now() },
  { id: 'cand-2', name: 'Mina Patel', email: 'mina@example.com', jobId: 'job-1', stage: 'Interview', score: 92, notes: 'Excellent leadership examples.', attachments: ['portfolio.pdf'], lastActivityAt: now() },
  { id: 'cand-3', name: 'Chris Lee', email: 'chris@example.com', jobId: 'job-2', stage: 'Applied', score: 79, notes: 'Needs stronger case studies.', attachments: ['resume.pdf'], lastActivityAt: now() },
];

const seedAutomations: AutomationRule[] = [
  {
    id: 'rule-1', name: 'Stage Change Follow-up', enabled: true, trigger: 'candidate.stage_changed',
    fromStage: 'Applied', toStage: 'Screening',
    subject: 'Your application for {{jobTitle}} has moved forward',
    body: 'Hi {{candidateName}},\n\nGreat news — your application moved to Screening for {{jobTitle}}.',
  },
  {
    id: 'rule-2', name: 'Interview Confirmation', enabled: true, trigger: 'interview.scheduled',
    subject: 'Interview scheduled for {{jobTitle}} on {{interviewDate}}',
    body: 'Hi {{candidateName}},\n\nYour interview is confirmed for {{interviewDate}}.',
  },
];

const seedInterviews: RecruiterInterview[] = [
  {
    id: 'int-1', candidateId: 'cand-2', jobId: 'job-1', interviewer: 'Jordan Kim',
    startsAt: new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString(), durationMinutes: 60,
    location: 'Zoom Link', status: 'Scheduled', updatedAt: now(),
  },
];

const initialState: RecruiterState = {
  jobs: seedJobs,
  candidates: seedCandidates,
  interviews: seedInterviews,
  automations: seedAutomations,
  auditLog: [],
  outbox: [],
  settings: seedSettings,
};

export const getRecruiterState = () => readStorage<RecruiterState>(KEY, initialState);

export const saveRecruiterState = (state: RecruiterState) => writeStorage(KEY, state);

export const withRecruiterState = <T>(updater: (state: RecruiterState) => T) => {
  const state = getRecruiterState();
  const result = updater(state);
  saveRecruiterState(state);
  return result;
};

export const createId = (prefix: string) => `${prefix}-${Math.random().toString(36).slice(2, 10)}`;

const templateVars = (candidate?: RecruiterCandidate, job?: RecruiterJob, interviewDate?: string) => ({
  candidateName: candidate?.name ?? 'Candidate',
  jobTitle: job?.title ?? 'Role',
  interviewDate: interviewDate ?? 'TBD',
});

const applyTemplate = (text: string, vars: Record<string, string>) =>
  text.replace(/{{\s*(\w+)\s*}}/g, (_, key: string) => vars[key] ?? '');

interface AutomationContext {
  trigger: AutomationRule['trigger'];
  candidateId?: string;
  jobId?: string;
  fromStage?: CandidateStage;
  toStage?: CandidateStage;
  interviewDate?: string;
}

export const runAutomations = (state: RecruiterState, context: AutomationContext) => {
  const candidate = state.candidates.find((item) => item.id === context.candidateId);
  const job = state.jobs.find((item) => item.id === (context.jobId ?? candidate?.jobId));

  state.automations = state.automations.map((rule) => {
    const triggerMatch = rule.trigger === context.trigger;
    const jobMatch = !rule.jobId || rule.jobId === context.jobId || rule.jobId === candidate?.jobId;
    const fromMatch = !rule.fromStage || rule.fromStage === context.fromStage;
    const toMatch = !rule.toStage || rule.toStage === context.toStage;
    const eligible = rule.enabled && triggerMatch && jobMatch && fromMatch && toMatch;

    if (!eligible) return rule;

    const vars = templateVars(candidate, job, context.interviewDate);
    const subject = applyTemplate(rule.subject, vars);
    const body = applyTemplate(rule.body, vars);

    const outboxItem: AutomationOutboxEmail = {
      id: createId('mail'),
      sentAt: now(),
      to: candidate?.email ?? 'unknown@example.com',
      subject,
      body,
      candidateId: candidate?.id,
      jobId: job?.id,
    };

    const log: AutomationAuditLog = {
      id: createId('audit'),
      at: now(),
      ruleId: rule.id,
      ruleName: rule.name,
      trigger: rule.trigger,
      candidateId: candidate?.id,
      jobId: job?.id,
      outcome: 'sent',
      message: `Simulated send to ${outboxItem.to}`,
    };

    state.outbox = [outboxItem, ...state.outbox].slice(0, 100);
    state.auditLog = [log, ...state.auditLog].slice(0, 250);

    return { ...rule, lastRunAt: now() };
  });
};
