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

const experienceLevels = ["Entry", "Mid", "Senior", "Lead"];

const educationLevels = [
  "High School",
  "Diploma",
  "Bachelor's Degree",
  "Master's Degree",
  "PhD",
];

const sectionTitleClass = "text-base font-semibold";
const sectionHelpClass = "mt-1 text-xs text-zinc-500";
const labelClass = "text-sm font-medium";
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
          {actionData?.error && (
            <p className="rounded bg-zinc-100 p-2 text-sm text-zinc-700">
              {actionData.error}
            </p>
          )}

          {/* JOB BASICS */}

          <section className="rounded-lg border border-zinc-200 p-4">
            <h3 className={sectionTitleClass}>Job Basics</h3>
            <p className={sectionHelpClass}>
              Core role details applicants see first.
            </p>

            <div className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-2">
              <div className="space-y-3">
                <div>
                  <label className={labelClass}>
                    Job Title <span className="text-red-500">*</span>
                  </label>
                  <input
                    autoFocus
                    list="title-options"
                    name="title"
                    required
                    defaultValue={String(job?.title ?? "")}
                    placeholder="e.g. Software Engineer"
                    className={inputClass}
                  />
                  <datalist id="title-options">
                    {titles.map((v) => (
                      <option key={v} value={v} />
                    ))}
                  </datalist>
                </div>

                <div>
                  <label className={labelClass}>Department</label>
                  <input
                    list="department-options"
                    name="department"
                    defaultValue={String(job?.department ?? "")}
                    placeholder="Select or type department"
                    className={inputClass}
                  />
                  <datalist id="department-options">
                    {departments.map((v) => (
                      <option key={v} value={v} />
                    ))}
                  </datalist>
                </div>
              </div>

              <div className="space-y-3">
                <div>
                  <label className={labelClass}>
                    Location <span className="text-red-500">*</span>
                  </label>
                  <input
                    name="location"
                    required
                    defaultValue={String(job?.location ?? "")}
                    placeholder="City, Country"
                    className={inputClass}
                  />
                </div>

                <div>
                  <label className={labelClass}>Work Setup</label>
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
            </div>

            <div className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-2">
              <div>
                <label className={labelClass}>Employment Type</label>
                <select
                  name="employment_type"
                  defaultValue={String(job?.employment_type ?? 0)}
                  className={inputClass}
                >
                  <option value="0">Full Time</option>
                  <option value="1">Part Time</option>
                  <option value="2">Contract</option>
                  <option value="3">Internship</option>
                  <option value="4">Temporary</option>
                </select>
              </div>

              <div>
                <label className={labelClass}>Schedule</label>
                <input
                  name="schedule"
                  defaultValue={String(job?.schedule ?? "")}
                  placeholder="e.g. Mon–Fri, 9AM–6PM"
                  className={inputClass}
                />
              </div>
            </div>

            <div className="mt-3 md:max-w-sm md:ml-auto">
              <label className={labelClass}>Job Status</label>
              <select
                name="status"
                defaultValue={String(job?.status ?? "Draft")}
                className={inputClass}
              >
                <option value="Draft">Draft (not visible to applicants)</option>
                <option value="Published">Published (live)</option>
                <option value="Closed">Closed (no new applicants)</option>
              </select>
            </div>
          </section>

          {/* COMPENSATION */}

          <section className="rounded-lg border border-zinc-200 p-4">
            <h3 className={sectionTitleClass}>Compensation</h3>
            <p className={sectionHelpClass}>
              Provide a clear salary range and payout currency.
            </p>

            <div className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-3">
              <div>
                <label className={labelClass}>Minimum Salary (Annual)</label>
                <input
                  type="number"
                  step="1000"
                  name="salary_min_per_annum"
                  defaultValue={String(job?.salary_min_per_annum ?? "")}
                  placeholder="Minimum annual salary"
                  className={inputClass}
                />
              </div>

              <div>
                <label className={labelClass}>Maximum Salary (Annual)</label>
                <input
                  type="number"
                  step="1000"
                  name="salary_max_per_annum"
                  defaultValue={String(job?.salary_max_per_annum ?? "")}
                  placeholder="Maximum annual salary"
                  className={inputClass}
                />
              </div>

              <div>
                <label className={labelClass}>Currency</label>
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

          {/* DESCRIPTION */}

          <section className="rounded-lg border border-zinc-200 p-4">
            <h3 className={sectionTitleClass}>Description</h3>
            <p className={sectionHelpClass}>
              Use clear responsibilities and requirements for better matching.
            </p>

            <textarea
              name="description"
              rows={5}
              maxLength={2000}
              defaultValue={String(job?.description ?? "")}
              placeholder="Describe the role, team, and impact."
              className={`${inputClass} mt-3`}
            />
          </section>

          {/* RESPONSIBILITIES */}

          <section className="rounded-lg border border-zinc-200 p-4">
            <h3 className={sectionTitleClass}>Responsibilities</h3>
            <p className={sectionHelpClass}>
              Example: • Build features • Collaborate with designers • Review
              code
            </p>

            <textarea
              name="responsibilities"
              rows={4}
              defaultValue={String(job?.responsibilities ?? "")}
              placeholder="List role responsibilities"
              className={`${inputClass} mt-3`}
            />
          </section>

          {/* REQUIREMENTS */}

          <section className="rounded-lg border border-zinc-200 p-4">
            <h3 className={sectionTitleClass}>Requirements</h3>

            <textarea
              name="requirements"
              rows={4}
              defaultValue={String(job?.requirements ?? "")}
              placeholder="List candidate requirements"
              className={`${inputClass} mt-3`}
            />
          </section>

          {/* SKILLS */}

          <section className="rounded-lg border border-zinc-200 p-4">
            <h3 className={sectionTitleClass}>Skills</h3>
            <p className={sectionHelpClass}>
              Separate skills using commas. Example: React, TypeScript, Node.js
            </p>

            <div className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-2">
              <input
                name="required_skills"
                defaultValue={String(
                  (job?.required_skills as string[] | undefined)?.join(", ") ??
                    ""
                )}
                placeholder="Required skills"
                className={inputClass}
              />

              <input
                name="preferred_skills"
                defaultValue={String(
                  (job?.preferred_skills as string[] | undefined)?.join(", ") ??
                    ""
                )}
                placeholder="Preferred skills"
                className={inputClass}
              />
            </div>
          </section>

          {/* EXPERIENCE */}

          <section className="rounded-lg border border-zinc-200 p-4">
            <h3 className={sectionTitleClass}>Experience & Education</h3>

            <div className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-2">
              <div>
                <label className={labelClass}>Experience Level</label>
                <select
                  name="experience_level"
                  defaultValue={String(job?.experience_level ?? "")}
                  className={inputClass}
                >
                  <option value="">Select level</option>
                  {experienceLevels.map((v) => (
                    <option key={v}>{v}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className={labelClass}>Minimum Years</label>
                <input
                  type="number"
                  name="min_years"
                  defaultValue={String(job?.min_years ?? "")}
                  placeholder="e.g. 3"
                  className={inputClass}
                />
              </div>
            </div>

            <div className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-2">
              <div>
                <label className={labelClass}>Education</label>
                <select
                  name="education"
                  defaultValue={String(job?.education ?? "")}
                  className={inputClass}
                >
                  <option value="">Select education</option>
                  {educationLevels.map((v) => (
                    <option key={v}>{v}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className={labelClass}>Minimum Education</label>
                <select
                  name="min_education"
                  defaultValue={String(job?.min_education ?? "")}
                  className={inputClass}
                >
                  <option value="">Select minimum education</option>
                  {educationLevels.map((v) => (
                    <option key={v}>{v}</option>
                  ))}
                </select>
              </div>
            </div>
          </section>

          {/* BENEFITS */}

          <section className="rounded-lg border border-zinc-200 p-4">
            <h3 className={sectionTitleClass}>Benefits</h3>
            <p className={sectionHelpClass}>
              Include perks, healthcare, leave, and flexibility notes.
            </p>

            <textarea
              name="benefits"
              rows={3}
              defaultValue={String(job?.benefits ?? "")}
              placeholder="Example: Health insurance, flexible hours, remote stipend"
              className={`${inputClass} mt-3`}
            />
          </section>

          {/* ACTIONS */}

          <div className="flex flex-wrap items-center justify-end gap-2 pt-1">
            <button
              type="button"
              onClick={() => setIsPreviewOpen(true)}
              className="rounded-lg border border-zinc-300 px-4 py-2 text-zinc-700 hover:bg-zinc-100"
            >
              Preview
            </button>

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