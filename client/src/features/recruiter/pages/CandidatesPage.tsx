import { Card } from "@shared/components/Card";
import { Eye } from "lucide-react";
import { Form, Link, useLoaderData } from "react-router-dom";

const stageTabs = [
  { key: "all", label: "All Applicants" },
  { key: "Recommended", label: "Recommended" },
  { key: "Shortlisted", label: "Shortlisted" },
  { key: "Interview", label: "Interview" },
  { key: "Offer", label: "Offer" },
  { key: "Hire", label: "Hire" },
] as const;

export const CandidatesPage = () => {
  const { candidates, jobs, counts, filters, recommendation } =
    useLoaderData() as {
      candidates: Array<{
        resume_submission_id: string;
        applicant_name: string;
        applicant_email: string;
        job_id: string;
        job_title: string;
        submission_status: string;
        jobseeker_stage: string;
        score: number;
        created_at_utc: string;
      }>;
      jobs: Array<{ id: string; title: string }>;
      counts: {
        all_applicants: number;
        recommended: number;
        shortlisted: number;
        interview: number;
        offer: number;
        hire: number;
      };
      recommendation: { top_percent: number };
      filters: {
        search: string;
        stage: string;
        jobId: string;
        recommendedTopPercent: string;
      };
    };

  const countByStage: Record<string, number> = {
    all: counts.all_applicants,
    Recommended: counts.recommended,
    Shortlisted: counts.shortlisted,
    Interview: counts.interview,
    Offer: counts.offer,
    Hire: counts.hire,
  };

  return (
    <Card>
      <h2 className="mb-3 text-xl font-semibold">Candidates</h2>
      <Form method="get" className="mb-3 flex flex-wrap items-center gap-2">
        <input
          aria-label="search candidate"
          name="search"
          defaultValue={filters.search}
          className="min-w-75 rounded-lg border border-zinc-300 px-3 py-2"
          placeholder="Search"
        />

        <select
          aria-label="filter by job"
          name="jobId"
          defaultValue={filters.jobId}
          className="min-w-50 rounded-lg border border-zinc-300 px-3 py-2"
        >
          <option value="all">All jobs</option>
          {jobs.map((job) => (
            <option key={job.id} value={job.id}>
              {job.title}
            </option>
          ))}
        </select>

        <select
          aria-label="recommended top percent"
          name="recommendedTopPercent"
          defaultValue={filters.recommendedTopPercent}
          className="rounded-lg border border-zinc-300 px-3 py-2"
        >
          {[5, 10, 15, 20, 25, 30].map((value) => (
            <option key={value} value={value}>
              Top {value}% ATS Recommended
            </option>
          ))}
        </select>

        <input type="hidden" name="stage" value={filters.stage} />
        <button
          className="rounded-lg bg-zinc-900 px-4 py-2 text-white"
          type="submit"
        >
          Filter
        </button>
      </Form>

      <p className="mb-3 text-xs text-zinc-500">
        ATS auto-recommends top {recommendation.top_percent}% by score.
        Shortlisted, Interview, Offer, and Hire are updated manually by
        recruiters.
      </p>

      <div className="mb-4 flex flex-wrap gap-2">
        {stageTabs.map((tab) => (
          <Link
            key={tab.key}
            to={`?search=${encodeURIComponent(filters.search)}&jobId=${encodeURIComponent(filters.jobId)}&recommendedTopPercent=${encodeURIComponent(filters.recommendedTopPercent)}&stage=${encodeURIComponent(tab.key)}`}
            className={`rounded-full border px-3 py-1 text-sm ${
              filters.stage === tab.key
                ? "bg-zinc-900 text-white"
                : "border-zinc-300"
            }`}
          >
            {tab.label} ({countByStage[tab.key] ?? 0})
          </Link>
        ))}
      </div>

      <table className="min-w-full text-sm">
        <thead>
          <tr>
            {["Name", "Email", "Job", "Submission Status", "Score", "Applied", "Actions"].map((col) => (
              <th key={col} className="px-3 py-2 text-left">
                {col}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {candidates.map((candidate, idx) => (
              <tr key={candidate.resume_submission_id} className={idx % 2 ? "bg-zinc-50" : ""}>
              <td className="px-3 py-2">{candidate.applicant_name}</td>
              <td className="px-3 py-2">{candidate.applicant_email}</td>
              <td className="px-3 py-2">{candidate.job_title}</td>
              <td className="px-3 py-2"><span className="rounded bg-zinc-200 px-2 py-1 text-xs">{candidate.submission_status}</span></td>
              <td className="px-3 py-2 font-semibold">{candidate.score}</td>
              <td className="px-3 py-2"> {new Date(candidate.created_at_utc).toLocaleDateString()}</td>
              <td className="px-3 py-2">
               <Link to={`/recruiter/candidates/${candidate.resume_submission_id}`} className="inline-flex items-center gap-1 text-zinc-700 underline" title="View profile">
                  <Eye size={16} />
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </Card>
  );
};
