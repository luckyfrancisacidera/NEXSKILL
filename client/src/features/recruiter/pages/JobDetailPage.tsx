import { Form, Link, useLoaderData } from "react-router-dom";
import { Card } from "@shared/components/Card";
import { BarChart, Bar, ResponsiveContainer } from "recharts";

type JobDescriptionBlock = Record<string, unknown>;

type RecruiterJobDetail = {
  id: string;
  title: string;
  status: string;
  department?: string;
  location: string;
  employment_type?: string;
  description?: string | JobDescriptionBlock;
  responsibilities?: string | string[];
  benefits?: string | string[];
  required_skills?: string[] | string;
  preferred_skills?: string[] | string;
};

const toList = (value: unknown): string[] => {
  if (Array.isArray(value)) {
    return value.map((item) => String(item).trim()).filter(Boolean);
  }

  if (typeof value === "string") {
    return value
      .split(/\r?\n|,/)
      .map((item) => item.trim())
      .filter(Boolean);
  }

  return [];
};

const renderDescriptionSections = (job: RecruiterJobDetail) => {
  if (
    job.description &&
    typeof job.description === "object" &&
    !Array.isArray(job.description)
  ) {
    return Object.entries(job.description)
      .map(([key, value]) => ({ key, items: toList(value) }))
      .filter((entry) => entry.items.length > 0);
  }

  return [
    { key: "description", items: toList(job.description) },
    { key: "responsibilities", items: toList(job.responsibilities) },
    { key: "benefits", items: toList(job.benefits) },
    { key: "required skills", items: toList(job.required_skills) },
    { key: "preferred skills", items: toList(job.preferred_skills) },
  ].filter((entry) => entry.items.length > 0);
};

export const JobDetailPage = () => {
  const { job, applicants, trend } = useLoaderData() as {
    job: RecruiterJobDetail;
    applicants: Array<{ id: string; name: string; stage: string }>;
    trend: Array<{ day: string; applications: number }>;
  };

  const sections = renderDescriptionSections(job);

  return (
    <div className="space-y-4">
      <Card>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-2xl font-semibold">{job.title}</h2>
            <p className="text-sm text-zinc-500">
              {job.department} · {job.location} · {job.employment_type}
            </p>
          </div>
          <div className="flex gap-2">
            <Link
              to={`/recruiter/job-posts/${job.id}/edit`}
              className="rounded-lg border border-zinc-300 px-3 py-2"
            >
              Edit
            </Link>
            <Link
              to="/recruiter/job-posts/new"
              className="rounded-lg border border-zinc-300 px-3 py-2"
            >
              Duplicate
            </Link>
            <Form
              method="post"
              action={`/recruiter/job-posts/${job.id}/status`}
            >
              <input
                type="hidden"
                name="status"
                value={job.status === "Published" ? "Closed" : "Published"}
              />
              <button
                className="rounded-lg border border-zinc-300 px-3 py-2"
                type="submit"
              >
                {job.status === "Published" ? "Close" : "Publish"}
              </button>
            </Form>
          </div>
        </div>
      </Card>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <h3 className="mb-2 font-semibold">
            Applicants ({applicants.length})
          </h3>
          <ul className="space-y-2">
            {applicants.map((candidate) => (
              <li
                key={candidate.id}
                className="flex items-center justify-between rounded border border-zinc-200 p-2 text-sm"
              >
                <Link to={`/recruiter/candidates/${candidate.id}`}>
                  {candidate.name}
                </Link>
                <span className="rounded bg-zinc-200 px-2 py-1 text-xs">
                  {candidate.stage}
                </span>
              </li>
            ))}
          </ul>
        </Card>
        <Card>
          <h3 className="mb-2 font-semibold">Applicants trend</h3>
          <div className="h-50">
            <ResponsiveContainer>
              <BarChart data={trend}>
                <Bar
                  dataKey="applications"
                  fill="#525252"
                  radius={[8, 8, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      <Card>
        <h3 className="font-semibold">Description</h3>
        {sections.length === 0 ? (
          <p className="mt-3 text-sm text-zinc-500">
            No details available for this job yet.
          </p>
        ) : (
          sections.map(({ key, items }) => (
            <div key={key} className="mt-3">
              <p className="font-medium capitalize">{key}</p>
              <ul className="list-inside list-disc text-sm text-zinc-700">
                {items.map((item) => (
                  <li key={`${key}-${item}`}>{item}</li>
                ))}
              </ul>
            </div>
          ))
        )}
      </Card>
    </div>
  );
};
