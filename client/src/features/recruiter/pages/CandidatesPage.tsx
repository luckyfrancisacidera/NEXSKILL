import { useEffect, useMemo, useRef, useState } from "react";
import { Form, Link, useFetcher, useLoaderData, useSubmit } from "react-router-dom";

import { useToast } from "@app/providers/ToastProvider";
import type { BulkApplicantStageResponseDto } from "@features/recruiter/service/recruiter.service";

import { Card } from "@shared/components/Card";
import { ConfirmationModal } from "@shared/components/ConfirmationModal";
import { Eye } from "lucide-react";
import JobFilterDropdown from "../components/JobFilterDropdown";
import SearchField from "@shared/components/SearchField";
import Dropdown, { type DropdownOption } from "@shared/components/Dropdown";

const stageTabs = [
  { key: "all", label: "All Applicants", badge: "bg-slate-100 text-slate-700" },
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
  { key: "Offer", label: "Offer", badge: "bg-emerald-100 text-emerald-700" },
  { key: "Hire", label: "Hire", badge: "bg-fuchsia-100 text-fuchsia-700" },
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
  department: string;
  all_applicants: number;
  recommended: number;
  shortlisted: number;
  interview: number;
  offer: number;
  hire: number;
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
  department: string;
  recommendedTopPercent: string;
  pageSize: string;
};

type LoaderData = {
  candidates: Candidate[];
  jobs: Job[];
  departments: string[];
  counts: Counts;
  recommendation: { top_percent: number };
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
  filters: Filters;
};

type CandidateBulkAction = {
  action: string;
  status?: string;
  label: string;
  title: string;
  message: string;
  accent: "red" | "green" | "violet";
  eligibleIds?: string[];
  skippedCount?: number;
};

