import { redirect, type ActionFunctionArgs } from 'react-router-dom';
import { createId, getRecruiterState, runAutomations, saveRecruiterState } from '@features/recruiter/data/storage';
import type { CandidateStage } from '@features/recruiter/types/recruiter.type';
import { recruiterService } from '@features/recruiter/service/recruiter.service';
import { ApiError } from '@shared/api/http';

const getString = (formData: FormData, key: string) => String(formData.get(key) ?? '').trim();
const getNum = (formData: FormData, key: string) => {
  const value = Number(formData.get(key));
  return Number.isFinite(value) ? value : undefined;
};

export const upsertJobAction = async ({ request, params }: ActionFunctionArgs) => {
  const formData = await request.formData();
  const payload = {
    title: getString(formData, 'title'),
    description: getString(formData, 'description'),
    responsibilities: getString(formData, 'responsibilities'),
    required_skills: getString(formData, 'required_skills').split(',').map((v) => v.trim()).filter(Boolean),
    preferred_skills: getString(formData, 'preferred_skills').split(',').map((v) => v.trim()).filter(Boolean),
    experience_level: getString(formData, 'experience_level') || undefined,
    min_years: getNum(formData, 'min_years'),
    education: getString(formData, 'education') || undefined,
    min_education: getString(formData, 'min_education') || undefined,
    department: getString(formData, 'department') || undefined,
    benefits: getString(formData, 'benefits') || undefined,
    salary_min_per_annum: getNum(formData, 'salary_min_per_annum'),
    salary_max_per_annum: getNum(formData, 'salary_max_per_annum'),
    currency: getString(formData, 'currency') || 'PHP',
    location: getString(formData, 'location'),
    schedule: getString(formData, 'schedule') || undefined,
    work_setup: getNum(formData, 'work_setup') ?? 0,
    employment_type: getNum(formData, 'employment_type') ?? 0,
    status: getString(formData, 'status') || 'Draft',
    number_of_vacancies: Math.max(0, getNum(formData, 'number_of_vacancies') ?? 1),
  };

 try {
    console.info('[Recruiter] Save clicked', { mode: params.jobId ? 'edit' : 'create', payload });
    const job = params.jobId
      ? await recruiterService.updateJob(params.jobId, payload)
      : await recruiterService.createJob(payload);

    const result = params.jobId ? "updated" : "created";
    return redirect(`/recruiter/job-posts/${job.id}?toast=${result}`);
  } catch (error) {
    console.error('[Recruiter] Save failed', error);
    if (error instanceof ApiError) {
      if (error.status === 401) {
        return redirect('/login');
      }

      const responseData = error.data as { message?: string; errors?: string[] } | null;
      if (responseData?.errors?.length) {
        return { error: responseData.errors.join(' ') };
      }

      if (responseData?.message) {
        return { error: responseData.message };
      }

      return { error: 'Unable to save job right now. Please try again.' };
    }
      return { error: 'Unable to save job right now. Please try again.' };
  }
};

export const deleteJobAction = async ({ params }: ActionFunctionArgs) => {
  if (!params.jobId) return null;
  await recruiterService.deleteJob(params.jobId);
  return redirect('/recruiter/job-posts');
};

export const updateJobStatusAction = async ({ request, params }: ActionFunctionArgs) => {
  const formData = await request.formData();
  const status = getString(formData, 'status');
  if (!params.jobId) return null;
  if (status === 'Published') await recruiterService.publishJob(params.jobId);
  if (status === 'Closed') await recruiterService.closeJob(params.jobId);
  return null;
};

export const updateCandidateAction = async ({ request, params }: ActionFunctionArgs) => {
  const formData = await request.formData();
  const intent = getString(formData, 'intent');

  if (intent === 'stage' && params.candidateId) {
    const status = getString(formData, 'status');
    await recruiterService.updateApplicantStatuses([params.candidateId], status);
  }

  if (intent === 'bulk-stage') {
    const status = getString(formData, 'status');
    const selectedIdsRaw = getString(formData, 'selectedIds');
    const selectedIds = selectedIdsRaw
      .split(',')
      .map((item) => item.trim())
      .filter(Boolean);

    if (selectedIds.length > 0) {
      await recruiterService.updateApplicantStatuses(selectedIds, status);
    }
  }

  if (intent === 'bulk-stage') {
      const status = getString(formData, 'status');
      const selectedIdsRaw = getString(formData, 'selectedIds');
      const selectedIds = selectedIdsRaw
        .split(',')
        .map((item) => item.trim())
        .filter(Boolean);

      if (selectedIds.length > 0) {
        await recruiterService.updateApplicantStatuses(selectedIds, status);
      }
    }
  
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
