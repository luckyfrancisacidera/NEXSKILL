import { http } from "@shared/api/http";

export type CalendarDownloadRole = "recruiter" | "jobseeker";

const interviewCalendarEndpoints: Record<CalendarDownloadRole, (interviewId: string) => string> = {
  recruiter: (interviewId) => `/api/recruiter/interviews/${interviewId}/ics`,
  jobseeker: (interviewId) => `/api/jobseeker/interviews/${interviewId}/ics`,
};

const resolveDownloadFileName = (
  interviewId: string,
  contentDisposition?: string,
) => {
  const match = contentDisposition?.match(/filename\*?=(?:UTF-8''|")?([^";]+)/i);
  if (!match?.[1]) {
    return `interview-${interviewId}.ics`;
  }

  return decodeURIComponent(match[1].replace(/"/g, "")).trim();
};

export const downloadInterviewICS = async (
  interviewId: string,
  role: CalendarDownloadRole,
) => {
  const response = await http.get<Blob>(interviewCalendarEndpoints[role](interviewId), {
    responseType: "blob",
  });

  const blob = new Blob([response.data], { type: "text/calendar" });
  const downloadUrl = window.URL.createObjectURL(blob);
  const anchor = document.createElement("a");

  anchor.href = downloadUrl;
  anchor.download = resolveDownloadFileName(
    interviewId,
    typeof response.headers["content-disposition"] === "string"
      ? response.headers["content-disposition"]
      : undefined,
  );

  document.body.appendChild(anchor);
  try {
    anchor.click();
  } finally {
    document.body.removeChild(anchor);
    window.URL.revokeObjectURL(downloadUrl);
  }
};
