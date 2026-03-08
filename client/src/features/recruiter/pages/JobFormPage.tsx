import { useMemo, useState } from "react";
import { Card } from "@shared/components/Card";

import { Form, Link, useActionData, useLoaderData, useNavigation } from "react-router-dom";
import { BriefcaseBusiness, Building2, CircleDollarSign, MapPin, Sparkles } from "lucide-react";

const departments = ["Engineering", "Product", "Design", "Marketing", "Operations", "Sales"];
const titles = ["Software Engineer", "Frontend Engineer", "Backend Engineer", "Full Stack Engineer", "Product Manager"];

const currencies = ["PHP", "USD", "SGD", "EUR"];

const experienceLevels = ["Entry", "Mid", "Senior", "Lead"];

const educationLevels = ["High School", "Diploma", "Bachelor's Degree", "Master's Degree", "PhD"];

const labelClass = "text-sm font-medium text-zinc-700";

const inputClass = "w-full rounded-xl border border-zinc-300 bg-white px-3 py-2.5 text-sm text-zinc-900 shadow-sm transition focus:border-violet-500 focus:outline-none focus:ring-4 focus:ring-violet-100";

const PredictiveInput = ({
  name,
  placeholder,
  options,
  defaultValue,
  isRequired,
}: {
  name: string;
  placeholder: string;
  options: string[];
  defaultValue: string;
  isRequired? : boolean;
}) => {
  const [value, setValue] = useState(defaultValue);
  const [isOpen, setIsOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);

  const suggestions = useMemo(() => {
    const normalized = value.trim().toLowerCase();
    if (!normalized) return options;
    return options.filter((option) => option.toLowerCase().includes(normalized));
  }, [options, value]);

  const select = (nextValue: string) => {
    setValue(nextValue);
    setIsOpen(false);
    setActiveIndex(-1);
  };

  return (
    <div className="relative">
      <input
        name={name}
        autoComplete="off"
        required={isRequired ?? false}
        value={value}
        onFocus={() => setIsOpen(true)}
        onBlur={() => setTimeout(() => setIsOpen(false), 120)}
        onChange={(event) => {
          setValue(event.target.value);
          setIsOpen(true);
          setActiveIndex(-1);
        }}
        onKeyDown={(event) => {
          if (!isOpen || suggestions.length === 0) return;

          if (event.key === "ArrowDown") {
            event.preventDefault();
            setActiveIndex((current) => Math.min(suggestions.length - 1, current + 1));
          }

          if (event.key === "ArrowUp") {
            event.preventDefault();
            setActiveIndex((current) => Math.max(0, current - 1));
          }

          if (event.key === "Enter" && activeIndex >= 0) {
            event.preventDefault();
            select(suggestions[activeIndex]);
          }
        }}
        placeholder={placeholder}
        className={inputClass}
      />

      {isOpen && suggestions.length > 0 ? (
        <ul className="absolute z-20 mt-1 max-h-52 w-full overflow-auto rounded-xl border border-zinc-200 bg-white p-1 shadow-xl">
          {suggestions.map((suggestion, index) => (
            <li key={suggestion}>
              <button
                type="button"
                className={`w-full rounded-lg px-3 py-2 text-left text-sm ${index === activeIndex ? "bg-violet-100 text-violet-800" : "text-zinc-700 hover:bg-zinc-100"}`}
                onMouseDown={(event) => event.preventDefault()}
                onClick={() => select(suggestion)}
              >
                {suggestion}
              </button>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
};

export const JobFormPage = ({ mode }: { mode: "create" | "edit" }) => {
  const actionData = useActionData() as { error?: string } | undefined;
  const loaderData = useLoaderData() as { job?: Record<string, unknown> };
  const job = loaderData?.job;
  const navigation = useNavigation();
  const isSaving = navigation.state === "submitting";

  return (
     <div className="space-y-6">
      <Card className="border border-zinc-200 bg-linear-to-br from-white via-violet-50/30 to-white p-0 shadow-sm">
        <div className="border-b border-zinc-200 px-6 py-5">
          <div className="flex items-start gap-3">
            <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-violet-100 text-violet-700">
              <Sparkles className="h-5 w-5" />
            </span>
            <div>
              <h2 className="text-2xl font-bold text-zinc-900">{mode === "create" ? "Create Job" : "Edit Job"}</h2>
              <p className="text-sm text-zinc-600">Use a clean and structured post so candidates can understand your role quickly.</p>
            </div>
          </div>
        </div>

         <Form method="post" className="space-y-6 px-6 py-6">
          {actionData?.error ? <p className="rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">{actionData.error}</p> : null}

           <section className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm">
            <h3 className="mb-3 flex items-center gap-2 text-base font-semibold text-zinc-900"><BriefcaseBusiness className="h-4 w-4 text-violet-700" /> Job Basics</h3>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className={labelClass}>Job Title *</label>
                <PredictiveInput name="title" placeholder="e.g. Software Engineer" isRequired={true} options={titles} defaultValue={String(job?.title ?? "")} />
              </div>
              <div>
                <label className={labelClass}>Department</label>
                <PredictiveInput name="department" placeholder="Type a department" isRequired={true} options={departments} defaultValue={String(job?.department ?? "")} />
              </div>
              <div>
                <label className={labelClass}>Location *</label>
                <div className="relative">
                  <MapPin className="pointer-events-none absolute left-3 top-3 h-4 w-4 text-zinc-400" />
                  <input   autoComplete="off" name="location" required defaultValue={String(job?.location ?? "")} placeholder="City, Country" className={`${inputClass} pl-10`} />
                </div>
              </div>
                <div>
                <label className={labelClass}>Work Setup</label>
                <select name="work_setup" defaultValue={String(job?.work_setup ?? 0)} className={inputClass}>
                  <option value="0">Onsite</option><option value="1">Hybrid</option><option value="2">Remote</option>
                </select>
              </div>
            </div>

            <div className="mt-4 grid gap-4 md:grid-cols-3">
              <div>
                <label className={labelClass}>Employment Type</label>
                  <select name="employment_type" defaultValue={String(job?.employment_type ?? 0)} className={inputClass}>
                  <option value="0">Full Time</option><option value="1">Part Time</option><option value="2">Contract</option><option value="3">Internship</option><option value="4">Temporary</option>
                </select>
              </div>

              <div>
                <label className={labelClass}>Schedule</label>
                 <input autoComplete="off" name="schedule" defaultValue={String(job?.schedule ?? "")} placeholder="Mon–Fri, 9AM–6PM" className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Vacancies</label>
                <input type="number" min={0} name="number_of_vacancies" defaultValue={String(job?.number_of_vacancies ?? 1)} className={inputClass} />
              </div>
            
            </div>
          </section>

          <section className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm">
            <h3 className="mb-3 flex items-center gap-2 text-base font-semibold text-zinc-900"><CircleDollarSign className="h-4 w-4 text-violet-700" /> Compensation</h3>
            <div className="grid gap-4 md:grid-cols-3">
              <div><label className={labelClass}>Minimum Salary (Annual)</label><input type="number" min="0" step="1000" name="salary_min_per_annum" defaultValue={String(job?.salary_min_per_annum ?? "")} className={inputClass} /></div>
              <div><label className={labelClass}>Maximum Salary (Annual)</label><input type="number" min="0" step="1000" name="salary_max_per_annum" defaultValue={String(job?.salary_max_per_annum ?? "")} className={inputClass} /></div>
              <div>
                <label className={labelClass}>Currency</label>
                <PredictiveInput name="currency" placeholder="Currency" options={currencies} defaultValue={String(job?.currency ?? "PHP")} />
              </div>
            </div>
          </section>

          <section className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm">
            <h3 className="mb-3 text-base font-semibold text-zinc-900">Role Details</h3>
            <div className="space-y-4">
              <div>
                <label className={labelClass}>Description</label>
                <textarea required name="description" rows={5} maxLength={2000} defaultValue={String(job?.description ?? "")} placeholder="Describe the role, team, and impact." className={inputClass} />
              </div>

              <div>
                <label className={labelClass}>Responsibilities</label>
                <textarea required name="responsibilities" rows={4} defaultValue={String(job?.responsibilities ?? "")} placeholder="List role responsibilities" className={inputClass} />
              </div>
            </div>
          </section>
          
            <section className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm">
            <h3 className="mb-3 text-base font-semibold text-zinc-900">Skills & Qualifications</h3>
            <div className="grid gap-4 md:grid-cols-2">
              <div><label className={labelClass}>Required Skills</label><input autoComplete="off" required name="required_skills" defaultValue={String((job?.required_skills as string[] | undefined)?.join(", ") ?? "")} placeholder="React, TypeScript, Node.js" className={inputClass} /></div>
              <div><label className={labelClass}>Preferred Skills</label><input autoComplete="off" required name="preferred_skills" defaultValue={String((job?.preferred_skills as string[] | undefined)?.join(", ") ?? "")} placeholder="GraphQL, Docker" className={inputClass} /></div>
       
              <div>
                <label className={labelClass}>Experience Level</label>
                  <select name="experience_level" defaultValue={String(job?.experience_level ?? "")} className={inputClass}>
                  <option value="">Select level</option>
                  {experienceLevels.map((v) => <option key={v}>{v}</option>)}
                </select>
              </div>

              <div><label className={labelClass}>Minimum Years</label><input type="number" name="min_years" defaultValue={String(job?.min_years ?? "")} className={inputClass} /></div>
              <div>
                <label className={labelClass}>Education</label>
                 <PredictiveInput name="education" placeholder="Type education level" options={educationLevels} defaultValue={String(job?.education ?? "")} />
              </div>

              <div>
                <label className={labelClass}>Minimum Education</label>
                <select name="min_education" defaultValue={String(job?.min_education ?? "")} className={inputClass}>
                  <option value="">Select minimum education</option>
                  {educationLevels.map((v) => <option key={v}>{v}</option>)}
                </select>
              </div>
            </div>
          </section>

         <section className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm">
            <h3 className="mb-3 flex items-center gap-2 text-base font-semibold text-zinc-900"><Building2 className="h-4 w-4 text-violet-700" /> Benefits & Status</h3>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className={labelClass}>Benefits</label>
                <textarea name="benefits" rows={3} defaultValue={String(job?.benefits ?? "")} placeholder="Healthcare, flexible hours, leave credits" className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Job Status</label>
                <select name="status" defaultValue={String(job?.status ?? "Draft")} className={inputClass}>
                  <option value="Draft">Draft</option><option value="Published">Published</option><option value="Closed">Closed</option>
                </select>
              </div>
            </div>
          </section>

          {/* ACTIONS */}

          <div className="flex flex-wrap items-center justify-end gap-2 pt-1">
            <Link to="/recruiter/job-posts" className="rounded-xl border border-zinc-300 px-4 py-2 text-zinc-700 hover:bg-zinc-100">Cancel</Link>
            <button className="rounded-xl bg-violet-700 px-4 py-2 font-semibold text-white hover:bg-violet-800 disabled:opacity-70" type="submit" disabled={isSaving}>
              {isSaving ? "Saving..." : "Save"}
            </button>
          </div>
        </Form>
      </Card>
    </div>
  );
};