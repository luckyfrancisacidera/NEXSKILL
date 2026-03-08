import { Link, useLoaderData, useNavigate, useSearchParams } from "react-router-dom";
import { Card } from "@shared/components/Card";
import { formatCurrencyAmount } from "@shared/data/currency";
import { DashboardAreaChart } from "@shared/components/DashboardAreaChart";
import { useEffect, useMemo, useState } from "react";

import type { JobDto } from "../service/recruiter.service";
import { getJobStatusAccent } from "@shared/utils/jobStatusAccent";
import { splitToBullets, toList } from "@shared/utils/formatText";
import { DetailBlock } from "@shared/components/DetailBlock";

import { ConfirmationModal } from "@shared/components/ConfirmationModal";
import { HighRiskVerificationModal } from "@shared/components/HighRiskVerificationModal";
import { recruiterService } from "@features/recruiter/service/recruiter.service";
import { useToast } from "@app/providers/ToastProvider";

export const JobDetailPage = () => {
  const { job, applicants, trend } = useLoaderData() as {
    job: JobDto;
    applicants: Array<{ id: string; name: string; stage: string }>;
    trend: Array<{ day: string; applications: number }>;
  };

  const statusAccent = getJobStatusAccent(job.status);
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isVerificationOpen, setIsVerificationOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | undefined>();
  const [searchParams, setSearchParams] = useSearchParams();

  const responsibilities = useMemo(() => splitToBullets(job.responsibilities), [job.responsibilities]);
  const benefits = useMemo(() => splitToBullets(job.benefits), [job.benefits]);
  const requiredSkills = useMemo(() => toList(job.required_skills), [job.required_skills]);
  const preferredSkills = useMemo(() => toList(job.preferred_skills), [job.preferred_skills]);

  useEffect(() => {
    const toast = searchParams.get("toast");
    if (!toast) return;

    if (toast === "created") {
      showToast({
        title: "Job created successfully",
        description: `${job.title} is ready for recruiter workflows.`,
        tone: "success",
      });
    }

    if (toast === "updated") {
      showToast({
        title: "Job updated successfully",
        description: `${job.title} was updated.`,
        tone: "success",
      });
    }

    setSearchParams({}, { replace: true });
  }, [job.title, searchParams, setSearchParams, showToast]);

  return (
    <div className="space-y-4">
      <Card className="bg-zinc-50/60 p-3 sm:p-5">
          <div className="space-y-5">
            <header className="space-y-4 border-b border-zinc-200 pb-4">
              <h1 className="text-2xl font-bold text-zinc-900 sm:text-3xl">
                {job.title}
              </h1>
              <div className="flex flex-wrap gap-2">
                <span className={`rounded-lg border px-3 py-1 text-sm font-medium ${statusAccent.className}`}>
                  {statusAccent.label}
                </span>
                <span className="rounded-lg border border-zinc-200 bg-zinc-100 px-3 py-1 text-sm text-zinc-700">
                  {job.department ?? "General"}
                </span>
                <span className="rounded-lg border border-zinc-200 bg-zinc-100 px-3 py-1 text-sm text-zinc-700">
                  {job.location || "Location not specified"}
                </span>
                <span className="rounded-lg border border-zinc-200 bg-zinc-100 px-3 py-1 text-sm text-zinc-700">
                  {job.employment_type || "Employment type not specified"}
                </span>
                <span className="rounded-lg border border-zinc-200 bg-zinc-100 px-3 py-1 text-sm text-zinc-700">
                  {job.experience_level || "Experience level not specified"}
                </span>
                <span className="rounded-lg border border-zinc-200 bg-zinc-100 px-3 py-1 text-sm font-medium text-zinc-800">
                  {formatCurrencyAmount(job.salary_min_per_annum, job.currency)}{" "}
                  -{" "}
                  {formatCurrencyAmount(job.salary_max_per_annum, job.currency)}{" "}
                  / year
                </span>
                 <span className="rounded-lg border border-zinc-200 bg-zinc-100 px-3 py-1 text-sm text-zinc-700">
                  Vacancies: {job.remaining_vacancies ?? 0} / {job.number_of_vacancies ?? 0}
                </span>
              </div>
            </header>

            <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_260px]">
              <div className="space-y-4">
                <DetailBlock title="About the Role">
                  <p className="whitespace-pre-wrap leading-7 text-zinc-700">
                    {job.description || "No description provided."}
                  </p>
                </DetailBlock>

                <DetailBlock title="Responsibilities">
                  <ul className="list-disc space-y-2 pl-5 text-zinc-700">
                    {responsibilities.length > 0 ? (
                      responsibilities.map((item) => <li key={item}>{item}</li>)
                    ) : (
                      <li>No responsibilities listed.</li>
                    )}
                  </ul>
                </DetailBlock>

                <div className="grid gap-4 xl:grid-cols-2">
                  <DetailBlock title="Required Skills">
                    <div className="flex flex-wrap gap-2">
                      {requiredSkills.length > 0 ? (
                        requiredSkills.map((skill) => (
                          <span
                            key={skill}
                            className="rounded-full border border-zinc-300 bg-zinc-100 px-3 py-1 text-xs font-medium text-zinc-700"
                          >
                            {skill}
                          </span>
                        ))
                      ) : (
                        <p className="text-sm text-zinc-500">
                          No required skills listed.
                        </p>
                      )}
                    </div>
                  </DetailBlock>

                  <DetailBlock title="Preferred Skills">
                    <div className="flex flex-wrap gap-2">
                      {preferredSkills.length > 0 ? (
                        preferredSkills.map((skill) => (
                          <span
                            key={skill}
                            className="rounded-lg border border-zinc-300 bg-zinc-100 px-3 py-1 text-sm text-zinc-700"
                          >
                            {skill}
                          </span>
                        ))
                      ) : (
                        <p className="text-sm text-zinc-500">
                          No preferred skills listed.
                        </p>
                      )}
                    </div>
                  </DetailBlock>
                </div>

                <div className="grid gap-4 xl:grid-cols-2">
                  <DetailBlock title="Qualifications">
                    <ul className="list-disc space-y-2 pl-5 text-zinc-700">
                      <li>
                        {job.min_years
                          ? `${job.min_years}+ years of experience`
                          : "Experience not specified"}
                      </li>
                      <li>
                        {job.education ||
                          job.min_education ||
                          "Education not specified"}
                      </li>
                      <li>
                        {job.experience_level || "Role level not specified"}
                      </li>
                    </ul>
                  </DetailBlock>

                  <DetailBlock title="Work Details">
                    <ul className="space-y-2 text-zinc-700">
                      <li>
                        <span className="font-medium text-zinc-900">
                          Schedule:
                        </span>{" "}
                        {job.schedule || "Not specified"}
                      </li>
                      <li>
                        <span className="font-medium text-zinc-900">
                          Work Setup:
                        </span>{" "}
                        {job.work_setup || "Not specified"}
                      </li>
                      <li>
                        <span className="font-medium text-zinc-900">
                          Location:
                        </span>{" "}
                        {job.location || "Not specified"}
                      </li>
                    </ul>
                  </DetailBlock>
                </div>

                <DetailBlock title="Compensation & Benefits">
                  <div className="flex flex-wrap items-center gap-2 text-zinc-700">
                    <span className="text-xl font-bold text-zinc-900">
                      {formatCurrencyAmount(
                        job.salary_min_per_annum,
                        job.currency,
                      )}{" "}
                      -{" "}
                      {formatCurrencyAmount(
                        job.salary_max_per_annum,
                        job.currency,
                      )}
                      <span className="text-base font-medium text-zinc-600">
                        {" "}
                        / year
                      </span>
                    </span>
                    {benefits.length > 0
                      ? benefits.map((benefit) => (
                          <span
                            key={benefit}
                            className="rounded-lg border border-zinc-300 bg-zinc-100 px-3 py-1 text-sm"
                          >
                            {benefit}
                          </span>
                        ))
                      : null}
                  </div>
                </DetailBlock>
              </div>

              <aside className="space-y-3 lg:sticky lg:top-4 lg:self-start">
                <Link
                  to={`/recruiter/job-posts/${job.id}/edit`}
                  className="block w-full rounded-lg bg-zinc-900 px-4 py-3 text-center text-base font-semibold text-white transition hover:bg-zinc-700"
                >
                  Edit Job
                </Link>
                <button
                  type="button"
                  onClick={() => { setIsVerificationOpen(false); setDeleteError(undefined); setIsDeleteOpen(true); }}
                  className="w-full rounded-lg border border-red-300 bg-white px-4 py-3 text-base font-semibold text-red-700 transition hover:bg-red-50"
                >
                 Delete Job
                </button>
              </aside>
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
            <DashboardAreaChart
              labels={trend.map((item) => item.day)}
              datasets={[{ label: 'Applications', data: trend.map((item) => item.applications), border_color: '#525252', background_color: 'rgba(82,82,82,0.2)' }]}
            />
          </div>
        </Card>
      </div>
       <ConfirmationModal
       open={isDeleteOpen && !isVerificationOpen}
        title={job.status?.toLowerCase() === "published" ? "Delete published job?" : "Delete this job?"}
        message={job.status?.toLowerCase() === "published"
          ? "This job is published and needs an additional verification step before deletion."
          : "This action permanently removes the job post and cannot be undone."}
        confirmLabel={job.status?.toLowerCase() === "published" ? "Continue" : "Delete Job"}
        accent="red"
        loading={isDeleting}
        onClose={() => setIsDeleteOpen(false)}
        onCancel={() => setIsDeleteOpen(false)}
        onConfirm={async () => {
          if (job.status?.toLowerCase() === "published") {
            setIsVerificationOpen(true);
            return;
          }

          try {
            setIsDeleting(true);
            setDeleteError(undefined);
            await recruiterService.deleteJob(job.id);
            showToast({
              title: "Job deleted successfully",
              description: `${job.title} was removed from your job posts.`,
              tone: "success",
            });
            setIsDeleteOpen(false);
            setIsVerificationOpen(false);
            navigate("/recruiter/job-posts");
          } catch {
            showToast({
              title: "Unable to delete job",
              description: "Please try again.",
              tone: "error",
            });
          } finally {
            setIsDeleting(false);
          }
        }}
      />
      <HighRiskVerificationModal
        open={isDeleteOpen && isVerificationOpen}
        title="Final verification required"
        message="Type DELETE or the exact job title to permanently delete this published job."
        expectedKeyword="DELETE"
        expectedText={job.title}
        loading={isDeleting}
        error={deleteError}
        onClose={() => setIsDeleteOpen(false)}
        onCancel={() => setIsDeleteOpen(false)}
        onConfirm={async () => {
          try {
            setIsDeleting(true);
            setDeleteError(undefined);
            await recruiterService.deleteJob(job.id);
            showToast({
              title: "Job deleted successfully",
              description: `${job.title} was removed from your job posts.`,
              tone: "success",
            });
            setIsDeleteOpen(false);
            setIsVerificationOpen(false);
            navigate("/recruiter/job-posts");
          } catch {
            setDeleteError("Unable to delete this job right now. Please try again.");
            showToast({
              title: "Unable to delete job",
              description: "Please try again.",
              tone: "error",
            });
          } finally {
            setIsDeleting(false);
          }
        }}
      />
    </div>
  );
};
