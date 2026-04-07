/* eslint-disable react-hooks/set-state-in-effect */
import { useEffect, useMemo, useState } from "react";
import { ArchiveRestore, Loader2, Search } from "lucide-react";
import { Link, useLoaderData } from "react-router-dom";

import { ActionButton } from "@shared/components/actions/ActionButton";
import { Card } from "@shared/components/data-display/Card";
import { RichTextContent } from "@shared/components/data-display/RichTextContent";
import { SideDrawer } from "@shared/components/overlay/SideDrawer";
import { DataTable } from "@shared/components/data-display/data-table/DataTable";
import { IdentityCell } from "@shared/components/data-display/data-table/IdentityCell";
import { TablePagination } from "@shared/components/data-display/data-table/TablePagination";
import { TablePageSizeControl } from "@shared/components/data-display/data-table/TablePageSizeControl";
import type { DataTableColumn } from "@shared/components/data-display/data-table/table-types";
import { useConfirmation } from "@shared/hooks/useConfirmation";
import { downloadInterviewICS } from "@shared/utils/calendar";
import { emitNotification } from "@shared/utils/notifications";
import { interviewStatusChipClassName } from "@shared/utils/interviewStatus";
import { useArchivedInterviews } from "@features/jobseeker/hooks/useArchivedInterviews";
import type {
  JobseekerArchivedInterviewsLoaderData,
  JobseekerInterview,
} from "@features/jobseeker/types";

const statusOptions = [
  { value: "", label: "All statuses" },
  { value: "Completed", label: "Completed" },
  { value: "Cancelled", label: "Cancelled" },
  { value: "Declined", label: "Declined" },
] as const;

const formatInterviewDate = (value: string) =>
  new Date(value).toLocaleString(undefined, {
    weekday: "long",
    month: "long",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });

