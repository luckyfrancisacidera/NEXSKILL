import { Form, Link, useLoaderData } from "react-router-dom";
import { Card } from "@shared/components/Card";

export const CandidatesPage = () => {
  const { candidates, jobs } = useLoaderData() as {
    candidates: Array<{
      id: string;
      name: string;
      email: string;
      jobId: string;
      stage: string;
      score: number;
      lastActivityAt: string;
    }>;
    jobs: Array<{ id: string; title: string }>;
  };

  return (
    <Card>
      <h2 className="mb-3 text-xl font-semibold">Candidates</h2>
      <Form method="get" className="mb-3 flex flex-wrap gap-2">
        <input
          aria-label="search candidate"
          name="search"
          className="rounded-lg border border-zinc-300 px-3 py-2 min-w-75"
          placeholder="Search"
        />
        <select
          aria-label="filter by stage"
          name="stage"
          className="rounded-lg border border-zinc-300 px-3 py-1 min-w-50"
        >
          <option value="all">All stages</option>
          {[
            "Applied",
            "Screening",
            "Interview",
            "Offer",
            "Hired",
            "Rejected",
          ].map((stage) => (
            <option key={stage} value={stage}>
              {stage}
            </option>
          ))}
        </select>
        <select
          aria-label="filter by job"
          name="jobId"
          className="rounded-lg border border-zinc-300 px-3 py-2 min-w-50"
        >
          <option value="all">All jobs</option>
          {jobs.map((job) => (
            <option key={job.id} value={job.id}>
              {job.title}
            </option>
          ))}
        </select>
        <button
          className="rounded-lg bg-zinc-900 px-4 py-2 text-white"
          type="submit"
        >
          Filter
        </button>
      </Form>
      <table className="min-w-full text-sm">
        <thead>
          <tr>
            {["Name", "Job", "Stage", "Score", "Last activity", "Actions"].map(
              (col) => (
                <th key={col} className="px-3 py-2 text-left">
                  {col}
                </th>
              ),
            )}
          </tr>
        </thead>
        <tbody>
          {candidates.map((candidate, idx) => (
            <tr key={candidate.id} className={idx % 2 ? "bg-zinc-50" : ""}>
              <td className="px-3 py-2">{candidate.name}</td>
              <td className="px-3 py-2">
                {jobs.find((job) => job.id === candidate.jobId)?.title ?? "-"}
              </td>
              <td className="px-3 py-2">
                <span className="rounded bg-zinc-200 px-2 py-1 text-xs">
                  {candidate.stage}
                </span>
              </td>
              <td className="px-3 py-2">{candidate.score}</td>
              <td className="px-3 py-2">
                {new Date(candidate.lastActivityAt).toLocaleDateString()}
              </td>
              <td className="px-3 py-2">
                <Link
                  className="underline"
                  to={`/recruiter/candidates/${candidate.id}`}
                >
                  View
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </Card>
  );
};
