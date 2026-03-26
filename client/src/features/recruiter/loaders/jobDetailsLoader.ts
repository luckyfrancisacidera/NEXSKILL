import type { LoaderFunctionArgs } from "react-router-dom";
import { recruiterService } from "@features/recruiter/service/recruiter.service";
import type { ApplicantScoreItemDto, JobApplicantListItem, JobTrendPoint } from "@features/recruiter/types";
import { rethrowAsRouteError } from "@features/recruiter/loaders/utils";

const DAY_LABEL_FORMATTER = new Intl.DateTimeFormat(undefined, {
  month: 'short',
  day: 'numeric',
});

const aggregateTrend = (items: ApplicantScoreItemDto[]): JobTrendPoint[] => {
  const counts = new Map<string, { date: Date; applications: number }>();

  items.forEach((item) => {
    const parsedDate = new Date(item.created_at_utc);
    if (Number.isNaN(parsedDate.getTime())) {
      return;
    }

    const key = parsedDate.toISOString().slice(0, 10);
    const current = counts.get(key);

    if (current) {
      current.applications += 1;
      return;
    }

    counts.set(key, {
      date: new Date(parsedDate.getFullYear(), parsedDate.getMonth(), parsedDate.getDate()),
      applications: 1,
    });
  });

  return [...counts.values()]
    .sort((left, right) => left.date.getTime() - right.date.getTime())
    .map((item) => ({
      day: DAY_LABEL_FORMATTER.format(item.date),
      applications: item.applications,
    }));
};

const toApplicants = (items: ApplicantScoreItemDto[]): JobApplicantListItem[] =>
  items.map((item) => ({
    id: item.resume_submission_id,
    name: item.applicant_name,
    stage: item.submission_status,
  }));

export const recruiterJobDetailLoader = async ({
  params,
}: LoaderFunctionArgs) => {
  try {
    if (!params.jobId) {
      throw new Response("Job not found", { status: 404 });
    }

    const job = await recruiterService.getRecruiterJob(params.jobId);
    const firstPage = await recruiterService.getApplicantScores({
      jobId: params.jobId,
      pageNumber: 1,
      pageSize: 100,
    });

    const remainingPages = Array.from(
      { length: Math.max(0, firstPage.total_pages - 1) },
      (_, index) => index + 2,
    );

    const remainingResponses = remainingPages.length
      ? await Promise.all(
          remainingPages.map((pageNumber) =>
            recruiterService.getApplicantScores({
              jobId: params.jobId,
              pageNumber,
              pageSize: firstPage.page_size,
            }),
          ),
        )
      : [];

    const applicantItems = [firstPage, ...remainingResponses].flatMap((response) => response.items);

    return {
      job,
      applicants: toApplicants(applicantItems),
      trend: aggregateTrend(applicantItems),
    };
  } catch (error) {
    rethrowAsRouteError(error, "Unable to load job details.");
  }
};