const formatArchivedDate = (value?: string) =>
  value
    ? new Date(value).toLocaleDateString(undefined, {
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    : "Unavailable";

export const ArchivedInterviewsPage = () => {
  const initialData = useLoaderData() as JobseekerArchivedInterviewsLoaderData;
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [pageNumber, setPageNumber] = useState(initialData.pageNumber);
  const [pageSize, setPageSize] = useState(initialData.pageSize);
  const [selectedInterview, setSelectedInterview] = useState<JobseekerInterview | null>(null);
  const confirm = useConfirmation();
  const {
    data,
    error,
    isLoading,
    unarchivingId,
    unarchive,
  } = useArchivedInterviews({
    initialData,
    pageNumber,
    pageSize,
    search,
    status,
  });

  useEffect(() => {
    setPageNumber(data.pageNumber);
  }, [data.pageNumber]);

  const hasFilters = useMemo(
    () => search.trim().length > 0 || status.length > 0,
    [search, status],
  );

  const columns: Array<DataTableColumn<JobseekerInterview>> = [
    {
      id: "interview",
      header: "Interview",
      cell: (interview) => (
        <button
          type="button"
          onClick={() => setSelectedInterview(interview)}
          className="space-y-1 text-left"
        >
          <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
            {interview.jobTitle || interview.companyName || "Interview"}
          </p>
          <p className="text-xs text-zinc-500 dark:text-zinc-400">
            {interview.companyName || "Company unavailable"}
          </p>
        </button>
      ),
      accessor: (interview) => interview.jobTitle || interview.companyName || "Interview",
      sortable: true,
      sortType: "string",
      widthClassName: "min-w-[240px]",
    },
    {
      id: "recruiter",
      header: "Recruiter",
      cell: (interview) => (
        <IdentityCell
          name={interview.recruiterName || "Recruiter"}
          email={interview.recruiterEmail || "Contact unavailable"}
        />
      ),
      accessor: (interview) => interview.recruiterName || interview.recruiterEmail || "",
      sortable: true,
      sortType: "string",
      widthClassName: "min-w-[220px]",
    },
    {
      id: "scheduled",
      header: "Scheduled",
      cell: (interview) =>
        new Date(interview.scheduledDate).toLocaleDateString(undefined, {
          month: "short",
          day: "numeric",
          year: "numeric",
        }),
      accessor: (interview) => new Date(interview.scheduledDate),
      sortable: true,
      sortType: "date",
    },
    {
      id: "status",
      header: "Status",
      cell: (interview) => (
        <span
          className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${interviewStatusChipClassName[interview.status]}`}
        >
          {interview.status}
        </span>
      ),
      accessor: (interview) => interview.status,
      sortable: true,
      sortType: "string",
    },
    {
      id: "archived",
      header: "Archived",
      cell: (interview) => formatArchivedDate(interview.archivedAt),
      accessor: (interview) => interview.archivedAt ? new Date(interview.archivedAt) : null,
      sortable: true,
      sortType: "date",
    },
    {
      id: "actions",
      header: "Actions",
      align: "right",
      cell: (interview) => {
        const isRestoring = unarchivingId === interview.id;

        return (
          <ActionButton
            icon={isRestoring ? <Loader2 className="h-4 w-4 animate-spin" /> : <ArchiveRestore className="h-4 w-4" />}
            label="Unarchive interview"
            iconOnly
            disabled={isRestoring}
            onClick={() => void handleUnarchive(interview)}
          />
        );
      },
      cellClassName: "w-[72px]",
    },
  ];

  const handleDownloadCalendar = async (id: string) => {
    try {
      await downloadInterviewICS(id, "jobseeker");
      emitNotification({
        title: "Calendar download ready",
        description: "Your interview calendar invite has been downloaded.",
        actor: "jobseeker",
      });
    } catch (downloadError) {
      emitNotification({
        title: "Calendar download failed",
        description:
          downloadError instanceof Error
            ? downloadError.message
            : "Unable to download the interview calendar right now.",
        actor: "jobseeker",
      });
    }
  };

  const handleUnarchive = async (interview: JobseekerInterview) => {
    const confirmed = await confirm({
      title: "Restore interview",
      message: "Move this interview back into your active schedule?",
      confirmLabel: "Unarchive",
      accent: "green",
    });

    if (!confirmed) {
      return;
    }

    const restored = await unarchive(interview.id);
    if (!restored) {
      return;
    }

    if (selectedInterview?.id === interview.id) {
      setSelectedInterview(null);
    }
    emitNotification({
      title: "Interview restored",
      description: "The interview has been moved back to your active schedule.",
      actor: "jobseeker",
    });
  };

  return (
    <Card className="min-h-screen rounded-none border-0 bg-transparent p-0 shadow-none">
      <div className="space-y-6">
        <div className="space-y-2">
          <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100 sm:text-2xl">
            Archived Interviews
          </h2>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            Review interviews you archived and restore any item back into your active calendar.
          </p>
          <Link
            to="/jobseeker/interviews"
            className="inline-flex items-center rounded-full border border-zinc-300 bg-zinc-100 px-4 py-2 text-sm font-semibold text-zinc-800 shadow-sm transition hover:border-zinc-400 hover:bg-zinc-200 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 dark:hover:border-zinc-600 dark:hover:bg-zinc-800"
          >
            Back to active interviews
          </Link>
        </div>

        <div className="grid w-full min-w-0 grid-cols-1 gap-3 sm:grid-cols-2">
          <div>
            <label className="mb-1.5 block text-xs font-medium uppercase tracking-[0.08em] text-zinc-500 dark:text-zinc-400">
              Search
            </label>
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400 dark:text-zinc-500" />
              <input
                value={search}
                onChange={(event) => {
                  setSearch(event.target.value);
                  setPageNumber(1);
                }}
                placeholder="Search role, recruiter, or company"
                className="h-11 w-full border border-zinc-200 bg-white pl-9 pr-3.5 text-sm text-zinc-700 outline-none transition placeholder:text-zinc-400 hover:border-zinc-300 focus:border-zinc-400 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
              />
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-medium uppercase tracking-[0.08em] text-zinc-500 dark:text-zinc-400">
              Status
            </label>
            <select
              value={status}
              onChange={(event) => {
                setStatus(event.target.value);
                setPageNumber(1);
              }}
              className="h-11 w-full border border-zinc-200 bg-white px-3.5 text-sm text-zinc-700 outline-none transition hover:border-zinc-300 focus:border-zinc-400 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-300"
            >
              {statusOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <section className="overflow-hidden rounded-[28px] border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950/40">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-zinc-200 px-4 py-4 dark:border-zinc-800">
            <div>
              <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                Archived interview history
              </p>
              <p className="text-sm text-zinc-500 dark:text-zinc-400">
                {data.totalCount} archived interviews
              </p>
            </div>
            {isLoading ? (
              <p className="text-sm text-zinc-500 dark:text-zinc-400">Updating results...</p>
            ) : null}
            <TablePageSizeControl
              value={data.pageSize}
              onChange={(value) => {
                setPageSize(value);
                setPageNumber(1);
              }}
              className="ml-auto"
            />
          </div>

          {error ? (
            <div className="border-b border-zinc-200 px-4 py-3 text-sm text-rose-600 dark:border-zinc-800 dark:text-rose-400">
              {error}
            </div>
          ) : null}

          {data.items.length === 0 ? (
            <div className="px-6 py-12 text-center text-sm text-zinc-500 dark:text-zinc-400">
              {hasFilters
                ? "No archived interviews match the current filters."
                : "No archived interviews yet."}
            </div>
          ) : (
            <>
              <DataTable
                data={data.items}
                columns={columns}
                getRowKey={(interview) => interview.id}
                loading={isLoading}
                loadingRowCount={6}
                surfaceClassName="border-0"
              />

              <TablePagination
                page={data.pageNumber}
                pageSize={data.pageSize}
                totalCount={data.totalCount}
                totalPages={data.totalPages}
                onPageChange={setPageNumber}
                itemLabel="archived interviews"
                showPageSizeSelector={false}
              />
            </>
          )}
        </section>
      </div>

      <SideDrawer
        open={Boolean(selectedInterview)}
        title={selectedInterview?.jobTitle || selectedInterview?.companyName || "Archived interview"}
        description="Review archived interview details."
        onClose={() => setSelectedInterview(null)}
        widthClassName="sm:max-w-[480px]"
      >
        {selectedInterview ? (
          <div className="space-y-5">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                  {formatInterviewDate(selectedInterview.scheduledDate)}
                </p>
                {selectedInterview.jobTitle ? (
                  <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
                    Role: {selectedInterview.jobTitle}
                  </p>
                ) : null}
                <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
                  Archived {formatArchivedDate(selectedInterview.archivedAt)}
                </p>
              </div>
              <span
                className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${interviewStatusChipClassName[selectedInterview.status]}`}
              >
                {selectedInterview.status}
              </span>
            </div>

            <div className="space-y-3 rounded-2xl border border-zinc-200 bg-zinc-50/70 p-4 dark:border-zinc-800 dark:bg-zinc-900/60">
              {selectedInterview.recruiterName ? (
                <p className="text-sm text-zinc-700 dark:text-zinc-200">
                  Recruiter: <span className="font-medium">{selectedInterview.recruiterName}</span>
                </p>
              ) : null}
              {selectedInterview.companyName ? (
                <p className="text-sm text-zinc-700 dark:text-zinc-200">
                  Company: <span className="font-medium">{selectedInterview.companyName}</span>
                </p>
              ) : null}
              {selectedInterview.recruiterEmail ? (
                <p className="text-sm text-zinc-700 dark:text-zinc-200">
                  Contact: <span className="font-medium">{selectedInterview.recruiterEmail}</span>
                </p>
              ) : null}
              {selectedInterview.meetingLink ? (
                <a
                  href={selectedInterview.meetingLink}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex text-sm font-medium text-zinc-900 underline-offset-4 hover:underline dark:text-zinc-100"
                >
                  Join meeting link
                </a>
              ) : selectedInterview.location ? (
                <p className="text-sm text-zinc-700 dark:text-zinc-200">
                  Location: <span className="font-medium">{selectedInterview.location}</span>
                </p>
              ) : null}
            </div>

            {selectedInterview.message ? (
              <div className="rounded-2xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-950">
                <p className="text-xs font-semibold uppercase tracking-wide text-zinc-400 dark:text-zinc-500">
                  Recruiter note
                </p>
                <RichTextContent
                  html={selectedInterview.message}
                  className="mt-2"
                />
              </div>
            ) : null}

            {selectedInterview.cancelReason ? (
              <div className="rounded-2xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm text-zinc-600 dark:border-zinc-800 dark:bg-zinc-900/60 dark:text-zinc-300">
                Cancellation reason: {selectedInterview.cancelReason}
              </div>
            ) : null}

            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                className="rounded-full border border-zinc-300 bg-white px-4 py-2 text-sm font-semibold text-zinc-700 transition hover:bg-zinc-100 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 dark:hover:bg-zinc-800"
                onClick={() => void handleDownloadCalendar(selectedInterview.id)}
              >
                Add To Calendar
              </button>
              <button
                type="button"
                disabled={unarchivingId === selectedInterview.id}
                className="rounded-full bg-zinc-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-white"
                onClick={() => void handleUnarchive(selectedInterview)}
              >
                Unarchive
              </button>
            </div>
          </div>
        ) : null}
      </SideDrawer>
    </Card>
  );
};