export const CandidatesPage = () => {
  const {
    candidates,
    jobs,
    departments,
    counts,
    filters,
    recommendation,
    pagination,
  } = useLoaderData() as LoaderData;
  const fetcher = useFetcher();
  const submit = useSubmit();
  const { showToast } = useToast();
  const filterFormRef = useRef<HTMLFormElement | null>(null);

  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [pendingAction, setPendingAction] = useState<CandidateBulkAction | null>(null);

  const normalizedFilters: Filters = {
    search: filters.search ?? "",
    stage: filters.stage ?? "all",
    jobId: filters.jobId ?? "all",
    department: filters.department ?? "all",
    recommendedTopPercent: filters.recommendedTopPercent ?? "10",
    pageSize: filters.pageSize ?? "10",
  };

  const countByStage: Record<string, number> = {
    all: counts.all_applicants,
    Recommended: counts.recommended,
    Shortlisted: counts.shortlisted,
    Interview: counts.interview,
    Offer: counts.offer,
    Hire: counts.hire,
  };

  const candidateIdsOnPage = useMemo(
    () =>
      new Set(candidates.map((candidate) => candidate.resume_submission_id)),
    [candidates],
  );

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setSelectedIds((prev) => prev.filter((id) => candidateIdsOnPage.has(id)));
  }, [candidateIdsOnPage]);

  useEffect(() => {
    if (fetcher.state === "idle") {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setPendingAction(null);
    }
  }, [fetcher.state]);

  useEffect(() => {
    if (fetcher.state !== "idle" || !fetcher.data) return;

    const payload = fetcher.data as { error?: string; result?: BulkApplicantStageResponseDto };

    if (payload.error) {
      showToast({ title: "Action failed", description: payload.error, tone: "error" });
      return;
    }

    if (!payload.result) return;

    const { success_count, failure_count } = payload.result;
    if (failure_count > 0 && success_count > 0) {
      showToast({
        title: "Bulk action partially completed",
        description: `${success_count} candidate(s) updated, ${failure_count} skipped.`,
        tone: "info",
      });
      return;
    }

    if (failure_count > 0) {
      const firstError = payload.result.results.find((item) => !item.success)?.message;
      showToast({
        title: "Bulk action failed",
        description: firstError ?? "No candidates were updated.",
        tone: "error",
      });
      return;
    }

    showToast({
      title: "Bulk action completed",
      description: `${success_count} candidate(s) updated successfully.`,
      tone: "success",
    });
  }, [fetcher.data, fetcher.state, showToast]);

  const selectedIdsOnPage = useMemo(
    () => selectedIds.filter((id) => candidateIdsOnPage.has(id)),
    [selectedIds, candidateIdsOnPage],
  );

  const selectedSet = useMemo(
    () => new Set(selectedIdsOnPage),
    [selectedIdsOnPage],
  );
  const isAllChecked =
    candidates.length > 0 &&
    candidates.every((c) => selectedSet.has(c.resume_submission_id));
  const isRecommendationFilterVisible = tabsWithRecommendationFilter.has(
    normalizedFilters.stage,
  );
  const isSubmittingAction = fetcher.state !== "idle";

  const candidateById = useMemo(
    () => new Map(candidates.map((candidate) => [candidate.resume_submission_id, candidate])),
    [candidates],
  );

  const isActionAllowed = (action: string, submissionStatus: string) => {
    const allowedByAction: Record<string, string[]> = {
      shortlist: ["Applied", "Recommended", "Shortlisted", "Interview"],
      "set-interview": ["Shortlisted", "Interview"],
      offer: ["Interview", "Offer"],
      hire: ["Offer", "Hire"],
      reject: ["Applied", "Recommended", "Shortlisted", "Interview", "Offer", "Hire"],
      "remove-shortlist": ["Shortlisted", "Interview"],
    };

    const allowedStatuses = allowedByAction[action] ?? [];
    return allowedStatuses.includes(submissionStatus);
  };

  const recommendedCutoffOptions: DropdownOption[] = [
    5, 10, 15, 20, 25, 30,
  ].map((value) => ({
    value: String(value),
    label: `Top ${value}%`,
    accentClassName: "bg-violet-100 text-violet-700",
  }));

  const toggleAllRows = () => {
    if (isAllChecked) {
      setSelectedIds([]);
      return;
    }
    setSelectedIds(
      candidates.map((candidate) => candidate.resume_submission_id),
    );
  };

  const toggleSingleRow = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((value) => value !== id) : [...prev, id],
    );
  };

  const stage = normalizedFilters.stage;

  const queueBulkAction = (action: CandidateBulkAction) => {
    if (selectedIdsOnPage.length === 0 || isSubmittingAction) return;
    const eligibleIds = selectedIdsOnPage.filter((id) => {
      const candidate = candidateById.get(id);
      return candidate ? isActionAllowed(action.action, candidate.submission_status) : false;
    });
    const skippedCount = selectedIdsOnPage.length - eligibleIds.length;

    if (eligibleIds.length === 0) {
      showToast({
        title: `No eligible candidates for ${action.label.toLowerCase()}`,
        description: "All selected candidates are in stages that do not allow this action.",
        tone: "error",
      });
      return;
    }

    const summaryMessage = `${action.message} Eligible: ${eligibleIds.length}.${skippedCount > 0 ? ` Skipped: ${skippedCount} ineligible candidate(s).` : ""}`;
    setPendingAction({ ...action, eligibleIds, skippedCount, message: summaryMessage });
  };

  const submitBulkAction = (action: CandidateBulkAction) => {
    const eligibleIds = action.eligibleIds ?? selectedIdsOnPage;
    if (eligibleIds.length === 0) return;

    const formData = new FormData();
    formData.set("intent", "bulk-stage");
    formData.set("action", action.action);
    if (action.status) {
      formData.set("status", action.status);
    }
    
    formData.set("selectedIds", eligibleIds.join(","));
    fetcher.submit(formData, {
      method: "post",
      action: "/recruiter/candidates",
    });
    setSelectedIds([]);
  };

  const submitFilters = (event?: { target: { name: string; value: string } }) => {
    if (!filterFormRef.current) return;

    const formData = new FormData(filterFormRef.current);

    if (event?.target.name) {
      formData.set(event.target.name, event.target.value);
    }

    formData.set("page", "1");

    submit(formData, {
      method: "get",
      action: "/recruiter/candidates",
    });
  };

  return (
    <Card>
      <div className="mb-3">
        <h2 className="text-xl font-semibold text-zinc-900">Candidates</h2>
        <p className="mt-1 text-sm text-zinc-500">
          Review applications, filter by hiring stage, and move candidates
          forward.
        </p>
      </div>

      <div className="mb-0 border-b border-zinc-200">
        <div className="flex min-w-max gap-2 overflow-x-auto overflow-y-hidden pt-2">
          {stageTabs.map((tab) => {
            const isActive = normalizedFilters.stage === tab.key;

            return (
              <Link
                key={tab.key}
                to={`?search=${encodeURIComponent(normalizedFilters.search)}&jobId=${encodeURIComponent(normalizedFilters.jobId)}&department=${encodeURIComponent(normalizedFilters.department)}&recommendedTopPercent=${encodeURIComponent(normalizedFilters.recommendedTopPercent)}&pageSize=${encodeURIComponent(normalizedFilters.pageSize)}&page=1&stage=${encodeURIComponent(tab.key)}`}
                className={`relative -mb-px inline-flex items-center gap-2 rounded-t-xl border px-4 py-2.5 text-sm font-medium transition ${
                  isActive
                    ? "border-zinc-200 border-b-white bg-white text-zinc-900 shadow-sm"
                    : "border-zinc-200 bg-zinc-50 text-zinc-500 hover:bg-zinc-100"
                }`}
              >
                <span>{tab.label}</span>
                <span
                  className={`flex h-6 min-w-6 items-center justify-center rounded-full px-2 text-xs font-semibold ${isActive ? tab.badge : "bg-zinc-200 text-zinc-600"}`}
                >
                  {countByStage[tab.key] ?? 0}
                </span>
              </Link>
            );
          })}
        </div>
      </div>

      <Form
        method="get"
        ref={filterFormRef}
        onChange={() => submitFilters()}
        className="mb-5 mt-4 flex flex-wrap items-end gap-3"
      >
        <SearchField
          label="Search"
          name="search"
          defaultValue={normalizedFilters.search}
          placeholder="Search name or email"
          className="min-w-65 flex-1"
        />

        <Dropdown
          label="Department"
          name="department"
          value={normalizedFilters.department}
          options={[{ value: "all", label: "All departments", accentClassName: "bg-violet-100 text-violet-700" }, ...departments.map((department) => ({ value: department, label: department, accentClassName: "bg-zinc-100 text-zinc-700" }))]}
          className="min-w-60"
          onChange={submitFilters}
        />

        <JobFilterDropdown
          jobs={jobs}
          filters={normalizedFilters}
          counts={counts}
          onChange={submitFilters}
        />


        {isRecommendationFilterVisible ? (
          <Dropdown
            label="Recommended Cutoff"
            name="recommendedTopPercent"
            value={normalizedFilters.recommendedTopPercent}
            options={recommendedCutoffOptions}
            className="min-w-6"
            buttonClassName="min-w-[240px]"
            onChange={submitFilters}
          />
        ) : (
          <input
            type="hidden"
            name="recommendedTopPercent"
            value={normalizedFilters.recommendedTopPercent}
          />
        )}

        <input type="hidden" name="stage" value={normalizedFilters.stage} />
        <input type="hidden" name="page" value="1" />

        <Dropdown
          label="Page Size"
          name="pageSize"
          value={normalizedFilters.pageSize}
          options={["10", "20", "50"].map((value) => ({ value, label: `${value} per page`, accentClassName: "bg-zinc-100 text-zinc-700" }))}
          className="min-w-44"
          onChange={submitFilters}
        />
      </Form>

      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <p className="text-xs text-zinc-500">
          ATS auto-recommends top {recommendation.top_percent}% by score.
          Selected: {selectedIdsOnPage.length}
        </p>

        <div className="flex flex-wrap items-center gap-2">
          {(stage === "all" || stage === "Recommended") && (
            <button
              type="button"
              disabled={selectedIdsOnPage.length === 0 || isSubmittingAction}
              onClick={() => queueBulkAction({
                action: "shortlist",
                status: "Shortlisted",
                label: "Shortlist",
                title: "Shortlist candidates",
                message: `Move ${selectedIdsOnPage.length} selected candidate(s) to Shortlisted stage?`,
                accent: "green",
              })}
              className="rounded-xl bg-zinc-900 px-3.5 py-2 text-sm text-white shadow-sm disabled:cursor-not-allowed disabled:bg-zinc-300"
            >
              Shortlist
            </button>
          )}

          {stage === "Shortlisted" && (
            <>
              <button
                type="button"
                disabled={selectedIdsOnPage.length === 0 || isSubmittingAction}
                onClick={() => queueBulkAction({
                  action: "remove-shortlist",
                  status: "Applied",
                  label: "Remove from shortlist",
                  title: "Remove from shortlist",
                  message: `Remove shortlist status for ${selectedIdsOnPage.length} selected candidate(s)?`,
                  accent: "violet",
                })}
                className="rounded-xl border border-violet-300 bg-white px-3.5 py-2 text-sm text-violet-700 shadow-sm transition hover:bg-violet-50 disabled:cursor-not-allowed disabled:border-zinc-200 disabled:text-zinc-400"
              >
                Remove from Shortlist
              </button>
              <button
                type="button"
                disabled={selectedIdsOnPage.length === 0 || isSubmittingAction}
                onClick={() => queueBulkAction({
                  action: "set-interview",
                  status: "Interview",
                  label: "Set Interview",
                  title: "Move to interview",
                  message: `Move ${selectedIdsOnPage.length} selected candidate(s) to Interview stage?`,
                  accent: "green",
                })}
                className="rounded-xl bg-zinc-900 px-3.5 py-2 text-sm text-white shadow-sm disabled:cursor-not-allowed disabled:bg-zinc-300"
              >
                Set Interview
              </button>
              <button
                type="button"
                disabled={selectedIdsOnPage.length === 0 || isSubmittingAction}
                onClick={() => queueBulkAction({
                  action: "reject",
                  status: "Rejected",
                  label: "Reject",
                  title: "Reject candidates",
                  message: `Reject ${selectedIdsOnPage.length} selected candidate(s)? This cannot be undone.`,
                  accent: "red",
                })}
                className="rounded-xl bg-rose-600 px-3.5 py-2 text-sm text-white shadow-sm transition hover:bg-rose-700 disabled:cursor-not-allowed disabled:bg-rose-200"
              >
                Reject
              </button>
            </>
          )}

          {stage === "Interview" && (
            <>
              <button
                type="button"
                disabled={selectedIdsOnPage.length === 0 || isSubmittingAction}
                onClick={() => queueBulkAction({
                  action: "shortlist",
                  status: "Shortlisted",
                  label: "Shortlist",
                  title: "Shortlist interview candidates",
                  message: `Move ${selectedIdsOnPage.length} selected interview candidate(s) back to Shortlisted stage?`,
                  accent: "violet",
                })}
                className="rounded-xl border border-violet-300 bg-white px-3.5 py-2 text-sm text-violet-700 shadow-sm transition hover:bg-violet-50 disabled:cursor-not-allowed disabled:border-zinc-200 disabled:text-zinc-400"
              >
                Shortlist
              </button>
              <button
                type="button"
                disabled={selectedIdsOnPage.length === 0 || isSubmittingAction}
                onClick={() => queueBulkAction({
                  action: "offer",
                  status: "Offer",
                  label: "Give Offer",
                  title: "Move to offer",
                  message: `Move ${selectedIdsOnPage.length} selected candidate(s) to Offer stage?`,
                  accent: "green",
                })}
                className="rounded-xl bg-zinc-900 px-3.5 py-2 text-sm text-white shadow-sm disabled:cursor-not-allowed disabled:bg-zinc-300"
              >
                Give Offer
              </button>
              <button
                type="button"
                disabled={selectedIdsOnPage.length === 0 || isSubmittingAction}
                onClick={() => queueBulkAction({
                  action: "reject",
                  status: "Rejected",
                  label: "Reject",
                  title: "Reject candidates",
                  message: `Reject ${selectedIdsOnPage.length} selected candidate(s)? This cannot be undone.`,
                  accent: "red",
                })}
                className="rounded-xl bg-rose-600 px-3.5 py-2 text-sm text-white shadow-sm transition hover:bg-rose-700 disabled:cursor-not-allowed disabled:bg-rose-200"
              >
                Reject
              </button>
            </>
          )}

          {stage === "Offer" && (
            <>
              <button
                type="button"
                disabled={selectedIdsOnPage.length === 0 || isSubmittingAction}
                onClick={() => queueBulkAction({
                  action: "hire",
                  status: "Hire",
                  label: "Hire",
                  title: "Hire candidates",
                  message: `Move ${selectedIdsOnPage.length} selected candidate(s) to Hire stage?`,
                  accent: "green",
                })}
                className="rounded-xl bg-zinc-900 px-3.5 py-2 text-sm text-white shadow-sm disabled:cursor-not-allowed disabled:bg-zinc-300"
              >
                Hire
              </button>
              <button
                type="button"
                disabled={selectedIdsOnPage.length === 0 || isSubmittingAction}
                onClick={() => queueBulkAction({
                  action: "reject",
                  status: "Rejected",
                  label: "Reject",
                  title: "Reject candidates",
                  message: `Reject ${selectedIdsOnPage.length} selected candidate(s)? This cannot be undone.`,
                  accent: "red",
                })}
                className="rounded-xl bg-rose-600 px-3.5 py-2 text-sm text-white shadow-sm transition hover:bg-rose-700 disabled:cursor-not-allowed disabled:bg-rose-200"
              >
                Reject
              </button>
            </>
          )}

          {stage === "Hire" && (
            <button
              type="button"
              disabled={selectedIdsOnPage.length === 0 || isSubmittingAction}
              onClick={() => queueBulkAction({
                action: "reject",
                status: "Rejected",
                label: "Reject",
                title: "Reject candidates",
                message: `Reject ${selectedIdsOnPage.length} selected candidate(s)? This cannot be undone.`,
                accent: "red",
              })}
              className="rounded-xl bg-rose-600 px-3.5 py-2 text-sm text-white shadow-sm transition hover:bg-rose-700 disabled:cursor-not-allowed disabled:bg-rose-200"
            >
              Reject
            </button>
          )}
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
              {[
                "Name",
                "Email",
                "Job",
                "Status",
                "Score",
                "Applied",
                "Actions",
              ].map((col) => (
                <th key={col} className="px-3 py-3 text-left font-semibold">
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {candidates.map((candidate, idx) => (
              <tr
                key={candidate.resume_submission_id}
                className={`border-t border-zinc-100 ${idx % 2 ? "bg-zinc-50/60" : "bg-white"}`}
              >
                <td className="px-3 py-3">
                  <input
                    type="checkbox"
                    aria-label={`select ${candidate.applicant_name}`}
                    checked={selectedSet.has(candidate.resume_submission_id)}
                    onChange={() =>
                      toggleSingleRow(candidate.resume_submission_id)
                    }
                    className="h-4 w-4 rounded border-zinc-400"
                  />
                </td>
                <td className="px-3 py-3 font-medium text-zinc-900">
                  {candidate.applicant_name}
                </td>
                <td className="px-3 py-3 text-zinc-700">
                  {candidate.applicant_email}
                </td>
                <td className="px-3 py-3 text-zinc-700">
                  {candidate.job_title}
                </td>
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

      <div className="mt-4 flex items-center justify-between border-t border-zinc-200 pt-4 text-sm">
        <span>
          Page {pagination.page} of {pagination.totalPages} · {pagination.total} candidates
        </span>
        <div className="flex gap-2">
          <Link
            to={`?search=${encodeURIComponent(normalizedFilters.search)}&jobId=${encodeURIComponent(normalizedFilters.jobId)}&department=${encodeURIComponent(normalizedFilters.department)}&recommendedTopPercent=${encodeURIComponent(normalizedFilters.recommendedTopPercent)}&stage=${encodeURIComponent(normalizedFilters.stage)}&pageSize=${encodeURIComponent(normalizedFilters.pageSize)}&page=${Math.max(1, pagination.page - 1)}`}
            className="rounded border border-zinc-300 px-3 py-1"
          >
            Prev
          </Link>
          <Link
            to={`?search=${encodeURIComponent(normalizedFilters.search)}&jobId=${encodeURIComponent(normalizedFilters.jobId)}&department=${encodeURIComponent(normalizedFilters.department)}&recommendedTopPercent=${encodeURIComponent(normalizedFilters.recommendedTopPercent)}&stage=${encodeURIComponent(normalizedFilters.stage)}&pageSize=${encodeURIComponent(normalizedFilters.pageSize)}&page=${Math.min(pagination.totalPages, pagination.page + 1)}`}
            className="rounded border border-zinc-300 px-3 py-1"
          >
            Next
          </Link>
        </div>
      </div>

      <ConfirmationModal
        open={Boolean(pendingAction)}
        title={pendingAction?.title ?? "Confirm action"}
        message={pendingAction?.message ?? "Are you sure?"}
        confirmLabel={pendingAction?.label ?? "Confirm"}
        accent={pendingAction?.accent ?? "violet"}
        loading={isSubmittingAction}
        onClose={() => {
          if (isSubmittingAction) return;
          setPendingAction(null);
        }}
        onCancel={() => {
          if (isSubmittingAction) return;
          setPendingAction(null);
        }}
        onConfirm={() => {
          if (!pendingAction || isSubmittingAction) return;
          submitBulkAction(pendingAction);
        }}
      />
    </Card>
  );
};