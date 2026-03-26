import { useEffect, useMemo, useState } from "react";
import { useLoaderData } from "react-router-dom";
import { Search, Sparkles } from "lucide-react";

import { useToast } from "@app/providers/ToastProvider";
import { useApplications } from "@features/jobseeker/hooks";
import { ApplicationsPagination } from "@features/jobseeker/pages/ApplicationsPage/components/ApplicationsPagination";
import { jobseekerInterviewService } from "@features/jobseeker/services/interview.service";
import { jobseekerService } from "@features/jobseeker/service/jobseeker.service";
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

const statusOptions = [
  { value: "", label: "All stages" },
  { value: "Applied", label: "Applied" },
  { value: "Under Review", label: "Under Review" },
  { value: "Shortlisted", label: "Shortlisted" },
  { value: "Interview", label: "Interview" },
  { value: "Offer", label: "Offer" },
  { value: "Hired", label: "Hired" },
  { value: "Rejected", label: "Rejected" },
  { value: "Withdrawn", label: "Withdrawn" },
] as const;

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

  const currentStage = item.current_stage ?? item.status;
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

  return {
    id: item.id,
    jobId: item.job_id,
    jobTitle: item.job_title,
    companyName,
    recruiterName,
    recruiterEmail:
      item.recruiter_email?.trim() || fallbackInterview?.recruiterEmail?.trim() || undefined,
    createdAtUtc: item.created_at_utc,
    updatedAtUtc: item.updated_at_utc,
    currentStage,
    hasOffer:
      item.has_offer ?? (currentStage === "Offer" || currentStage === "Hired"),
    isHired: item.is_hired ?? currentStage === "Hired",
    offeredAtUtc: item.offered_at_utc,
    hiredAtUtc: item.hired_at_utc,
    legacyHint:
      fallbackInterview && needsLegacyEnrichment(item)
        ? "This application still relies on interview data for a missing recruiter or company field."
        : null,
    offer: item.offer,
  };
};

