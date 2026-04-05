import { http } from "@shared/api/http";
import type {
  JobseekerArchivedInterviewsLoaderData,
  JobseekerArchivedInterviewsQueryParams,
  JobseekerInterview,
} from "@features/jobseeker/types/interview.types";
import { sanitizeRichText } from "@shared/utils/richText";

interface JobseekerInterviewDto {
  id: string;
  recruiterId: string;
  jobSeekerId: string;
  jobTitle?: string | null;
  scheduledDateTimeUtc: string;
  locationOrMeetingLink: string;
  message?: string | null;
  status: JobseekerInterview["status"];
  cancelReason?: string | null;
  isArchived?: boolean;
  archivedAtUtc?: string | null;
  recruiterName?: string | null;
  recruiterEmail?: string | null;
  companyName?: string | null;
}

// Maps the jobseeker interview API payload into the UI model used across interview pages.
const mapInterview = (dto: JobseekerInterviewDto): JobseekerInterview => {
  const value = dto.locationOrMeetingLink?.trim() ?? "";
  const looksLikeLink = /^https?:\/\//i.test(value);

  return {
    id: dto.id,
    recruiterId: dto.recruiterId,
    jobseekerId: dto.jobSeekerId,
    jobTitle: dto.jobTitle ?? undefined,
    scheduledDate: dto.scheduledDateTimeUtc,
    meetingLink: looksLikeLink ? value : undefined,
    location: !looksLikeLink && value ? value : undefined,
    message: dto.message ?? undefined,
    status: dto.status,
    cancelReason: dto.cancelReason ?? undefined,
    isArchived: dto.isArchived ?? false,
    archivedAt: dto.archivedAtUtc ?? undefined,
    recruiterName: dto.recruiterName ?? undefined,
    recruiterEmail: dto.recruiterEmail ?? undefined,
    companyName: dto.companyName ?? undefined,
  };
};

// Handles jobseeker interview reads and mutations against the interview endpoints.
export const jobseekerInterviewService = {
  // Use to load the active interview list shown on jobseeker interview pages.
  async getJobseekerInterviews(): Promise<JobseekerInterview[]> {
    const response = await http.get<JobseekerInterviewDto[]>("/api/jobseeker/interviews");
    return response.data.map(mapInterview);
  },

  // Use to fetch every archived interview when a screen needs the full archived collection.
  async getArchivedJobseekerInterviews(): Promise<JobseekerInterview[]> {
    const response = await http.get<JobseekerInterviewDto[]>("/api/jobseeker/interviews/archived");
    return response.data.map(mapInterview);
  },

  // Use to load the archived interview table with pagination and current route filters.
  async getArchivedJobseekerInterviewsPage(
    params: JobseekerArchivedInterviewsQueryParams,
  ): Promise<JobseekerArchivedInterviewsLoaderData> {
    const response = await http.get<{
      items: JobseekerInterviewDto[];
      pageNumber: number;
      pageSize: number;
      totalCount: number;
      totalPages: number;
    }>("/api/jobseeker/interviews/archived", {
      params: {
        pageNumber: params.pageNumber,
        pageSize: params.pageSize,
        search: params.search,
        status: params.status,
      },
    });

    return {
      ...response.data,
      items: response.data.items.map(mapInterview),
    };
  },

  // Handles the jobseeker action for accepting a scheduled interview invitation.
  async acceptInterview(interviewId: string): Promise<JobseekerInterview> {
    const response = await http.post<JobseekerInterviewDto>(
      `/api/jobseeker/interviews/${interviewId}/accept`,
      {},
    );
    return mapInterview(response.data);
  },

  // Handles the jobseeker action for declining a scheduled interview invitation.
  async declineInterview(interviewId: string): Promise<JobseekerInterview> {
    const response = await http.post<JobseekerInterviewDto>(
      `/api/jobseeker/interviews/${interviewId}/decline`,
      {},
    );
    return mapInterview(response.data);
  },

  // Handles a jobseeker reschedule request and sanitizes the message before it reaches the API.
  async requestReschedule(
    interviewId: string,
    message: string,
  ): Promise<JobseekerInterview> {
    const response = await http.post<JobseekerInterviewDto>(
      `/api/jobseeker/interviews/${interviewId}/request-reschedule`,
      { message: sanitizeRichText(message) },
    );

    return mapInterview(response.data);
  },

  // Handles archiving an interview so it moves out of the active interview workflow.
  async archiveInterview(interviewId: string): Promise<JobseekerInterview> {
    const response = await http.post<JobseekerInterviewDto>(
      `/api/jobseeker/interviews/${interviewId}/archive`,
      {},
    );
    return mapInterview(response.data);
  },

  // Handles restoring an archived interview back into the active interview workflow.
  async unarchiveInterview(interviewId: string): Promise<JobseekerInterview> {
    const response = await http.post<JobseekerInterviewDto>(
      `/api/jobseeker/interviews/${interviewId}/unarchive`,
      {},
    );
    return mapInterview(response.data);
  },
};
