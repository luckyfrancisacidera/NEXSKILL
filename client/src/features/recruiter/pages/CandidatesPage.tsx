import { useMemo, useState } from "react";
import { Form, Link, useLoaderData } from "react-router-dom";

import { Card } from "@shared/components/Card";
import { Eye } from "lucide-react";
import JobFilterDropdown from "../components/JobFilterDropdown";
import SearchField from "@shared/components/SearchField";
import Dropdown, {type DropdownOption} from "@shared/components/Dropdown";

const stageTabs = [
  {
    key: "all",
    label: "All Applicants",
    badge: "bg-slate-100 text-slate-700",
  },
  {
    key: "Recommended",
    label: "Recommended",
    badge: "bg-violet-100 text-violet-700",
  },
  {
    key: "Shortlisted",
    label: "Shortlisted",
    badge: "bg-sky-100 text-sky-700",
  },
  {
    key: "Interview",
    label: "Interview",
    badge: "bg-amber-100 text-amber-700",
  },
  {
    key: "Offer",
    label: "Offer",
    badge: "bg-emerald-100 text-emerald-700",
  },
  {
    key: "Hire",
    label: "Hire",
    badge: "bg-fuchsia-100 text-fuchsia-700",
  },
] as const;

const tabsWithRecommendationFilter = new Set(["all", "Recommended"]);

type Candidate = {
  resume_submission_id: string;
  applicant_name: string;
  applicant_email: string;
  job_id: string;
  job_title: string;
  submission_status: string;
  jobseeker_stage: string;
  score: number;
  created_at_utc: string;
};

type Job = {
  id: string;
  title: string;
};

type Counts = {
  all_applicants: number;
  recommended: number;
  shortlisted: number;
  interview: number;
  offer: number;
  hire: number;
};

type Filters = {
  search: string;
  stage: string;
  jobId: string;
  recommendedTopPercent: string;
};

type LoaderData = {
  candidates: Candidate[];
  jobs: Job[];
  counts: Counts;
  recommendation: { top_percent: number };
  filters: Filters;
};

