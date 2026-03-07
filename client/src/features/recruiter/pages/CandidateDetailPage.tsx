import { useMemo, useState, type ReactNode } from "react";
import { useLoaderData, useRevalidator } from "react-router-dom";
import {
  BriefcaseBusiness,
  Download,
  GraduationCap,
  Mail,
  MapPin,
  Phone,
} from "lucide-react";
import { Card } from "@shared/components/Card";
import { ConfirmationModal } from "@shared/components/ConfirmationModal";
import { ModalOverlay } from "@shared/components/ModalOverlay";
import { useToast } from "@app/providers/ToastProvider";
import {
  recruiterService,
  type ApplicantDetailDto,
  type ApplicantScoreItemDto,
  type ParsedResumeProjectDto,
  type ParsedResumeWorkExperienceDto,
} from "@features/recruiter/service/recruiter.service";

type CandidateStage = ApplicantScoreItemDto["submission_status"];
type PendingAction = "primary" | "reject" | null;

const stageBadgeClass: Record<CandidateStage, string> = {
  Applied: "border-zinc-200 bg-zinc-100 text-zinc-700",
  Recommended: "border-indigo-200 bg-indigo-50 text-indigo-700",
  Shortlisted: "border-emerald-200 bg-emerald-50 text-emerald-700",
  Interview: "border-violet-200 bg-violet-50 text-violet-700",
  Offer: "border-amber-200 bg-amber-50 text-amber-700",
  Hire: "border-teal-200 bg-teal-50 text-teal-700",
  Rejected: "border-rose-200 bg-rose-50 text-rose-700",
};

const nextActionByStage: Partial<
  Record<CandidateStage, { status: CandidateStage; label: string }>
> = {
  Recommended: { status: "Shortlisted", label: "Shortlist" },
  Shortlisted: { status: "Interview", label: "Set Interview" },
  Interview: { status: "Offer", label: "Offer" },
  Offer: { status: "Hire", label: "Hire" },
};

const getInitials = (name: string) =>
  name
    .split(" ")
    .map((part) => part[0] ?? "")
    .join("")
    .slice(0, 2)
    .toUpperCase();

const monthsToText = (months: number | undefined) => {
  if (!months || months <= 0) return "Not available";
  const years = Math.floor(months / 12);
  const remainder = months % 12;

  if (years > 0 && remainder > 0) return `${years}y ${remainder}m`;
  if (years > 0) return `${years} years`;
  return `${remainder} months`;
};

const SectionCard = ({ title, children }: { title: string; children: ReactNode }) => (
  <Card className="p-4 sm:p-5">
    <h3 className="border-b border-zinc-200 pb-2 text-[1.05rem] font-semibold text-zinc-800">
      {title}
    </h3>
    <div className="pt-3">{children}</div>
  </Card>
);

const WorkExperienceCard = ({ role }: { role: ParsedResumeWorkExperienceDto }) => (
  <article className="rounded-xl border border-zinc-200 bg-zinc-50/40 p-4">
    <div className="flex flex-wrap items-start justify-between gap-2">
      <div>
        <h4 className="text-md font-semibold text-zinc-800 capitalize">{role.job_title || "Experience"}</h4>
        <p className="text-sm text-zinc-500 capitalize">{role.company || "Company not provided"}</p>
      </div>
      <span className="text-sm text-zinc-500">  
        {[role.start_date, role.end_date].filter(Boolean).join(" - ") || "Date not available"}
      </span>
    </div>

    {role.bullets?.length ? (
      <ul className="mt-3 list-disc space-y-1 pl-6 text-sm text-zinc-700">
        {role.bullets.map((bullet) => (
          <li key={bullet}>{bullet}</li>
        ))}
      </ul>
    ) : null}

    {role.technologies?.length ? (
      <div className="mt-3 flex flex-wrap gap-2">
        {role.technologies.map((tech) => (
          <span
            key={`${role.job_title}-${tech}`}
            className="rounded-md border border-zinc-300 bg-white px-2.5 py-1 text-xs text-zinc-700"
          >
            {tech}
          </span>
        ))}
      </div>
    ) : null}
  </article>
);

