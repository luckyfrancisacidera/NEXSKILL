import { useState } from "react";
import type { ReactElement, ReactNode } from "react";
import { useLoaderData, useNavigate } from "react-router-dom";
import { useToast } from "@app/providers/ToastProvider";
import { adminService } from "@features/admin/service/admin.service";
import type { CompanyRequestDetailDto } from "@features/admin/types/admin.type";
import { ApiError } from "@shared/api/http";
import { RichTextEditor } from "@shared/components/form/RichTextEditor";
import { plainTextToRichText, richTextToPlainText } from "@shared/utils/richText";
import {
  ArrowLeft,
  Building2,
  User,
  FileText,
  Globe,
  MapPin,
  Phone,
  Mail,
  Briefcase,
  Users,
  CheckCircle,
  XCircle,
  Clock,
  CreditCard,
} from "lucide-react";

const StatusBadge = ({ status }: { status: string }) => {
  const styles: Record<string, string> = {
    PendingReview:
      "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-800/50",
    Approved:
      "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-800/50",
    Rejected:
      "bg-red-50 text-red-700 border-red-200 dark:bg-red-950/40 dark:text-red-400 dark:border-red-800/50",
  };

  const icons: Record<string, ReactElement> = {
    PendingReview: <Clock className="h-3 w-3" />,
    Approved: <CheckCircle className="h-3 w-3" />,
    Rejected: <XCircle className="h-3 w-3" />,
  };

  const labels: Record<string, string> = {
    PendingReview: "Pending Review",
    Approved: "Approved",
    Rejected: "Rejected",
  };

  const style = styles[status] ?? "bg-zinc-100 text-zinc-600 border-zinc-200 dark:bg-zinc-800 dark:text-zinc-400 dark:border-zinc-700";

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium ${style}`}
    >
      {icons[status]}
      {labels[status] ?? status}
    </span>
  );
};

const SectionBlock = ({
  icon,
  title,
  children,
}: {
  icon: ReactElement;
  title: string;
  children: ReactNode;
}) => (
  <div className="rounded-2xl border border-zinc-200/80 bg-white p-6 shadow-sm dark:border-zinc-800/80 dark:bg-zinc-900">
    <div className="mb-5 flex items-center gap-2.5">
      <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-zinc-100 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400">
        {icon}
      </div>
      <h2 className="text-xs font-semibold uppercase tracking-widest text-zinc-400 dark:text-zinc-500">
        {title}
      </h2>
    </div>
    {children}
  </div>
);

const InfoRow = ({
  icon,
  children,
}: {
  icon?: ReactElement;
  children: ReactNode;
}) => (
  <div className="flex items-start gap-2.5">
    {icon && (
      <span className="mt-0.5 shrink-0 text-zinc-400 dark:text-zinc-500">
        {icon}
      </span>
    )}
    <span className="text-sm leading-relaxed text-zinc-700 dark:text-zinc-300">
      {children}
    </span>
  </div>
);

export const SuperAdminCompanyRequestDetailsPage = () => {
  const { showToast } = useToast();
  const initial = useLoaderData() as CompanyRequestDetailDto;
  const navigate = useNavigate();
  const [data, setData] = useState(initial);
  const [notes, setNotes] = useState(plainTextToRichText(initial.reviewNotes));
  const [isSaving, setIsSaving] = useState(false);

  const review = async (approve: boolean) => {
    setIsSaving(true);
    try {
      const normalizedNotes = richTextToPlainText(notes);
      const updated = await adminService.reviewCompanyRequest(data.id, {
        approve,
        reviewNotes: normalizedNotes || undefined,
      });
      setData(updated);
      setNotes(plainTextToRichText(updated.reviewNotes));
      showToast({
        title: approve ? "Approval email sent" : "Rejection email sent",
        description: approve
          ? `The request for ${updated.companyName} was approved and the company admin invitation email was sent.`
          : `The request for ${updated.companyName} was rejected and a notification email was sent to the primary admin.`,
        tone: "success",
      });
    } catch (error) {
      showToast({
        title: approve ? "Approval failed" : "Rejection failed",
        description: error instanceof ApiError
          ? error.message
          : "We couldn't complete this review action right now.",
        tone: "error",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const isPending = data.status === "PendingReview";

  return (
    <div className="min-h-screen space-y-6 px-0">
      {/* ── Header ── */}
      <div className="rounded-2xl border border-zinc-200/80 bg-white px-6 py-5 shadow-sm dark:border-zinc-800/80 dark:bg-zinc-900">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex flex-col gap-3">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="inline-flex w-fit items-center gap-1.5 rounded-lg border border-zinc-200 bg-white px-3 py-1.5 text-xs font-medium text-zinc-600 shadow-sm transition-colors hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              Back
            </button>
            <div>
              <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
                {data.companyName}
              </h1>
              <div className="mt-2 flex flex-wrap items-center gap-2">
                <StatusBadge status={data.status} />
                <span className="text-zinc-300 dark:text-zinc-600">·</span>
                <span className="inline-flex items-center gap-1.5 text-sm text-zinc-500 dark:text-zinc-400">
                  <CreditCard className="h-3.5 w-3.5" />
                  {data.requestedPlanName}
                </span>
                <span className="text-zinc-300 dark:text-zinc-600">·</span>
                <span className="text-sm text-zinc-500 dark:text-zinc-400">
                  {data.billingCycle ?? "Trial"}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Main grid ── */}
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_420px] xl:grid-cols-[minmax(0,1fr)_480px]">
        {/* ── Left column ── */}
        <div className="space-y-5">
          {/* Company Overview */}
          <SectionBlock
            icon={<Building2 className="h-4 w-4" />}
            title="Company Overview"
          >
            <div className="space-y-3">
              <InfoRow>
                <span className="font-medium text-zinc-900 dark:text-zinc-100">
                  {data.businessName}
                </span>
              </InfoRow>
              <InfoRow icon={<Briefcase className="h-4 w-4" />}>
                {data.industry}
                <span className="mx-1.5 text-zinc-300 dark:text-zinc-600">
                  ·
                </span>
                <span className="inline-flex items-center gap-1">
                  <Users className="h-3.5 w-3.5 text-zinc-400" />
                  {data.companySize}
                </span>
              </InfoRow>
              {data.fullAddress && (
                <InfoRow icon={<MapPin className="h-4 w-4" />}>
                  {data.fullAddress}
                </InfoRow>
              )}
              {data.websiteUrl && (
                <InfoRow icon={<Globe className="h-4 w-4" />}>
                  <a
                    href={data.websiteUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="break-all text-zinc-900 underline underline-offset-2 hover:text-zinc-600 dark:text-zinc-100 dark:hover:text-zinc-300"
                  >
                    {data.websiteUrl}
                  </a>
                </InfoRow>
              )}
              {data.description && (
                <p className="mt-1 border-t border-zinc-100 pt-3 text-sm leading-relaxed text-zinc-500 dark:border-zinc-800 dark:text-zinc-400">
                  {data.description}
                </p>
              )}
            </div>
          </SectionBlock>

          {/* Primary Admin */}
          <SectionBlock
            icon={<User className="h-4 w-4" />}
            title="Primary Admin"
          >
            <div className="space-y-3">
              <InfoRow>
                <span className="font-medium text-zinc-900 dark:text-zinc-100">
                  {data.primaryAdminFullName}
                </span>
                <span className="mx-1.5 text-zinc-300 dark:text-zinc-600">
                  ·
                </span>
                <span className="text-zinc-500 dark:text-zinc-400">
                  {data.primaryAdminRole}
                </span>
              </InfoRow>
              <InfoRow icon={<Mail className="h-4 w-4" />}>
                {data.primaryAdminEmail}
              </InfoRow>
              <InfoRow icon={<Phone className="h-4 w-4" />}>
                {data.primaryAdminPhone}
              </InfoRow>
            </div>
          </SectionBlock>

          {/* Documents */}
          <SectionBlock
            icon={<FileText className="h-4 w-4" />}
            title="Documents"
          >
            <div className="grid gap-4 md:grid-cols-2">
              {data.documents.map((document) => (
                <div
                  key={document.id}
                  className="overflow-hidden rounded-xl border border-zinc-200 bg-zinc-50 dark:border-zinc-700/80 dark:bg-zinc-800/50"
                >
                  <div className="flex flex-col gap-0.5 border-b border-zinc-200 bg-white px-4 py-3 dark:border-zinc-700/80 dark:bg-zinc-800">
                    <span className="text-xs font-semibold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
                      {document.documentType}
                    </span>
                    <span className="truncate text-sm font-medium text-zinc-700 dark:text-zinc-300">
                      {document.originalFileName}
                    </span>
                  </div>
                  {document.canInlinePreview && document.contentType === "application/pdf" ? (
                    <iframe
                      title={document.originalFileName}
                      src={`/api/company-requests/${data.id}/documents/${document.id}/content`}
                      className="h-72 w-full bg-zinc-50 dark:bg-zinc-900"
                    />
                  ) : document.canInlinePreview && document.contentType.startsWith("image/") ? (
                    <img
                      src={`/api/company-requests/${data.id}/documents/${document.id}/content`}
                      alt={document.originalFileName}
                      className="h-72 w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-72 flex-col items-center justify-center gap-3 px-6 text-center">
                      <p className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                        Preview unavailable for this file type.
                      </p>
                      <a
                        href={`/api/company-requests/${data.id}/documents/${document.id}/content`}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center justify-center rounded-lg border border-zinc-300 px-3 py-2 text-xs font-semibold text-zinc-700 transition hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-200 dark:hover:bg-zinc-800"
                      >
                        Open document
                      </a>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </SectionBlock>
        </div>

        {/* ── Right column – Review panel ── */}
        <div className="lg:sticky lg:top-6 lg:self-start">
          <div className="rounded-2xl border border-zinc-200/80 bg-white shadow-sm dark:border-zinc-800/80 dark:bg-zinc-900">
            {/* Panel header */}
            <div className="border-b border-zinc-100 px-6 py-5 dark:border-zinc-800">
              <h2 className="text-xs font-semibold uppercase tracking-widest text-zinc-400 dark:text-zinc-500">
                Review Decision
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-zinc-500 dark:text-zinc-400">
                Invitation email uses the existing SMTP setup and will be sent
                immediately when you approve.
              </p>
            </div>

            {/* Panel body */}
            <div className="space-y-4 p-6">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
                  Review Notes
                  <span className="ml-1 font-normal text-zinc-400 dark:text-zinc-600">
                    (optional)
                  </span>
                </label>
                <RichTextEditor
                  value={notes}
                  onChange={setNotes}
                  placeholder="Add notes for this review..."
                  className="w-full"
                  minHeightClassName="min-h-[240px]"
                  editorClassName="bg-zinc-50 dark:bg-zinc-950"
                />
              </div>

              <div className="space-y-2.5">
                <button
                  disabled={isSaving || !isPending}
                  type="button"
                  onClick={() => review(true)}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-zinc-900 px-4 py-3 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40 dark:bg-zinc-100 dark:text-zinc-900"
                >
                  <CheckCircle className="h-4 w-4" />
                  Approve Request
                </button>
                <button
                  disabled={isSaving || !isPending}
                  type="button"
                  onClick={() => review(false)}
                  className="flex w-full items-center justify-center gap-2 rounded-xl border border-zinc-200 bg-white px-4 py-3 text-sm font-semibold text-zinc-700 transition-colors hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-40 dark:border-zinc-700 dark:bg-zinc-800/50 dark:text-zinc-300 dark:hover:bg-zinc-800"
                >
                  <XCircle className="h-4 w-4" />
                  Reject Request
                </button>
              </div>

              {!isPending && (
                <p className="text-center text-xs text-zinc-400 dark:text-zinc-600">
                  This request has already been reviewed.
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SuperAdminCompanyRequestDetailsPage;
