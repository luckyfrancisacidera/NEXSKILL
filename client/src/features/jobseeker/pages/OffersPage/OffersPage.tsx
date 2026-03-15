import { useEffect, useMemo, useState } from "react";
import { useLoaderData } from "react-router-dom";
import { Sparkles } from "lucide-react";

import { useApplications } from "@features/jobseeker/hooks";
import { jobseekerInterviewService } from "@features/jobseeker/services/interview.service";
import type {
  ApplicationsLoaderData,
  JobseekerApplicationDto,
  JobseekerInterview,
} from "@features/jobseeker/types";
import { Card } from "@shared/components/Card";

import {
  OfferPipelineCard,
  type OfferPipelineCardData,
} from "./components/OfferPipelineCard";

const normalizeText = (value?: string | null) => value?.trim().toLowerCase() ?? "";

const needsLegacyEnrichment = (item: JobseekerApplicationDto) =>
  !item.company_name?.trim() || !item.recruiter_name?.trim();

const findInterviewMatch = (
  application: JobseekerApplicationDto,
  interviews: JobseekerInterview[],
) => {
  const recruiterEmail = normalizeText(application.recruiter_email);
  const companyName = normalizeText(application.company_name ?? application.company);

  return interviews.find((interview) => {
    if (recruiterEmail && normalizeText(interview.recruiterEmail) === recruiterEmail) {
      return true;
    }

    if (companyName && normalizeText(interview.companyName) === companyName) {
      return true;
    }

    return false;
  });
};

const buildOfferPipelineCard = (
  item: JobseekerApplicationDto,
  interviews: JobseekerInterview[],
): OfferPipelineCardData => {
  const fallbackInterview = needsLegacyEnrichment(item)
    ? findInterviewMatch(item, interviews)
    : undefined;

  const companyName =
    item.company_name?.trim() ||
    item.company?.trim() ||
    fallbackInterview?.companyName?.trim() ||
    "Company details unavailable";

  const recruiterName =
    item.recruiter_name?.trim() ||
    fallbackInterview?.recruiterName?.trim() ||
    item.recruiter_email?.trim() ||
    fallbackInterview?.recruiterEmail?.trim() ||
    "Recruiter details unavailable";

  const recruiterEmail =
    item.recruiter_email?.trim() || fallbackInterview?.recruiterEmail?.trim() || undefined;

  return {
    id: item.id,
    jobTitle: item.job_title,
    companyName,
    recruiterName,
    recruiterEmail,
    createdAtUtc: item.created_at_utc,
    currentStage: item.current_stage ?? item.status,
    hasOffer:
      item.has_offer ?? ((item.current_stage === "Offer") || (item.current_stage === "Hire")),
    isHired: item.is_hired ?? (item.current_stage === "Hire"),
    offeredAtUtc: item.offered_at_utc,
    hiredAtUtc: item.hired_at_utc,
    legacyHint:
      fallbackInterview && needsLegacyEnrichment(item)
        ? "This application still relies on interview data for a missing recruiter or company field."
        : null,
  };
};

export const OffersPage = () => {
  const initialData = useLoaderData() as ApplicationsLoaderData;
  const { data } = useApplications({
    initialData,
    search: "",
    status: "",
  });
  const [legacyInterviews, setLegacyInterviews] = useState<JobseekerInterview[]>([]);
  const [interviewError, setInterviewError] = useState<string | null>(null);

  const requiresLegacyFallback = useMemo(
    () => data.items.some(needsLegacyEnrichment),
    [data.items],
  );

  useEffect(() => {
    if (!requiresLegacyFallback) {
      setLegacyInterviews([]);
      setInterviewError(null);
      return;
    }

    let cancelled = false;

    const loadInterviews = async () => {
      try {
        const response = await jobseekerInterviewService.getJobseekerInterviews();
        if (!cancelled) {
          setLegacyInterviews(response);
          setInterviewError(null);
        }
      } catch (error) {
        if (!cancelled) {
          setInterviewError(
            error instanceof Error
              ? error.message
              : "Unable to load legacy recruiter details right now.",
          );
        }
      }
    };

    void loadInterviews();

    return () => {
      cancelled = true;
    };
  }, [requiresLegacyFallback]);

  const offerCards = useMemo(() => {
    return data.items
      .filter((item) => !["Rejected", "Withdrawn"].includes(item.current_stage ?? item.status))
      .map((item) => buildOfferPipelineCard(item, legacyInterviews))
      .sort(
        (left, right) =>
          new Date(right.createdAtUtc).getTime() - new Date(left.createdAtUtc).getTime(),
      );
  }, [data.items, legacyInterviews]);

  return (
    <div className="space-y-6">
      <Card className="overflow-hidden rounded-[28px] border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 p-0 shadow-sm\">
        <div className="bg-[radial-gradient(circle_at_top_right,_rgba(161,161,170,0.18),_transparent_35%),linear-gradient(135deg,#18181b_0%,#3f3f46_100%)] px-6 py-7 text-white md:px-8">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="max-w-2xl">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-zinc-300">
                Offers and hiring
              </p>
              <h1 className="mt-2 text-2xl font-semibold md:text-3xl">
                Track every application from first submission to final hire.
              </h1>
              <p className="mt-3 text-sm leading-6 text-zinc-200 md:text-base">
                Your application records now drive the timeline directly, including explicit offer and hire stages.
              </p>
            </div>
            <div className="rounded-2xl border border-white/15 bg-white/10 px-4 py-3 backdrop-blur-sm">
              <p className="text-xs uppercase tracking-[0.22em] text-zinc-300">Active pipelines</p>
              <p className="mt-2 text-3xl font-semibold">{offerCards.length}</p>
            </div>
          </div>
        </div>
      </Card>

      {requiresLegacyFallback && interviewError ? (
        <Card className="rounded-2xl border border-amber-200 bg-amber-50 px-5 py-4 text-sm text-amber-800 shadow-sm">
          Some legacy applications are still missing recruiter or company fields, and fallback interview enrichment is temporarily unavailable.
        </Card>
      ) : null}

      {offerCards.length === 0 ? (
        <Card className="rounded-2xl border border-dashed border-zinc-300 bg-white px-6 py-12 text-center shadow-sm">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-zinc-100 text-zinc-500">
            <Sparkles className="h-6 w-6" />
          </div>
          <h2 className="mt-4 text-lg font-semibold text-zinc-900">No active offer pipelines yet</h2>
          <p className="mt-2 text-sm text-zinc-500">
            Your active applications will appear here once they move through the hiring process.
          </p>
        </Card>
      ) : (
        <div className="space-y-4">
          {offerCards.map((item) => (
            <OfferPipelineCard key={item.id} item={item} />
          ))}
        </div>
      )}
    </div>
  );
};
