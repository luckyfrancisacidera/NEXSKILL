import { useMemo, useState } from "react";
import { useLoaderData } from "react-router-dom";
import {
  ArrowRight,
  BadgeCheck,
  Bookmark,
  BriefcaseBusiness,
  Check,
  Clock3,
  FileText,
  GraduationCap,
  HandCoins,
  Loader2,
  MapPin,
  Sparkles,
  SquareChartGantt,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useToast } from "@app/providers/ToastProvider";
import { Card } from "@shared/components/data-display/Card";
import { DetailBlock } from "@shared/components/data-display/DetailBlock";
import { RichTextContent } from "@shared/components/data-display/RichTextContent";
import { formatCurrencyAmount } from "@shared/data/currency";
import { splitToBullets, toList } from "@shared/utils/formatText";
import { formatJobLabel } from "@shared/utils/jobLabels";
import { formatPostedDateLabel, getPostedDateValue } from "@shared/utils/jobPostingDate";
import { ApplyModalWizard } from "@features/jobseeker/pages/JobDetailPage/components/ApplyModalWizard";
import { jobseekerService } from "@features/jobseeker/services/jobseeker.service";
import type { JobDetailLoaderData, JobseekerApplicationInput } from "@features/jobseeker/types";
import { ApiError } from "@shared/api/http";

const renderDetailTitle = (title: string, Icon: LucideIcon) => (
  <span className="inline-flex items-center gap-2">
    <span className="rounded-lg bg-zinc-100 p-1 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-200">
      <Icon className="h-4 w-4" />
    </span>
    <span>{title}</span>
  </span>
);

