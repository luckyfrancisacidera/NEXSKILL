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

export const jobseekerInterviewService = {
  async getJobseekerInterviews(): Promise<JobseekerInterview[]> {
    const response = await http.get<JobseekerInterviewDto[]>("/api/jobseeker/interviews");
    return response.data.map(mapInterview);
  },

  async getArchivedJobseekerInterviews(): Promise<JobseekerInterview[]> {
    const response = await http.get<JobseekerInterviewDto[]>("/api/jobseeker/interviews/archived");
    return response.data.map(mapInterview);
  },

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

  async acceptInterview(interviewId: string): Promise<JobseekerInterview> {
    const response = await http.post<JobseekerInterviewDto>(
      `/api/jobseeker/interviews/${interviewId}/accept`,
      {},
    );
    return mapInterview(response.data);
  },

  async declineInterview(interviewId: string): Promise<JobseekerInterview> {
    const response = await http.post<JobseekerInterviewDto>(
      `/api/jobseeker/interviews/${interviewId}/decline`,
      {},
    );
    return mapInterview(response.data);
  },

  async requestReschedule(
    interviewId: string,
    message: string,
    attachment?: File,
  ): Promise<JobseekerInterview> {
    const formData = new FormData();
    formData.append("message", sanitizeRichText(message));
    if (attachment) {
      formData.append("attachment", attachment);
    }

    const response = await http.post<JobseekerInterviewDto>(
      `/api/jobseeker/interviews/${interviewId}/request-reschedule`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      },
    );

    return mapInterview(response.data);
  },

  async archiveInterview(interviewId: string): Promise<JobseekerInterview> {
    const response = await http.post<JobseekerInterviewDto>(
      `/api/jobseeker/interviews/${interviewId}/archive`,
      {},
    );
    return mapInterview(response.data);
  },

  async unarchiveInterview(interviewId: string): Promise<JobseekerInterview> {
    const response = await http.post<JobseekerInterviewDto>(
      `/api/jobseeker/interviews/${interviewId}/unarchive`,
      {},
    );
    return mapInterview(response.data);
  },
};
