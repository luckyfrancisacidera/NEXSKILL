import { redirect, type ActionFunctionArgs } from 'react-router-dom';
import {
  createId,
  getRecruiterState,
  runAutomations,
  saveRecruiterState,
} from '@features/recruiter/data/storage';
import { recruiterService } from '@features/recruiter/service/recruiter.service';
import type { CandidateStage, DayHours, InterviewStatus } from '@features/recruiter/types';
import { ApiError } from '@shared/api/http';

const getString = (formData: FormData, key: string) => String(formData.get(key) ?? '').trim();

const getNum = (formData: FormData, key: string) => {
  const value = Number(formData.get(key));
  return Number.isFinite(value) ? value : undefined;
};

const getApiErrorMessage = (error: unknown, fallbackMessage: string) => {
  if (error instanceof ApiError) {
    const responseData = error.data as { message?: string; errors?: string[] } | null;
    if (responseData?.errors?.length) {
      return responseData.errors.join(' ');
    }

    return responseData?.message ?? error.message ?? fallbackMessage;
  }

  return fallbackMessage;
};

const getJobPayload = (formData: FormData) => ({
  title: getString(formData, 'title'),
  description: getString(formData, 'description'),
  responsibilities: getString(formData, 'responsibilities'),
  required_skills: getString(formData, 'required_skills').split(',').map((value) => value.trim()).filter(Boolean),
  preferred_skills: getString(formData, 'preferred_skills').split(',').map((value) => value.trim()).filter(Boolean),
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
});

/** Create or update a recruiter job and redirect to the next route. */
export const upsertJobAction = async ({ request, params }: ActionFunctionArgs) => {
  try {
    const formData = await request.formData();
    const payload = getJobPayload(formData);

    console.info('[Recruiter] Save clicked', {
      mode: params.jobId ? 'edit' : 'create',
      payload,
    });

    const job = params.jobId
      ? await recruiterService.updateJob(params.jobId, payload)
      : await recruiterService.createJob(payload);

    if (params.jobId) {
      return redirect(`/recruiter/job-posts?toast=updated&updatedJobId=${job.id}`);
    }

    return redirect(`/recruiter/job-posts/${job.id}?toast=created`);
  } catch (error) {
    console.error('[Recruiter] Save failed', error);

    if (error instanceof ApiError && error.status === 401) {
      return redirect('/login');
    }

    return { error: getApiErrorMessage(error, 'Unable to save job right now. Please try again.') };
  }
};

/** Delete a recruiter job and return to the listing page. */
export const deleteJobAction = async ({ params }: ActionFunctionArgs) => {
  if (!params.jobId) return null;

  try {
    await recruiterService.deleteJob(params.jobId);
    return redirect('/recruiter/job-posts');
  } catch (error) {
    console.error('[Recruiter] Delete failed', error);

    if (error instanceof ApiError && error.status === 401) {
      return redirect('/login');
    }

    return { error: getApiErrorMessage(error, 'Unable to delete this job right now. Please try again.') };
  }
};

/** Update a job status transition such as publish or close. */
export const updateJobStatusAction = async ({ request, params }: ActionFunctionArgs) => {
  if (!params.jobId) return null;

  try {
    const formData = await request.formData();
    const status = getString(formData, 'status');

    if (status === 'Published') {
      await recruiterService.publishJob(params.jobId);
    } else if (status === 'Closed') {
      await recruiterService.closeJob(params.jobId);
    }

    return null;
  } catch (error) {
    console.error('[Recruiter] Status update failed', error);

    if (error instanceof ApiError && error.status === 401) {
      return redirect('/login');
    }

    return { error: getApiErrorMessage(error, 'Unable to update the job status right now.') };
  }
};

/** Update a candidate stage for one or more selected submissions. */
export const updateCandidateAction = async ({ request, params }: ActionFunctionArgs) => {
  try {
    const formData = await request.formData();
    const intent = getString(formData, 'intent');
    const status = getString(formData, 'status');
    const action = getString(formData, 'action');
    const payload = {
      action: action || undefined,
      status: status || undefined,
    };

    if (intent === 'stage' && params.candidateId) {
      const result = await recruiterService.updateApplicantStatuses([params.candidateId], payload);
      return { result };
    }

    if (intent === 'bulk-stage') {
      const selectedIds = getString(formData, 'selectedIds')
        .split(',')
        .map((item) => item.trim())
        .filter(Boolean);

      if (selectedIds.length > 0) {
        const result = await recruiterService.updateApplicantStatuses(selectedIds, payload);
        return { result };
      }
    }

    return null;
  } catch (error) {
    console.error('[Recruiter] Candidate stage update failed', error);
    return { error: getApiErrorMessage(error, 'Unable to update candidate stage right now.') };
  }
};