export const CandidatesPage = () => {
  const { candidates, jobs, counts, filters, recommendation } =
    useLoaderData() as LoaderData;

  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const normalizedFilters: Filters = {
    search: filters.search ?? "",
    stage: filters.stage ?? "all",
    jobId: filters.jobId ?? "all",
    recommendedTopPercent: filters.recommendedTopPercent ?? "10",
  };

  const countByStage: Record<string, number> = {
    all: counts.all_applicants,
    Recommended: counts.recommended,
    Shortlisted: counts.shortlisted,
    Interview: counts.interview,
    Offer: counts.offer,
    Hire: counts.hire,
  };

  const selectedSet = useMemo(() => new Set(selectedIds), [selectedIds]);

  const isAllChecked =
    candidates.length > 0 &&
    candidates.every((c) => selectedSet.has(c.resume_submission_id));

  const isRecommendationFilterVisible = tabsWithRecommendationFilter.has(
    normalizedFilters.stage,
  );

  const jobOptionCounts = useMemo(() => {
    const byJob = new Map<string, number>();

    candidates.forEach((candidate) => {
      byJob.set(candidate.job_id, (byJob.get(candidate.job_id) ?? 0) + 1);
    });

    return byJob;
  }, [candidates]);

  const recommendedCutoffOptions: DropdownOption[] = [5, 10, 15, 20, 25, 30].map(
    (value) => ({
      value: String(value),
      label: `Top ${value}%`,
      accentClassName: "bg-violet-100 text-violet-700",
    }),
  );

  const toggleAllRows = () => {
    if (isAllChecked) {
      setSelectedIds([]);
      return;
    }

    setSelectedIds(candidates.map((candidate) => candidate.resume_submission_id));
  };

  const toggleSingleRow = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((value) => value !== id) : [...prev, id],
    );
  };

  const showShortlist =
    normalizedFilters.stage === "all" || normalizedFilters.stage === "Recommended";
  const showRemoveAndInterview = normalizedFilters.stage === "Shortlisted";
  const showRemoveAndOffer = normalizedFilters.stage === "Interview";

  return (
    <Card>
      <div className="mb-3">
        <h2 className="text-xl font-semibold text-zinc-900">Candidates</h2>
        <p className="mt-1 text-sm text-zinc-500">
          Review applications, filter by hiring stage, and move candidates forward.
        </p>
      </div>

      <div className="mb-0 border-b border-zinc-200">
        <div className="flex min-w-max gap-2 overflow-x-auto">
          {stageTabs.map((tab) => {
            const isActive = normalizedFilters.stage === tab.key;

            return (
              <Link
                key={tab.key}
                to={`?search=${encodeURIComponent(normalizedFilters.search)}&jobId=${encodeURIComponent(
                  normalizedFilters.jobId,
                )}&recommendedTopPercent=${encodeURIComponent(
                  normalizedFilters.recommendedTopPercent,
                )}&stage=${encodeURIComponent(tab.key)}`}
                className={`relative -mb-px inline-flex items-center gap-2 rounded-t-xl border px-4 py-2.5 text-sm font-medium transition ${
                  isActive
                    ? "border-zinc-200 border-b-white bg-white text-zinc-900 shadow-sm"
                    : "border-zinc-200 bg-zinc-50 text-zinc-500 hover:bg-zinc-100"
                }`}
              >
                <span>{tab.label}</span>
                <span
                  className={`flex h-6 min-w-6 items-center justify-center rounded-full px-2 text-xs font-semibold ${
                    isActive ? tab.badge : "bg-zinc-200 text-zinc-600"
                  }`}
                >
                  {countByStage[tab.key] ?? 0}
                </span>
              </Link>
            );
          })}
        </div>
      </div>

      <Form method="get" className="mb-5 mt-4 flex flex-wrap items-end gap-3">
        <SearchField
          label="Search"
          name="search"
          defaultValue={normalizedFilters.search}
          placeholder="Search name or email"
          className="min-w-65 flex-1"
        />

        <JobFilterDropdown
          jobs={jobs}
          filters={normalizedFilters}
          counts={counts}
          jobOptionCounts={jobOptionCounts}
        />

        {isRecommendationFilterVisible ? (
          <Dropdown
            label="Recommended Cutoff"
            name="recommendedTopPercent"
            value={normalizedFilters.recommendedTopPercent}
            options={recommendedCutoffOptions}
            className="min-w-6"
            buttonClassName="min-w-[240px]"
          />
        ) : (
          <input
            type="hidden"
            name="recommendedTopPercent"
            value={normalizedFilters.recommendedTopPercent}
          />
        )}

        <input type="hidden" name="stage" value={normalizedFilters.stage} />

        <button
          className="h-11 rounded-xl bg-zinc-900 px-5 text-sm font-medium text-white shadow-sm transition hover:bg-zinc-800"
          type="submit"
        >
          Apply
        </button>
      </Form>

      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <p className="text-xs text-zinc-500">
          ATS auto-recommends top {recommendation.top_percent}% by score. Selected:{" "}
          {selectedIds.length}
        </p>

        <div className="flex flex-wrap items-center gap-2">
          {showShortlist ? (
            <button
              type="button"
              disabled={selectedIds.length === 0}
              className="rounded-xl bg-zinc-900 px-3.5 py-2 text-sm text-white shadow-sm disabled:cursor-not-allowed disabled:bg-zinc-300"
            >
              Shortlist
            </button>
          ) : null}

          {showRemoveAndInterview ? (
            <>
              <button
                type="button"
                disabled={selectedIds.length === 0}
                className="rounded-xl bg-rose-600 px-3.5 py-2 text-sm text-white shadow-sm transition hover:bg-rose-700 disabled:cursor-not-allowed disabled:bg-rose-200"
              >
                Remove
              </button>
              <button
                type="button"
                disabled={selectedIds.length === 0}
                className="rounded-xl bg-zinc-900 px-3.5 py-2 text-sm text-white shadow-sm disabled:cursor-not-allowed disabled:bg-zinc-300"
              >
                Set Interview
              </button>
            </>
          ) : null}

          {showRemoveAndOffer ? (
            <>
              <button
                type="button"
                disabled={selectedIds.length === 0}
                className="rounded-xl bg-rose-600 px-3.5 py-2 text-sm text-white shadow-sm transition hover:bg-rose-700 disabled:cursor-not-allowed disabled:bg-rose-200"
              >
                Remove
              </button>
              <button
                type="button"
                disabled={selectedIds.length === 0}
                className="rounded-xl bg-zinc-900 px-3.5 py-2 text-sm text-white shadow-sm disabled:cursor-not-allowed disabled:bg-zinc-300"
              >
                Give Offer
              </button>
            </>
          ) : null}
        </div>
      </div>

      <div className="overflow-x-auto rounded-2xl border border-zinc-200">
        <table className="min-w-full text-sm">
          <thead className="bg-zinc-100 text-zinc-700">
            <tr>
              <th className="w-12 px-3 py-3 text-left">
                <input
                  type="checkbox"
                  aria-label="select all candidates"
                  checked={isAllChecked}
                  onChange={toggleAllRows}
                  className="h-4 w-4 rounded border-zinc-400"
                />
              </th>
              {["Name", "Email", "Job", "Status", "Score", "Applied", "Actions"].map(
                (col) => (
                  <th key={col} className="px-3 py-3 text-left font-semibold">
                    {col}
                  </th>
                ),
              )}
            </tr>
          </thead>
          <tbody>
            {candidates.map((candidate, idx) => (
              <tr
                key={candidate.resume_submission_id}
                className={`border-t border-zinc-100 ${
                  idx % 2 ? "bg-zinc-50/60" : "bg-white"
                }`}
              >
                <td className="px-3 py-3">
                  <input
                    type="checkbox"
                    aria-label={`select ${candidate.applicant_name}`}
                    checked={selectedSet.has(candidate.resume_submission_id)}
                    onChange={() => toggleSingleRow(candidate.resume_submission_id)}
                    className="h-4 w-4 rounded border-zinc-400"
                  />
                </td>
                <td className="px-3 py-3 font-medium text-zinc-900">
                  {candidate.applicant_name}
                </td>
                <td className="px-3 py-3 text-zinc-700">
                  {candidate.applicant_email}
                </td>
                <td className="px-3 py-3 text-zinc-700">{candidate.job_title}</td>
                <td className="px-3 py-3">
                  <span className="rounded-full bg-zinc-200 px-2.5 py-1 text-xs font-medium text-zinc-700">
                    {candidate.submission_status}
                  </span>
                </td>
                <td className="px-3 py-3 font-semibold text-zinc-900">
                  {candidate.score}
                </td>
                <td className="px-3 py-3 text-zinc-700">
                  {new Date(candidate.created_at_utc).toLocaleDateString()}
                </td>
                <td className="px-3 py-3">
                  <Link
                    to={`/recruiter/candidates/${candidate.resume_submission_id}`}
                    className="inline-flex items-center gap-1 rounded-lg border border-zinc-300 px-2.5 py-1.5 text-zinc-700 transition hover:bg-zinc-100"
                    title="View profile"
                  >
                    <Eye size={16} />
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
};