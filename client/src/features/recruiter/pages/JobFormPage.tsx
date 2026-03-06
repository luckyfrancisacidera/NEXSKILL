import { Card } from "@shared/components/Card";
import {
  Form,
  Link,
  useActionData,
  useLoaderData,
  useNavigation,
} from "react-router-dom";

const departments = [
  "Engineering",
  "Product",
  "Design",
  "Marketing",
  "Operations",
  "Sales",
];
const titles = [
  "Software Engineer",
  "Frontend Engineer",
  "Backend Engineer",
  "Full Stack Engineer",
  "Product Manager",
];
const currencies = ["PHP", "USD", "SGD", "EUR"];

const sectionTitleClass = "text-base font-semibold";
const sectionHelpClass = "mt-1 text-xs text-zinc-500";
const inputClass = "w-full rounded-lg border border-zinc-300 px-3 py-2";

export const JobFormPage = ({ mode }: { mode: "create" | "edit" }) => {
  const actionData = useActionData() as { error?: string } | undefined;
  const loaderData = useLoaderData() as { job?: Record<string, unknown> };
  const job = loaderData?.job;
  const navigation = useNavigation();
  const isSaving = navigation.state === "submitting";

  return (
    <div className="space-y-4">
      <Card>
        <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
          <div>
            <h2 className="text-xl font-semibold">
              {mode === "create" ? "Create Job" : "Edit Job"}
            </h2>
            <p className="text-sm text-zinc-500">
              Organize job details clearly to improve applicant matching and
              recruiter review.
            </p>
          </div>
        </div>

        <Form method="post" className="space-y-4">
          {actionData?.error ? (
            <p className="rounded bg-zinc-100 p-2 text-sm text-zinc-700">
              {actionData.error}
            </p>
          ) : null}
          <section className="rounded-lg border border-zinc-200 p-4">
            <h3 className={sectionTitleClass}>Job Basics</h3>
            <p className={sectionHelpClass}>
              Core role details applicants see first.
            </p>
            <div className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-2">
              <div className="space-y-3">
                <input
                  list="title-options"
                  name="title"
                  required
                  defaultValue={String(job?.title ?? "")}
                  placeholder="Job title"
                  className={inputClass}
                />
                <datalist id="title-options">
                  {titles.map((v) => (
                    <option key={v} value={v} />
                  ))}
                </datalist>
                <input
                  list="department-options"
                  name="department"
                  defaultValue={String(job?.department ?? "")}
                  placeholder="Department"
                  className={inputClass}
                />
                <datalist id="department-options">
                  {departments.map((v) => (
                    <option key={v} value={v} />
                  ))}
                </datalist>
              </div>

              <div className="space-y-3">
                <input
                  name="location"
                  required
                  defaultValue={String(job?.location ?? "")}
                  placeholder="Location"
                  className={inputClass}
                />
                <select
                  name="work_setup"
                  defaultValue={String(job?.work_setup ?? 0)}
                  className={inputClass}
                >
                  <option value="0">Onsite</option>
                  <option value="1">Hybrid</option>
                  <option value="2">Remote</option>
                </select>
              </div>
            </div>

            <div className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-2">
              <select
                name="employment_type"
                defaultValue={String(job?.employment_type ?? 0)}
                className={inputClass}
              >
                <option value="0">FullTime</option>
                <option value="1">PartTime</option>
                <option value="2">Contract</option>
                <option value="3">Internship</option>
                <option value="4">Temporary</option>
              </select>
              <input
                name="schedule"
                defaultValue={String(job?.schedule ?? "")}
                placeholder="Schedule (e.g. Mon-Fri)"
                className={inputClass}
              />
            </div>

            <div className="mt-3 md:max-w-sm md:ml-auto">
              <select
                name="status"
                defaultValue={String(job?.status ?? "Draft")}
                className={inputClass}
              >
                <option value="Draft">Draft</option>
                <option value="Published">Published</option>
                <option value="Closed">Closed</option>
              </select>
            </div>
          </section>

          <section className="rounded-lg border border-zinc-200 p-4">
            <h3 className={sectionTitleClass}>Compensation</h3>
            <p className={sectionHelpClass}>
              Provide a clear salary range and payout currency.
            </p>

            <div className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-3">
              <input
                type="number"
                name="salary_min_per_annum"
                defaultValue={String(job?.salary_min_per_annum ?? "")}
                placeholder="Salary min per annum"
                className={inputClass}
              />
              <input
                type="number"
                name="salary_max_per_annum"
                defaultValue={String(job?.salary_max_per_annum ?? "")}
                placeholder="Salary max per annum"
                className={inputClass}
              />
              <div>
                <input
                  list="currency-options"
                  name="currency"
                  defaultValue={String(job?.currency ?? "PHP")}
                  className={inputClass}
                  placeholder="Currency"
                />
                <datalist id="currency-options">
                  {currencies.map((v) => (
                    <option key={v} value={v} />
                  ))}
                </datalist>
              </div>
            </div>
          </section>

          <section className="rounded-lg border border-zinc-200 p-4">
            <h3 className={sectionTitleClass}>Description</h3>
            <p className={sectionHelpClass}>
              Use clear responsibilities and requirements for better matching.
            </p>
            <textarea
              name="description"
              rows={5}
              defaultValue={String(job?.description ?? "")}
              placeholder="Description"
              className={`${inputClass} mt-3`}
            />
          </section>

          <section className="rounded-lg border border-zinc-200 p-4">
            <h3 className={sectionTitleClass}>
              Responsibilities & Requirements
            </h3>
            <p className={sectionHelpClass}>
              Outline what the role does and what candidates should bring.
            </p>
            <div className="mt-3">
              <textarea
                name="responsibilities"
                rows={4}
                defaultValue={String(job?.responsibilities ?? "")}
                placeholder="Responsibilities"
                className={inputClass}
              />
            </div>
          </section>

          <section className="rounded-lg border border-zinc-200 p-4">
            <h3 className={sectionTitleClass}>Skills</h3>
            <p className={sectionHelpClass}>
              Add comma-separated skills to improve fit evaluation.
            </p>

            <div className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-2">
              <input
                name="required_skills"
                defaultValue={String(
                  (job?.required_skills as string[] | undefined)?.join(", ") ??
                    "",
                )}
                placeholder="Required skills (comma-separated)"
                className={inputClass}
              />
              <input
                name="preferred_skills"
                defaultValue={String(
                  (job?.preferred_skills as string[] | undefined)?.join(", ") ??
                    "",
                )}
                placeholder="Preferred skills (comma-separated)"
                className={inputClass}
              />
            </div>
          </section>

          <section className="rounded-lg border border-zinc-200 p-4">
            <h3 className={sectionTitleClass}>Experience & Education</h3>
            <p className={sectionHelpClass}>
              These fields are used for scoring. Keep them specific and
              consistent.
            </p>

            <div className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-2">
              <input
                name="experience_level"
                defaultValue={String(job?.experience_level ?? "")}
                placeholder="experience_level"
                className={inputClass}
              />
              <input
                type="number"
                name="min_years"
                defaultValue={String(job?.min_years ?? "")}
                placeholder="min_years"
                className={inputClass}
              />
            </div>

            <div className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-2">
              <input
                name="education"
                defaultValue={String(job?.education ?? "")}
                placeholder="education"
                className={inputClass}
              />
              <input
                name="min_education"
                defaultValue={String(job?.min_education ?? "")}
                placeholder="min_education"
                className={inputClass}
              />
            </div>
          </section>

          <section className="rounded-lg border border-zinc-200 p-4">
            <h3 className={sectionTitleClass}>Benefits</h3>
            <p className={sectionHelpClass}>
              Include perks, healthcare, leave, and flexibility notes.
            </p>
            <textarea
              name="benefits"
              rows={3}
              defaultValue={String(job?.benefits ?? "")}
              placeholder="Benefits"
              className={`${inputClass} mt-3`}
            />
          </section>

          <div className="flex flex-wrap items-center justify-end gap-2 pt-1">
            <Link
              to="/recruiter/job-posts"
              className="rounded-lg border border-zinc-300 px-4 py-2 text-zinc-700 hover:bg-zinc-100"
            >
              Cancel
            </Link>
            <button
              className="rounded-lg bg-zinc-900 px-4 py-2 text-white disabled:opacity-70"
              type="submit"
              disabled={isSaving}
            >
              {isSaving ? "Saving..." : "Save"}
            </button>
          </div>
        </Form>
      </Card>
    </div>
  );
};
