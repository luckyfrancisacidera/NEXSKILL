export type InterviewStatus = 'Scheduled' | 'Completed' | 'Canceled';

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
