import { Form, useLoaderData } from "react-router-dom";
import { Card } from "@shared/components/Card";

const statuses = ["Shortlisted", "Interview", "Offer", "Hire", "Rejected"];

export const CandidateDetailPage = () => {
  const { candidate } = useLoaderData() as {
    candidate: {
      resume_submission_id: string;
      applicant_name: string;
      applicant_email: string;
      job_title: string;
      score: number;
      submission_status: string;
      jobseeker_stage: string;
      created_at_utc: string;
    };
  };

  return (
    <div className="grid gap-4 lg:grid-cols-3">
      <Card className="lg:col-span-2">
        <h2 className="text-xl font-semibold">{candidate.applicant_name}</h2>
        <p className="text-sm text-zinc-500">
          {candidate.applicant_email} · {candidate.job_title}
        </p>
        <p className="mt-2 text-sm text-zinc-600">
          ATS Score: <span className="font-semibold">{candidate.score}</span>
        </p>
        <p className="mt-1 text-sm text-zinc-600">
          Jobseeker sees:{" "}
          <span className="font-semibold">{candidate.jobseeker_stage}</span>
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          {statuses.map((status) => (
            <Form key={status} method="post">
              <input type="hidden" name="intent" value="stage" />
              <input type="hidden" name="status" value={status} />
              <button
                className={`rounded-lg border px-3 py-1 text-sm ${status === candidate.submission_status ? "bg-zinc-900 text-white" : "border-zinc-300"}`}
                type="submit"
              >
                {status}
              </button>
            </Form>
          ))}
        </div>
        
      </Card>
      <Card>
        <h3 className="font-semibold">Submission Info</h3>
        <ul className="mt-2 space-y-2 text-sm">
          <li><span className="text-zinc-500">Submission Status:</span> {candidate.submission_status}</li>
          <li><span className="text-zinc-500">Jobseeker Stage:</span> {candidate.jobseeker_stage}</li>
          <li><span className="text-zinc-500">Applied:</span> {new Date(candidate.created_at_utc).toLocaleString()}</li>
        </ul>
      </Card>
    </div>
  );
};
