import { Form, useActionData, useLoaderData } from "react-router-dom";
import { Card } from "@shared/components/Card";

const sections = [
  "overview",
  "responsibilities",
  "requirements",
  "benefits",
] as const;

export const JobFormPage = ({ mode }: { mode: "create" | "edit" }) => {
  const actionData = useActionData() as { error?: string } | undefined;
  const loaderData = useLoaderData() as {
    job?: {
      title: string;
      department: string;
      location: string;
      type: string;
      status: string;
      salaryMin?: number;
      salaryMax?: number;
      tags: string[];
      description: Record<string, string[]>;
    };
  };
  const job = loaderData?.job;

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <Card>
        <h2 className="mb-4 text-xl font-semibold">
          {mode === "create" ? "Create Job" : "Edit Job"}
        </h2>
        <Form method="post" className="space-y-3">
          {actionData?.error ? (
            <p className="rounded bg-zinc-100 p-2 text-sm text-zinc-700">
              {actionData.error}
            </p>
          ) : null}
          <input
            aria-label="job title"
            name="title"
            required
            minLength={3}
            defaultValue={job?.title}
            placeholder="Title"
            className="w-full rounded-lg border border-zinc-300 px-3 py-2"
          />
          <input
            aria-label="department"
            name="department"
            required
            minLength={2}
            defaultValue={job?.department}
            placeholder="Department"
            className="w-full rounded-lg border border-zinc-300 px-3 py-2"
          />
          <input
            aria-label="location"
            name="location"
            required
            minLength={2}
            defaultValue={job?.location}
            placeholder="Location"
            className="w-full rounded-lg border border-zinc-300 px-3 py-2"
          />
          <select
            aria-label="type"
            name="type"
            defaultValue={job?.type ?? "Full-Time"}
            className="w-full rounded-lg border border-zinc-300 px-3 py-2"
          >
            {["Full-Time", "Part-Time", "Contract", "Internship"].map(
              (item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ),
            )}
          </select>
          <select
            aria-label="status"
            name="status"
            defaultValue={job?.status ?? "Open"}
            className="w-full rounded-lg border border-zinc-300 px-3 py-2"
          >
            {["Open", "Paused", "Closed"].map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
          <div className="grid grid-cols-2 gap-2">
            <input
              aria-label="salary min"
              type="number"
              name="salaryMin"
              defaultValue={job?.salaryMin}
              placeholder="Salary min"
              className="rounded-lg border border-zinc-300 px-3 py-2"
            />
            <input
              aria-label="salary max"
              type="number"
              name="salaryMax"
              defaultValue={job?.salaryMax}
              placeholder="Salary max"
              className="rounded-lg border border-zinc-300 px-3 py-2"
            />
          </div>
          <input
            aria-label="skills tags"
            name="tags"
            defaultValue={job?.tags.join(", ")}
            placeholder="Tags comma-separated"
            className="w-full rounded-lg border border-zinc-300 px-3 py-2"
          />
          {sections.map((section) => (
            <label key={section} className="block">
              <span className="mb-1 block text-sm font-medium capitalize">
                {section}
              </span>
              <textarea
                aria-label={section}
                name={section}
                defaultValue={job?.description[section]?.join("\n")}
                rows={4}
                className="w-full rounded-lg border border-zinc-300 px-3 py-2"
                placeholder={`One bullet per line for ${section}`}
              />
            </label>
          ))}
          <div className="flex gap-2">
            <button
              className="rounded-lg bg-zinc-900 px-4 py-2 text-white"
              type="submit"
            >
              Save
            </button>
            <button
              className="rounded-lg border border-zinc-300 px-4 py-2"
              name="status"
              value="Open"
              type="submit"
            >
              Publish
            </button>
          </div>
        </Form>
      </Card>

      <Card>
        <h3 className="mb-2 text-lg font-semibold">Live Preview</h3>
        <p className="text-sm text-zinc-500">
          Preview updates on submit in this client-side demo.
        </p>
        {sections.map((section) => (
          <div key={section} className="mt-4">
            <h4 className="font-medium capitalize">{section}</h4>
            <ul className="list-inside list-disc text-sm text-zinc-700">
              {(job?.description[section] ?? ["No content yet"]).map((line) => (
                <li key={line}>{line}</li>
              ))}
            </ul>
          </div>
        ))}
      </Card>
    </div>
  );
};