const ProjectCard = ({ project }: { project: ParsedResumeProjectDto }) => (
  <article className="rounded-xl border border-zinc-200 p-4">
    <h4 className="text-md font-semibold text-zinc-800">{project.name || "Untitled project"}</h4>

    {project.technologies?.length ? (
      <div className="mt-1 flex flex-wrap gap-2">
        {project.technologies.map((tech) => (
          <span
            key={`${project.name}-${tech}`}
            className="rounded-md border border-zinc-300 bg-zinc-100 px-2.5 py-1 text-xs text-zinc-700"
          >
            {tech}
          </span>
        ))}
      </div>
    ) : null}

    {project.description ? <p className="mt-1 text-sm text-zinc-600">{project.description}</p> : null}


    {project.bullets?.length ? (
      <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-zinc-700">
        {project.bullets.map((bullet) => (
          <li key={bullet}>{bullet}</li>
        ))}
      </ul>
    ) : null}

  </article>
);

export const CandidateDetailPage = () => {
  const { candidate: loaderCandidate } = useLoaderData() as {
    candidate: ApplicantDetailDto;
  };

  const [candidate, setCandidate] = useState(loaderCandidate);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [isInterviewOpen, setIsInterviewOpen] = useState(false);
  const [isOfferOpen, setIsOfferOpen] = useState(false);
  const [pendingAction, setPendingAction] = useState<PendingAction>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [interviewForm, setInterviewForm] = useState({
    date: "",
    time: "",
    mode: "Virtual",
    location: "",
    notes: "",
  });

  const [offerForm, setOfferForm] = useState({
    role: candidate.job_title,
    packageSummary: "",
    startDate: "",
    message: "",
  });

  const { showToast } = useToast();
  const revalidator = useRevalidator();

  const parsedResume = candidate.parsed_resume_json;
  const personalInfo = parsedResume?.personal_info;

  const primaryAction = useMemo(
    () => nextActionByStage[candidate.submission_status],
    [candidate.submission_status],
  );

  const runStageTransition = async (
    status: CandidateStage,
    successTitle: string,
    successDescription: string,
  ) => {
    try {
      setIsSubmitting(true);
      await recruiterService.updateApplicantStatuses([candidate.resume_submission_id], status);
      setCandidate((current) => ({ ...current, submission_status: status }));

      showToast({
        title: successTitle,
        description: successDescription,
        tone: "success",
      });

      revalidator.revalidate();
    } catch {
      showToast({
        title: "Action failed",
        description: "Unable to update candidate stage. Please try again.",
        tone: "error",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="grid gap-4 xl:grid-cols-[280px_minmax(0,1fr)_290px]">
      <Card className="h-fit p-0 overflow-hidden">
        <div className="bg-linear-to-b from-slate-50 to-white px-5 py-6">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-linear-to-br from-slate-400 to-slate-600 text-3xl font-bold text-white shadow-md">
            {getInitials(candidate.applicant_name)}
          </div>
          <h2 className="mt-4 text-center text-md font-bold text-zinc-900">
            {candidate.applicant_name}
          </h2>
          <p className="text-center text-sm text-zinc-500">
            {personalInfo?.job_target || candidate.job_title}
          </p>

          <div className="mt-4 space-y-2 border-t border-zinc-200 pt-4 text-sm text-zinc-700">
            <p className="flex items-center gap-2"><Mail className="h-4 w-4 text-zinc-400" /> {candidate.applicant_email}</p>
            <p className="flex items-center gap-2"><Phone className="h-4 w-4 text-zinc-400" /> {personalInfo?.phone || "Not available"}</p>
            <p className="flex items-center gap-2"><MapPin className="h-4 w-4 text-zinc-400" /> {personalInfo?.location || "Location not provided"}</p>
          </div>

          <div className="mt-4 space-y-3 border-t border-zinc-200 pt-4">
            <div className="flex items-center justify-between text-sm">
              <span className="text-zinc-500">ATS Score</span>
              <span className="font-semibold text-zinc-800">{candidate.score}%</span>
            </div>
            <div className="h-2 rounded-full bg-zinc-200">
              <div className="h-2 rounded-full bg-linear-to-r from-zinc-800 to-gray-700" style={{ width: `${Math.max(10, Math.min(100, candidate.score))}%` }} />
            </div>
            <p className="text-xs text-zinc-500 capitalize">
              {parsedResume?.derived?.education_max_level || "Education level unknown"} · {monthsToText(parsedResume?.derived?.total_experience_months)} experience
            </p>
          </div>

          {primaryAction ? (
            <button
              type="button"
              onClick={() => {
                if (candidate.submission_status === "Shortlisted") {
                  setIsInterviewOpen(true);
                } else if (candidate.submission_status === "Interview") {
                  setIsOfferOpen(true);
                } else {
                  setPendingAction("primary");
                  setIsConfirmOpen(true);
                }
              }}
              className="mt-5 w-full rounded-lg bg-zinc-900 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-zinc-600"
            >
              {primaryAction.label}
            </button>
          ) : null}
        </div>
      </Card>

      <div className="space-y-4">
        <SectionCard title="Professional Summary">
          {parsedResume?.summary?.length ? (
            <p className="text-sm leading-7 text-zinc-700">{parsedResume.summary.join(" ")}</p>
          ) : (
            <p className="text-sm text-zinc-500">No summary extracted from parsed resume.</p>
          )}
        </SectionCard>

        <SectionCard title="Skills">
          {parsedResume?.skills?.length ? (
            <div className="flex flex-wrap gap-2">
              {parsedResume.skills.map((skill) => (
                <span key={skill} className="rounded-md border border-zinc-300 bg-zinc-100 px-3 py-1 text-xs font-medium text-zinc-700">
                  {skill}
                </span>
              ))}
            </div>
          ) : (
            <p className="text-sm text-zinc-500">No skills extracted.</p>
          )}
        </SectionCard>

        <SectionCard title="Work Experience">
          {parsedResume?.work_experience?.length ? (
            <div className="space-y-3">
              {parsedResume.work_experience.map((role, index) => (
                <WorkExperienceCard key={`${role.job_title}-${index}`} role={role} />
              ))}
            </div>
          ) : (
            <p className="text-sm text-zinc-500">No work experience extracted.</p>
          )}
        </SectionCard>

        <SectionCard title="Projects">
          {parsedResume?.projects?.length ? (
            <div className="grid gap-3 lg:grid-cols-1">
              {parsedResume.projects.map((project, index) => (
                <ProjectCard key={`${project.name}-${index}`} project={project} />
              ))}
            </div>
          ) : (
            <p className="text-sm text-zinc-500">No projects extracted.</p>
          )}
        </SectionCard>
      </div>

      <div className="space-y-4">
        <SectionCard title="Application Info">
          <ul className="space-y-2 text-sm">
            <li className="flex items-center justify-between"><span className="text-zinc-500">Applied:</span> <span className="font-semibold text-zinc-800">{new Date(candidate.created_at_utc).toLocaleDateString()}</span></li>
            <li className="flex items-center justify-between"><span className="text-zinc-500">Stage:</span> <span className={`rounded-md border px-2 py-0.5 text-xs font-semibold ${stageBadgeClass[candidate.submission_status]}`}>{candidate.submission_status}</span></li>
            <li className="flex items-center justify-between"><span className="text-zinc-500">ATS Score:</span> <span className="font-semibold text-zinc-800">{candidate.score}</span></li>
          </ul>
        </SectionCard>

        <SectionCard title="Resume Information">
          <div className="space-y-2 text-sm">
            <p className="text-zinc-600">Resume ID: <span className="font-semibold text-zinc-800">{candidate.resume_submission_id.slice(0, 8)}</span></p>
            <p className="text-zinc-600">Parsed: <span className="font-semibold text-emerald-600">Successfully</span></p>
            <button type="button" className="mt-2 flex w-full items-center justify-center gap-2 rounded-lg bg-zinc-800 px-3 py-2 text-sm font-semibold text-white hover:bg-gray-600">
              <Download className="h-4 w-4" /> Download Resume
            </button>
          </div>
        </SectionCard>

        <SectionCard title="Recruiter Actions">
          <div className="space-y-2">
            <p className="flex items-center gap-2 text-sm text-zinc-600"><BriefcaseBusiness className="h-4 w-4" /> {candidate.job_title}</p>
            {candidate.submission_status !== "Rejected" && candidate.submission_status !== "Hire" ? (
              <button
                type="button"
                onClick={() => {
                  setPendingAction("reject");
                  setIsConfirmOpen(true);
                }}
                className="w-full rounded-lg border border-rose-300 bg-white px-4 py-2 text-sm font-semibold text-rose-700 transition hover:bg-rose-50"
              >
                Reject Candidate
              </button>
            ) : (
              <p className={`rounded-md border px-2 py-1 text-sm font-semibold ${stageBadgeClass[candidate.submission_status]}`}>
                {candidate.submission_status === "Hire" ? "Candidate hired" : "Candidate rejected"}
              </p>
            )}
          </div>
        </SectionCard>

        <SectionCard title="Education">
          {parsedResume?.education?.length ? (
            <div className="space-y-2 text-sm">
              {parsedResume.education.map((item, index) => (
                <div key={`${item.degree}-${index}`} className="rounded-lg border border-zinc-200 p-3">
                  <p className="flex items-center gap-2 font-semibold text-zinc-800 "><GraduationCap className="h-4 w-4" /> {item.degree || "Education"}</p>
                  <p className="mt-1 text-zinc-500">{[item.start_date, item.end_date].filter(Boolean).join(" - ") || "Date not available"}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-zinc-500">No education extracted.</p>
          )}
        </SectionCard>
      </div>

      <ConfirmationModal
        open={isConfirmOpen}
        title={pendingAction === "primary" ? `Confirm ${primaryAction?.label}` : "Reject candidate"}
        message={
          pendingAction === "primary"
            ? `Move ${candidate.applicant_name} to ${primaryAction?.status} stage?`
            : `Are you sure you want to reject ${candidate.applicant_name}?`
        }
        confirmLabel={pendingAction === "primary" ? primaryAction?.label : "Reject"}
        accent={pendingAction === "primary" ? "green" : "red"}
        loading={isSubmitting}
        onClose={() => {
          setIsConfirmOpen(false);
          setPendingAction(null);
        }}
        onCancel={() => {
          setIsConfirmOpen(false);
          setPendingAction(null);
        }}
        onConfirm={async () => {
          setIsConfirmOpen(false);
          const action = pendingAction;
          setPendingAction(null);

          if (action === "primary" && primaryAction) {
            await runStageTransition(
              primaryAction.status,
              `Candidate ${primaryAction.label.toLowerCase()} successfully`,
              `${candidate.applicant_name} is now in ${primaryAction.status} stage.`,
            );
            return;
          }

          await runStageTransition(
            "Rejected",
            "Candidate rejected",
            `${candidate.applicant_name} has been marked as rejected.`,
          );
        }}
      />

      {isInterviewOpen ? (
        <ModalOverlay onClose={() => setIsInterviewOpen(false)}>
          <form
            className="space-y-3 rounded-2xl bg-white p-5 shadow-2xl ring-1 ring-violet-200"
            onSubmit={async (event) => {
              event.preventDefault();
              await runStageTransition(
                "Interview",
                "Interview scheduled successfully",
                "Candidate moved to interview stage.",
              );
              setIsInterviewOpen(false);
            }}
          >
            <h3 className="text-lg font-semibold">Set Interview</h3>
            <div className="grid grid-cols-2 gap-2">
              <input
                required
                type="date"
                className="rounded-lg border border-zinc-300 px-3 py-2 text-sm"
                value={interviewForm.date}
                onChange={(event) =>
                  setInterviewForm((s) => ({ ...s, date: event.target.value }))
                }
              />
              <input
                required
                type="time"
                className="rounded-lg border border-zinc-300 px-3 py-2 text-sm"
                value={interviewForm.time}
                onChange={(event) =>
                  setInterviewForm((s) => ({ ...s, time: event.target.value }))
                }
              />
            </div>
            <input
              required
              className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm"
              placeholder="Mode (Virtual/Onsite)"
              value={interviewForm.mode}
              onChange={(event) =>
                setInterviewForm((s) => ({ ...s, mode: event.target.value }))
              }
            />
            <input
              required
              className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm"
              placeholder="Meeting link/location"
              value={interviewForm.location}
              onChange={(event) =>
                setInterviewForm((s) => ({ ...s, location: event.target.value }))
              }
            />
            <textarea
              className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm"
              rows={3}
              placeholder="Notes (optional)"
              value={interviewForm.notes}
              onChange={(event) =>
                setInterviewForm((s) => ({ ...s, notes: event.target.value }))
              }
            />
            <div className="flex justify-end gap-2">
              <button
                type="button"
                className="rounded-lg border border-zinc-300 px-4 py-2 text-sm font-semibold"
                onClick={() => setIsInterviewOpen(false)}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="rounded-lg bg-zinc-800 px-4 py-2 text-sm font-semibold text-white"
              >
                Confirm Interview
              </button>
            </div>
          </form>
        </ModalOverlay>
      ) : null}

      {isOfferOpen ? (
        <ModalOverlay onClose={() => setIsOfferOpen(false)}>
          <form
            className="space-y-3 rounded-2xl bg-white p-5 shadow-2xl ring-1 ring-violet-200"
            onSubmit={async (event) => {
              event.preventDefault();
              await runStageTransition(
                "Offer",
                "Offer sent successfully",
                "Candidate moved to offer stage.",
              );
              setIsOfferOpen(false);
            }}
          >
            <h3 className="text-lg font-semibold z-100">Create Offer</h3>
            <input
              required
              className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm"
              placeholder="Role/title"
              value={offerForm.role}
              onChange={(event) =>
                setOfferForm((s) => ({ ...s, role: event.target.value }))
              }
            />
            <input
              required
              className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm"
              placeholder="Compensation/package summary"
              value={offerForm.packageSummary}
              onChange={(event) =>
                setOfferForm((s) => ({ ...s, packageSummary: event.target.value }))
              }
            />
            <input
              required
              type="date"
              className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm"
              value={offerForm.startDate}
              onChange={(event) =>
                setOfferForm((s) => ({ ...s, startDate: event.target.value }))
              }
            />
            <textarea
              className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm"
              rows={3}
              placeholder="Message (optional)"
              value={offerForm.message}
              onChange={(event) =>
                setOfferForm((s) => ({ ...s, message: event.target.value }))
              }
            />
            <div className="flex justify-end gap-2">
              <button
                type="button"
                className="rounded-lg border border-zinc-300 px-4 py-2 text-sm font-semibold"
                onClick={() => setIsOfferOpen(false)}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="rounded-lg bg-zinc-800 px-4 py-2 text-sm font-semibold text-white"
              >
                Send Offer
              </button>
            </div>
          </form>
        </ModalOverlay>
      ) : null}
    </div>
  );
};