export const OffersPage = () => {
  const initialData = useLoaderData() as ApplicationsLoaderData;
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [pageNumber, setPageNumber] = useState(initialData.pageNumber);
  const [pageSize, setPageSize] = useState(initialData.pageSize);
  const { data, error, isLoading, refresh, deleteHistory, deletingHistoryId } = useApplications({
    initialData,
    pageNumber,
    pageSize,
    search,
    status,
  });
  const [legacyInterviews, setLegacyInterviews] = useState<JobseekerInterview[]>([]);
  const [interviewError, setInterviewError] = useState<string | null>(null);
  const [actingApplicationId, setActingApplicationId] = useState<string | null>(null);
  const { showToast } = useToast();

  useEffect(() => {
    setPageNumber(data.pageNumber);
  }, [data.pageNumber]);

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
      } catch (nextError) {
        if (!cancelled) {
          setInterviewError(
            nextError instanceof Error
              ? nextError.message
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

  const cards = useMemo(
    () =>
      data.items.map((item) => buildOfferPipelineCard(item, legacyInterviews)),
    [data.items, legacyInterviews],
  );

  const stageSummary = useMemo(() => {
    return cards.reduce<Record<string, number>>((accumulator, item) => {
      accumulator[item.currentStage] = (accumulator[item.currentStage] ?? 0) + 1;
      return accumulator;
    }, {});
  }, [cards]);

  const respondToOffer = async (applicationId: string, action: "accept" | "decline") => {
    setActingApplicationId(applicationId);

    try {
      if (action === "accept") {
        await jobseekerService.acceptOffer(applicationId);
        showToast({
          title: "Offer accepted",
          description: "Your response was saved and the recruiter has been notified.",
          tone: "success",
        });
      } else {
        await jobseekerService.declineOffer(applicationId);
        showToast({
          title: "Offer declined",
          description: "Your response was saved and the recruiter has been notified.",
          tone: "info",
        });
      }

      await refresh();
    } catch (nextError) {
      showToast({
        title: "Unable to update offer",
        description: nextError instanceof Error ? nextError.message : "Please try again.",
        tone: "error",
      });
    } finally {
      setActingApplicationId(null);
    }
  };

  return (
    <div className="space-y-4">
        <div className="bg-[radial-gradient(circle_at_top_right,rgba(82,82,91,0.18),transparent_35%),linear-gradient(135deg,#18181b_0%,#3f3f46_100%)] px-5 py-5 text-white md:px-6 md:py-6 rounded-2xl">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="max-w-2xl">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-zinc-300">
                Application tracking
              </p>
              <h1 className="mt-2 text-xl font-semibold md:text-2xl">
                Follow every submission from applied to final outcome.
              </h1>
              <p className="mt-2 text-sm leading-6 text-zinc-200">
                This view now uses your application records directly, so early and late stages stay visible in one compact timeline.
              </p>
            </div>

            <div className="grid min-w-55 gap-2 sm:grid-cols-2">
              <div className="rounded-2xl border border-white/15 bg-white/10 px-3.5 py-3 backdrop-blur-sm">
                <p className="text-xs uppercase tracking-[0.22em] text-zinc-300">Tracked</p>
                <p className="mt-1.5 text-2xl font-semibold">{data.totalCount}</p>
              </div>
              <div className="rounded-2xl border border-white/15 bg-white/10 px-3.5 py-3 backdrop-blur-sm">
                <p className="text-xs uppercase tracking-[0.22em] text-zinc-300">Offers</p>
                <p className="mt-1.5 text-2xl font-semibold">{stageSummary.Offer ?? 0}</p>
              </div>
            </div>
          </div>
        </div>

      <Card className="rounded-3xl border border-zinc-200 bg-white p-3 shadow-sm dark:border-zinc-800 dark:bg-zinc-950 md:p-4">
        <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_220px_180px]">
          <div>
            <label className="mb-1.5 block text-xs font-medium uppercase tracking-[0.08em] text-zinc-500 dark:text-zinc-400">
              Search
            </label>
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
              <input
                value={search}
                onChange={(event) => {
                  setSearch(event.target.value);
                  setPageNumber(1);
                }}
                placeholder="Search by role or company"
                className="h-11 w-full rounded-2xl border border-zinc-200 bg-white pl-9 pr-3.5 text-sm text-zinc-700 outline-none transition placeholder:text-zinc-400 hover:border-zinc-300 focus:border-zinc-500 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-100"
              />
            </div>
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-medium uppercase tracking-[0.08em] text-zinc-500 dark:text-zinc-400">
              Stage
            </label>
            <select
              value={status}
              onChange={(event) => {
                setStatus(event.target.value);
                setPageNumber(1);
              }}
              className="h-11 w-full rounded-2xl border border-zinc-200 bg-white px-3.5 text-sm text-zinc-700 outline-none transition hover:border-zinc-300 focus:border-zinc-500 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-100"
            >
              {statusOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-medium uppercase tracking-[0.08em] text-zinc-500 dark:text-zinc-400">
              Page size
            </label>
            <select
              value={pageSize}
              onChange={(event) => {
                setPageSize(Number(event.target.value));
                setPageNumber(1);
              }}
              className="h-11 w-full rounded-2xl border border-zinc-200 bg-white px-3.5 text-sm text-zinc-700 outline-none transition hover:border-zinc-300 focus:border-zinc-500 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-100"
            >
              {[5, 10, 20].map((option) => (
                <option key={option} value={option}>
                  {option} per page
                </option>
              ))}
            </select>
          </div>
        </div>
      </Card>

      {requiresLegacyFallback && interviewError ? (
        <Card className="rounded-2xl border border-amber-200 bg-amber-50 px-5 py-4 text-sm text-amber-800 shadow-sm dark:border-amber-900/60 dark:bg-amber-950/40 dark:text-amber-200">
          Some legacy applications are still missing recruiter or company fields, and fallback interview enrichment is temporarily unavailable.
        </Card>
      ) : null}

      {error ? (
        <Card className="rounded-2xl border border-rose-200 bg-rose-50 px-5 py-4 text-sm text-rose-700 shadow-sm dark:border-rose-900/60 dark:bg-rose-950/40 dark:text-rose-200">
          {error}
        </Card>
      ) : null}

      {isLoading && cards.length === 0 ? (
        <div className="space-y-2.5">
          {[...Array(3)].map((_, index) => (
            <Card
              key={index}
              className="h-40 animate-pulse rounded-3xl border border-zinc-200 bg-zinc-100 dark:border-zinc-800 dark:bg-zinc-900"
            />
          ))}
        </div>
      ) : cards.length === 0 ? (
        <Card className="rounded-2xl border border-dashed border-zinc-300 bg-white px-6 py-12 text-center shadow-sm dark:border-zinc-700 dark:bg-zinc-900">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-zinc-100 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-300">
            <Sparkles className="h-6 w-6" />
          </div>
          <h2 className="mt-4 text-lg font-semibold text-zinc-900 dark:text-zinc-100">
            No tracked applications found
          </h2>
          <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
            Try a different search or stage filter, or submit a new application to see it here.
          </p>
        </Card>
      ) : (
        <>
          <div className="space-y-2.5">
            {cards.map((item) => (
              <OfferPipelineCard
                key={item.id}
                item={item}
                onAccept={(applicationId) => {
                  void respondToOffer(applicationId, "accept");
                }}
                onDecline={(applicationId) => {
                  void respondToOffer(applicationId, "decline");
                }}
                onDeleteHistory={(applicationId) => {
                  void deleteHistory(applicationId);
                }}
                isActing={actingApplicationId === item.id}
                isDeletingHistory={deletingHistoryId === item.id}
              />
            ))}
          </div>

          <ApplicationsPagination
            pageNumber={data.pageNumber}
            pageSize={data.pageSize}
            totalCount={data.totalCount}
            totalPages={data.totalPages}
            onPageChange={setPageNumber}
            onPageSizeChange={(value) => {
              setPageSize(value);
              setPageNumber(1);
            }}
          />
        </>
      )}
    </div>
  );
};
