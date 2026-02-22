import { redirect, type ActionFunctionArgs } from 'react-router-dom';
import { createId, getRecruiterState, runAutomations, saveRecruiterState } from '@features/recruiter/data/storage';
import type { CandidateStage } from '@features/recruiter/types/recruiter.type';

const getString = (formData: FormData, key: string) => String(formData.get(key) ?? '').trim();
const getNum = (formData: FormData, key: string) => {
  const value = Number(formData.get(key));
  return Number.isFinite(value) ? value : undefined;
};

export const upsertJobAction = async ({ request, params }: ActionFunctionArgs) => {
  const formData = await request.formData();
  const state = getRecruiterState();
  const title = getString(formData, 'title');
  const department = getString(formData, 'department');
  const location = getString(formData, 'location');
  const type = getString(formData, 'type') as 'Full-Time' | 'Part-Time' | 'Contract' | 'Internship';
  const status = getString(formData, 'status') as 'Open' | 'Paused' | 'Closed';

  if (title.length < 3 || department.length < 2 || location.length < 2) {
    return { error: 'Please provide valid values for required fields.' };
  }

  const description = {
    overview: getString(formData, 'overview').split('\n').filter(Boolean),
    responsibilities: getString(formData, 'responsibilities').split('\n').filter(Boolean),
    requirements: getString(formData, 'requirements').split('\n').filter(Boolean),
    benefits: getString(formData, 'benefits').split('\n').filter(Boolean),
  };

  const jobId = params.jobId ?? createId('job');
  const existing = state.jobs.find((item) => item.id === jobId);
  const next = {
    id: jobId,
    title,
    department,
    location,
    type,
    status,
    salaryMin: getNum(formData, 'salaryMin'),
    salaryMax: getNum(formData, 'salaryMax'),
    tags: getString(formData, 'tags').split(',').map((item) => item.trim()).filter(Boolean),
    description,
    createdAt: existing?.createdAt ?? new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  state.jobs = existing ? state.jobs.map((item) => (item.id === jobId ? next : item)) : [next, ...state.jobs];
  saveRecruiterState(state);

  return redirect(`/recruiter/job-posts/${jobId}`);
};

export const deleteJobAction = async ({ request, params }: ActionFunctionArgs) => {
  const formData = await request.formData();
  const confirm = getString(formData, 'confirm');
  if (confirm !== 'DELETE') return { error: 'Type DELETE to confirm.' };
  const state = getRecruiterState();
  state.jobs = state.jobs.filter((item) => item.id !== params.jobId);
  saveRecruiterState(state);
  return redirect('/recruiter/job-posts');
};

export const updateJobStatusAction = async ({ request, params }: ActionFunctionArgs) => {
  const formData = await request.formData();
  const status = getString(formData, 'status') as 'Open' | 'Paused' | 'Closed';
  const state = getRecruiterState();
  state.jobs = state.jobs.map((item) => (item.id === params.jobId ? { ...item, status, updatedAt: new Date().toISOString() } : item));
  saveRecruiterState(state);
  return null;
};

export const updateCandidateAction = async ({ request, params }: ActionFunctionArgs) => {
  const formData = await request.formData();
  const state = getRecruiterState();
  const intent = getString(formData, 'intent');

  if (intent === 'notes') {
    const notes = getString(formData, 'notes');
    state.candidates = state.candidates.map((item) => (item.id === params.candidateId ? { ...item, notes, lastActivityAt: new Date().toISOString() } : item));
  }

  if (intent === 'stage') {
    const toStage = getString(formData, 'toStage') as CandidateStage;
    const candidate = state.candidates.find((item) => item.id === params.candidateId);
    if (candidate) {
      const fromStage = candidate.stage;
      state.candidates = state.candidates.map((item) => (item.id === candidate.id ? { ...item, stage: toStage, lastActivityAt: new Date().toISOString() } : item));
      runAutomations(state, { trigger: 'candidate.stage_changed', candidateId: candidate.id, jobId: candidate.jobId, fromStage, toStage });
    }
  }

  saveRecruiterState(state);
  return null;
};

export const upsertInterviewAction = async ({ request, params }: ActionFunctionArgs) => {
  const formData = await request.formData();
  const state = getRecruiterState();
  const interviewId = params.interviewId ?? createId('int');
  const existing = state.interviews.find((item) => item.id === interviewId);

  const interviewer = getString(formData, 'interviewer');
  const candidateId = getString(formData, 'candidateId');
  const jobId = getString(formData, 'jobId');
  const startsAt = new Date(getString(formData, 'startsAt')).toISOString();
  const durationMinutes = Number(getString(formData, 'durationMinutes')) || state.settings.defaultInterviewDuration;
  const location = getString(formData, 'location');
  const status = getString(formData, 'status') as 'Scheduled' | 'Completed' | 'Canceled';

  const startMs = new Date(startsAt).getTime();
  const endMs = startMs + durationMinutes * 60 * 1000;

  const overlap = state.interviews.some((item) => {
    if (item.interviewer !== interviewer || item.status === 'Canceled' || item.id === interviewId) return false;
    const itemStart = new Date(item.startsAt).getTime();
    const itemEnd = itemStart + item.durationMinutes * 60 * 1000;
    return startMs < itemEnd && itemStart < endMs;
  });

  if (overlap) {
    return { error: 'Scheduling conflict: interviewer already has overlapping interview.' };
  }

  const payload = {
    id: interviewId,
    interviewer,
    candidateId,
    jobId,
    startsAt,
    durationMinutes,
    location,
    status,
    cancelReason: getString(formData, 'cancelReason') || undefined,
    updatedAt: new Date().toISOString(),
  };

  state.interviews = existing ? state.interviews.map((item) => (item.id === interviewId ? payload : item)) : [payload, ...state.interviews];

  if (!existing && status === 'Scheduled') {
    runAutomations(state, { trigger: 'interview.scheduled', candidateId, jobId, interviewDate: new Date(startsAt).toLocaleString() });
  }
  if (existing && status === 'Scheduled') {
    runAutomations(state, { trigger: 'interview.rescheduled', candidateId, jobId, interviewDate: new Date(startsAt).toLocaleString() });
  }

  saveRecruiterState(state);
  return redirect('/recruiter/interviews');
};

export const cancelInterviewAction = async ({ request, params }: ActionFunctionArgs) => {
  const formData = await request.formData();
  const reason = getString(formData, 'cancelReason');
  const state = getRecruiterState();
  state.interviews = state.interviews.map((item) => (item.id === params.interviewId ? { ...item, status: 'Canceled', cancelReason: reason, updatedAt: new Date().toISOString() } : item));
  saveRecruiterState(state);
  return null;
};

export const automationRuleAction = async ({ request, params }: ActionFunctionArgs) => {
  const formData = await request.formData();
  const state = getRecruiterState();
  const intent = getString(formData, 'intent');

  if (intent === 'delete') {
    state.automations = state.automations.filter((item) => item.id !== params.ruleId);
  } else if (intent === 'toggle') {
    state.automations = state.automations.map((item) => (item.id === params.ruleId ? { ...item, enabled: formData.get('enabled') === 'true' } : item));
  } else {
    const ruleId = params.ruleId ?? createId('rule');
    const existing = state.automations.find((item) => item.id === ruleId);
    const next = {
      id: ruleId,
      name: getString(formData, 'name'),
      enabled: formData.get('enabled') === 'true',
      trigger: getString(formData, 'trigger') as 'candidate.stage_changed' | 'interview.scheduled' | 'interview.rescheduled' | 'offer.sent',
      jobId: getString(formData, 'jobId') || undefined,
      fromStage: getString(formData, 'fromStage') as CandidateStage,
      toStage: getString(formData, 'toStage') as CandidateStage,
      subject: getString(formData, 'subject'),
      body: getString(formData, 'body'),
      lastRunAt: existing?.lastRunAt,
    };

    state.automations = existing ? state.automations.map((item) => (item.id === ruleId ? next : item)) : [next, ...state.automations];
  }

  saveRecruiterState(state);
  return null;
};

export const runOfferAutomationAction = async ({ request }: ActionFunctionArgs) => {
  const formData = await request.formData();
  const state = getRecruiterState();
  runAutomations(state, {
    trigger: 'offer.sent',
    candidateId: getString(formData, 'candidateId') || undefined,
    jobId: getString(formData, 'jobId') || undefined,
  });
  saveRecruiterState(state);
  return null;
};

export const updateRecruiterSettingsAction = async ({ request }: ActionFunctionArgs) => {
  const formData = await request.formData();
  const state = getRecruiterState();
  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  state.settings = {
    timezone: getString(formData, 'timezone'),
    defaultInterviewDuration: Number(getString(formData, 'defaultInterviewDuration')) || 60,
    bufferBefore: Number(getString(formData, 'bufferBefore')) || 15,
    bufferAfter: Number(getString(formData, 'bufferAfter')) || 15,
    calendarConnections: {
      google: formData.get('google') === 'on',
      outlook: formData.get('outlook') === 'on',
    },
    hoursByDay: days.reduce<Record<string, { enabled: boolean; start: string; end: string }>>((acc, day) => {
      acc[day] = {
        enabled: formData.get(`${day}-enabled`) === 'on',
        start: getString(formData, `${day}-start`) || '09:00',
        end: getString(formData, `${day}-end`) || '17:00',
      };
      return acc;
    }, {}),
  };

  saveRecruiterState(state);
  return null;
};