/** Create or update an interview while preventing overlapping schedules. */
export const upsertInterviewAction = async ({ request, params }: ActionFunctionArgs) => {
  try {
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
    const status = getString(formData, 'status') as InterviewStatus;
    const startMs = new Date(startsAt).getTime();
    const endMs = startMs + durationMinutes * 60 * 1000;

    const overlap = state.interviews.some((item) => {
      if (item.interviewer !== interviewer || item.status === 'Canceled' || item.id === interviewId) {
        return false;
      }

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

    state.interviews = existing
      ? state.interviews.map((item) => (item.id === interviewId ? payload : item))
      : [payload, ...state.interviews];

    if (!existing && status === 'Scheduled') {
      runAutomations(state, {
        trigger: 'interview.scheduled',
        candidateId,
        jobId,
        interviewDate: new Date(startsAt).toLocaleString(),
      });
    }

    if (existing && status === 'Scheduled') {
      runAutomations(state, {
        trigger: 'interview.rescheduled',
        candidateId,
        jobId,
        interviewDate: new Date(startsAt).toLocaleString(),
      });
    }

    saveRecruiterState(state);
    return redirect('/recruiter/interviews');
  } catch (error) {
    console.error('[Recruiter] Interview upsert failed', error);
    return { error: getApiErrorMessage(error, 'Unable to save the interview right now.') };
  }
};

/** Cancel a scheduled interview and persist the reason. */
export const cancelInterviewAction = async ({ request, params }: ActionFunctionArgs) => {
  try {
    const formData = await request.formData();
    const reason = getString(formData, 'cancelReason');
    const state = getRecruiterState();

    state.interviews = state.interviews.map((item) => (
      item.id === params.interviewId
        ? { ...item, status: 'Canceled', cancelReason: reason, updatedAt: new Date().toISOString() }
        : item
    ));

    saveRecruiterState(state);
    return null;
  } catch (error) {
    console.error('[Recruiter] Interview cancellation failed', error);
    return { error: getApiErrorMessage(error, 'Unable to cancel the interview right now.') };
  }
};

/** Create, update, toggle, or delete an automation rule. */
export const automationRuleAction = async ({ request, params }: ActionFunctionArgs) => {
  try {
    const formData = await request.formData();
    const state = getRecruiterState();
    const intent = getString(formData, 'intent');

    if (intent === 'delete') {
      state.automations = state.automations.filter((item) => item.id !== params.ruleId);
    } else if (intent === 'toggle') {
      state.automations = state.automations.map((item) => (
        item.id === params.ruleId ? { ...item, enabled: formData.get('enabled') === 'true' } : item
      ));
    } else {
      const ruleId = params.ruleId ?? createId('rule');
      const existing = state.automations.find((item) => item.id === ruleId);
      const next = {
        id: ruleId,
        name: getString(formData, 'name'),
        enabled: formData.get('enabled') === 'true',
        trigger: getString(formData, 'trigger') as
          | 'candidate.stage_changed'
          | 'interview.scheduled'
          | 'interview.rescheduled'
          | 'offer.sent',
        jobId: getString(formData, 'jobId') || undefined,
        fromStage: getString(formData, 'fromStage') as CandidateStage,
        toStage: getString(formData, 'toStage') as CandidateStage,
        subject: getString(formData, 'subject'),
        body: getString(formData, 'body'),
        lastRunAt: existing?.lastRunAt,
      };

      state.automations = existing
        ? state.automations.map((item) => (item.id === ruleId ? next : item))
        : [next, ...state.automations];
    }

    saveRecruiterState(state);
    return null;
  } catch (error) {
    console.error('[Recruiter] Automation rule update failed', error);
    return { error: getApiErrorMessage(error, 'Unable to update the automation rule right now.') };
  }
};

/** Run offer automations for the provided candidate and job context. */
export const runOfferAutomationAction = async ({ request }: ActionFunctionArgs) => {
  try {
    const formData = await request.formData();
    const state = getRecruiterState();

    runAutomations(state, {
      trigger: 'offer.sent',
      candidateId: getString(formData, 'candidateId') || undefined,
      jobId: getString(formData, 'jobId') || undefined,
    });

    saveRecruiterState(state);
    return null;
  } catch (error) {
    console.error('[Recruiter] Offer automation failed', error);
    return { error: getApiErrorMessage(error, 'Unable to run offer automations right now.') };
  }
};

/** Update recruiter scheduling and calendar connection settings. */
export const updateRecruiterSettingsAction = async ({ request }: ActionFunctionArgs) => {
  try {
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
      hoursByDay: days.reduce<Record<string, DayHours>>((acc, day) => {
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
  } catch (error) {
    console.error('[Recruiter] Settings update failed', error);
    return { error: getApiErrorMessage(error, 'Unable to update recruiter settings right now.') };
  }
};