export const JobDetailPage = () => {
  const job = useLoaderData() as JobDetailLoaderData;
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [isSavingJob, setIsSavingJob] = useState(false);
  const [isApplying, setIsApplying] = useState(false);
  const [applyError, setApplyError] = useState<string | null>(null);
  const { showToast } = useToast();

  const responsibilities = useMemo(
    () => splitToBullets(job.responsibilities),
    [job.responsibilities],
  );
  const benefits = useMemo(() => splitToBullets(job.benefits), [job.benefits]);
  const requiredSkills = useMemo(
    () => toList(job.required_skills),
    [job.required_skills],
  );
  const preferredSkills = useMemo(
    () => toList(job.preferred_skills),
    [job.preferred_skills],
  );
  const postedDateLabel = formatPostedDateLabel(getPostedDateValue(job));

  const applyToJob = async (formData: FormData) => {
    if (isApplying) {
      return;
    }

    const payload = {
      full_name: String(formData.get("full_name") ?? "").trim(),
      email: String(formData.get("email") ?? "").trim(),
      postal_code: String(formData.get("postal_code") ?? "").trim(),
      location: String(formData.get("location") ?? "").trim(),
      resume_file: formData.get("resume_file") as File,
    } satisfies JobseekerApplicationInput;

    setIsApplying(true);
    setApplyError(null);
    showToast({
      title: "Uploading resume",
      description: "We’re uploading your file and queueing parsing and matching.",
      tone: "info",
      durationMs: 2000,
    });

    try {
      const response = await jobseekerService.applyToJob(job.id, payload);
      showToast({
        title: "Application submitted",
        description:
          response.message ||
          "Upload complete. Parsing and scoring will continue in the background.",
        tone: "success",
      });
      setIsModalOpen(false);
    } catch (error) {
      const message =
        error instanceof ApiError
          ? error.message
          : error instanceof Error
            ? error.message
            : "Unable to submit application right now.";
      const tone =
        error instanceof ApiError && (error.status === 400 || error.status === 409)
          ? "warning"
          : "error";
      const title =
        error instanceof ApiError && error.status === 409
          ? "Already applied"
          : error instanceof ApiError && error.status === 400
            ? "Application needs attention"
            : "Application failed";

      setApplyError(message);
      showToast({
        title,
        description: message,
        tone,
      });
    } finally {
      setIsApplying(false);
    }
  };

  return (
    <div className="space-y-4">
      <Card className="overflow-hidden border border-zinc-200 bg-white p-0 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
        <div className="space-y-5">
          <header className="border-b border-zinc-200 bg-[radial-gradient(circle_at_top_right,rgba(63,63,70,0.18),transparent_35%),linear-gradient(135deg,#fafafa_0%,#f4f4f5_100%)] px-4 py-5 dark:border-zinc-800 dark:bg-[radial-gradient(circle_at_top_right,rgba(161,161,170,0.12),transparent_35%),linear-gradient(135deg,#09090b_0%,#18181b_100%)] sm:px-6">
            <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
              <div className="space-y-4">
                <div className="space-y-2">
                  <p className="text-xs font-semibold uppercase tracking-[0.24em] text-zinc-500 dark:text-zinc-400">
                    Job overview
                  </p>
                  <h1 className="text-xl font-bold text-zinc-900 dark:text-zinc-100 sm:text-2xl lg:text-3xl">
                    {job.title}
                  </h1>
                </div>
                <div className="flex flex-wrap gap-2">
                  <span className="rounded-lg border border-zinc-200 bg-white/80 px-3 py-1 text-sm text-zinc-700 dark:border-zinc-700 dark:bg-zinc-900/70 dark:text-zinc-300">
                    {job.department ?? "General"}
                  </span>
                  <span className="rounded-lg border border-zinc-200 bg-white/80 px-3 py-1 text-sm text-zinc-700 dark:border-zinc-700 dark:bg-zinc-900/70 dark:text-zinc-300">
                    {job.location || "Location not specified"}
                  </span>
                  <span className="rounded-lg border border-zinc-200 bg-white/80 px-3 py-1 text-sm text-zinc-700 dark:border-zinc-700 dark:bg-zinc-900/70 dark:text-zinc-300">
                    {formatJobLabel(job.employment_type, "Employment type not specified")}
                  </span>
                  <span className="rounded-lg border border-zinc-200 bg-white/80 px-3 py-1 text-sm text-zinc-700 dark:border-zinc-700 dark:bg-zinc-900/70 dark:text-zinc-300">
                    {job.experience_level || "Experience level not specified"}
                  </span>
                </div>
              </div>

              <div className="grid gap-3 rounded-3xl border border-zinc-200 bg-white/85 p-4 shadow-sm backdrop-blur sm:grid-cols-[minmax(0,1.9fr)_minmax(0,1fr)_minmax(0,0.9fr)] lg:min-w-[620px] dark:border-zinc-800 dark:bg-zinc-950/80">
                <div className="flex min-w-0 items-start gap-3">
                  <div className="rounded-2xl bg-zinc-900 p-2 text-white dark:bg-zinc-100 dark:text-zinc-900">
                    <BriefcaseBusiness className="h-4 w-4" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-zinc-500 dark:text-zinc-400">
                      Compensation
                    </p>
                    <p className="mt-1 text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                      {formatCurrencyAmount(job.salary_min_per_annum, job.currency)} -{" "}
                      {formatCurrencyAmount(job.salary_max_per_annum, job.currency)} / year
                    </p>
                  </div>
                </div>
                <div className="flex min-w-0 items-start gap-3">
                  <div className="rounded-2xl bg-zinc-100 p-2 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-200">
                    <MapPin className="h-4 w-4" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-zinc-500 dark:text-zinc-400">
                      Work setup
                    </p>
                    <p className="mt-1 text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                      {job.work_setup || "Not specified"}
                    </p>
                  </div>
                </div>
                <div className="flex min-w-0 items-start gap-3">
                  <div className="rounded-2xl bg-zinc-100 p-2 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-200">
                    <Clock3 className="h-4 w-4" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-zinc-500 dark:text-zinc-400">
                      Posted
                    </p>
                    <p className="mt-1 text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                      {postedDateLabel}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </header>

          <div className="grid gap-4 px-4 pb-4 sm:px-6 sm:pb-6 lg:grid-cols-[minmax(0,1fr)_280px] xl:grid-cols-[minmax(0,1fr)_300px]">
            <div className="space-y-4 pt-4">
              <DetailBlock title={renderDetailTitle("About the Role", FileText)}>
                <RichTextContent
                  html={job.description}
                  className="text-justify"
                  emptyFallback="No description provided."
                />
              </DetailBlock>

              <DetailBlock title={renderDetailTitle("Responsibilities", SquareChartGantt)}>
                <ul className="list-disc space-y-2 pl-5 text-justify text-zinc-700 dark:text-zinc-300">
                  {responsibilities.length > 0 ? (
                    responsibilities.map((item) => <li key={item}>{item}</li>)
                  ) : (
                    <li>No responsibilities listed.</li>
                  )}
                </ul>
              </DetailBlock>

              <div className="grid gap-4 lg:grid-cols-2">
                <DetailBlock title={renderDetailTitle("Required Skills", BadgeCheck)}>
                  <div className="flex flex-wrap gap-2">
                    {requiredSkills.length > 0 ? (
                      requiredSkills.map((skill) => (
                        <span
                          key={skill}
                          className="rounded-full border border-zinc-300 bg-zinc-100 px-3 py-1 text-xs font-medium text-zinc-700 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200"
                        >
                          {skill}
                        </span>
                      ))
                    ) : (
                      <p className="text-sm text-zinc-500 dark:text-zinc-400">
                        No required skills listed.
                      </p>
                    )}
                  </div>
                </DetailBlock>

                <DetailBlock title={renderDetailTitle("Preferred Skills", Sparkles)}>
                  <div className="flex flex-wrap gap-2">
                    {preferredSkills.length > 0 ? (
                      preferredSkills.map((skill) => (
                        <span
                          key={skill}
                          className="rounded-lg border border-zinc-300 bg-zinc-100 px-3 py-1 text-sm text-zinc-700 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200"
                        >
                          {skill}
                        </span>
                      ))
                    ) : (
                      <p className="text-sm text-zinc-500 dark:text-zinc-400">
                        No preferred skills listed.
                      </p>
                    )}
                  </div>
                </DetailBlock>
              </div>

              <div className="grid gap-4 lg:grid-cols-2">
                <DetailBlock title={renderDetailTitle("Qualifications", GraduationCap)}>
                  <ul className="list-disc space-y-2 pl-5 text-justify text-zinc-700 dark:text-zinc-300">
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
                    <li>{job.experience_level || "Role level not specified"}</li>
                  </ul>
                </DetailBlock>

                <DetailBlock title={renderDetailTitle("Work Details", MapPin)}>
                  <ul className="space-y-2 text-justify text-zinc-700 dark:text-zinc-300">
                    <li>
                      <span className="font-medium text-zinc-900 dark:text-zinc-100">
                        Schedule:
                      </span>{" "}
                      {job.schedule || "Not specified"}
                    </li>
                    <li>
                      <span className="font-medium text-zinc-900 dark:text-zinc-100">
                        Work Setup:
                      </span>{" "}
                      {job.work_setup || "Not specified"}
                    </li>
                    <li>
                      <span className="font-medium text-zinc-900 dark:text-zinc-100">
                        Location:
                      </span>{" "}
                      {job.location || "Not specified"}
                    </li>
                    <li>
                      <span className="font-medium text-zinc-900 dark:text-zinc-100">Posted:</span>{" "}
                      {postedDateLabel}
                    </li>
                  </ul>
                </DetailBlock>
              </div>

              <DetailBlock title={renderDetailTitle("Compensation & Benefits", HandCoins)}>
                <div className="flex flex-wrap items-center gap-2 text-zinc-700">
                  {benefits.length > 0
                    ? benefits.map((benefit) => (
                        <span
                          key={benefit}
                          className="rounded-lg border border-zinc-300 bg-zinc-100 px-3 py-1 text-sm text-zinc-700 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200"
                        >
                          {benefit}
                        </span>
                      ))
                    : null}
                </div>
              </DetailBlock>
            </div>

            <aside className="space-y-3 pt-1 lg:sticky lg:top-4 lg:self-start lg:pt-4">
              <div className="rounded-3xl border border-zinc-200 bg-zinc-50 p-4 dark:border-zinc-800 dark:bg-zinc-900">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-zinc-500 dark:text-zinc-400">
                  Ready to apply?
                </p>
                <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-300">
                  Submit your resume to start the screening process. You will get immediate feedback if anything needs attention.
                </p>
              </div>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
                <button
                  type="button"
                  disabled={isApplying}
                  onClick={() => setIsModalOpen(true)}
                  className="flex w-full items-center justify-center gap-2 rounded-2xl bg-zinc-900 px-4 py-3 text-base font-semibold text-white transition hover:bg-zinc-700 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-white"
                >
                  {isApplying ? <Loader2 className="h-4 w-4 animate-spin" /> : <ArrowRight className="h-4 w-4" />}
                  <span>{isApplying ? "Uploading Resume..." : "Apply Now"}</span>
                </button>
                <button
                  type="button"
                  disabled={isSavingJob}
                  onClick={() => {
                    if (isSavingJob) {
                      return;
                    }

                    setIsSavingJob(true);

                    const request = isSaved
                      ? jobseekerService.removeSavedJob(job.id)
                      : jobseekerService.saveJob(job.id);

                    void request
                      .then(() => setIsSaved((prev) => !prev))
                      .finally(() => setIsSavingJob(false));
                  }}
                  className={`flex w-full items-center justify-center gap-2 rounded-lg border px-4 py-3 text-base font-semibold transition disabled:cursor-not-allowed disabled:opacity-60 ${
                    isSaved
                      ? "border-zinc-900 bg-zinc-900 text-white hover:bg-zinc-800 dark:border-zinc-100 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
                      : "border-zinc-300 bg-white text-zinc-800 hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 dark:hover:bg-zinc-800"
                  }`}
                >
                  {isSavingJob ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : isSaved ? (
                    <Check className="h-4 w-4" />
                  ) : (
                    <Bookmark className="h-4 w-4" />
                  )}

                  <span>
                    {isSavingJob ? "Saving..." : isSaved ? "Saved" : "Save Job"}
                  </span>
                </button>
              </div>
            </aside>
          </div>
        </div>
      </Card>

      {isModalOpen ? (
        <ApplyModalWizard
          errorMessage={applyError}
          isSubmitting={isApplying}
          submissionHint={
            isApplying
              ? "Uploading your resume now. Parsing and matching will be queued as soon as the upload is accepted."
              : "Your resume upload is immediate, and parsing plus matching continue in the background after submission."
          }
          onClose={() => setIsModalOpen(false)}
          onSubmit={applyToJob}
        />
      ) : null}
    </div>
  );
};
