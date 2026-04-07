/* eslint-disable react-hooks/set-state-in-effect */
import { ArchiveRestore, Loader2, Search, Trash2 } from "lucide-react";
import { Link, useLoaderData } from "react-router-dom";

import { useToast } from "@app/providers/ToastProvider";
import { Card } from "@shared/components/data-display/Card";
import { ActionButton } from "@shared/components/actions/ActionButton";
import { JobTitleCell } from "@shared/components/data-display/JobTitleCell";
import { DataTable } from "@shared/components/data-display/data-table/DataTable";
import { TablePagination } from "@shared/components/data-display/data-table/TablePagination";
import { TablePageSizeControl } from "@shared/components/data-display/data-table/TablePageSizeControl";
import type { DataTableColumn } from "@shared/components/data-display/data-table/table-types";
import { useApplications } from "@features/jobseeker/hooks";
import type { ApplicationsLoaderData } from "@features/jobseeker/types";
import { ApplicationStatusBadge } from "@features/jobseeker/pages/ApplicationsPage/components/ApplicationStatusBadge";
import { useEffect, useState } from "react";
import { useConfirmation } from "@shared/hooks/useConfirmation";
import {
  getApplicationActionConfirmation,
  hasExistingActiveOffer,
} from "@features/jobseeker/utils/applicationActionConfirmation";

export const ArchivedApplicationsPage = () => {
  const initialData = useLoaderData() as ApplicationsLoaderData;
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [pageNumber, setPageNumber] = useState(initialData.pageNumber);
  const [pageSize, setPageSize] = useState(initialData.pageSize);
  const confirm = useConfirmation();
  const { showToast } = useToast();
  const {
    data,
    error,
    isLoading,
    unarchivingId,
    deletingHistoryId,
    unarchiveHistory,
    deleteHistory,
  } = useApplications({
    initialData,
    pageNumber,
    pageSize,
    search,
    status,
    archivedOnly: true,
  });

  useEffect(() => {
    setPageNumber(data.pageNumber);
  }, [data.pageNumber]);

  const handleDeleteHistory = async (applicationId: string) => {
    const application = data.items.find((item) => item.id === applicationId);
    if (!application) {
      return;
    }

    const isConfirmed = await confirm(
      getApplicationActionConfirmation("delete", hasExistingActiveOffer(application)),
    );
    if (!isConfirmed) {
      return;
    }

    try {
      await deleteHistory(applicationId);
      showToast({
        title: "History deleted",
        description: `${application.job_title} was removed from your archived history.`,
        tone: "success",
      });
    } catch (nextError) {
      showToast({
        title: "Delete failed",
        description:
          nextError instanceof Error
            ? nextError.message
            : "Unable to remove this item from your history right now.",
        tone: "error",
      });
    }
  };

  const handleRestoreHistory = async (applicationId: string) => {
    const application = data.items.find((item) => item.id === applicationId);
    if (!application) {
      return;
    }

    try {
      await unarchiveHistory(applicationId);
      showToast({
        title: "History restored",
        description: `${application.job_title} is back in your active applications.`,
        tone: "success",
      });
    } catch (nextError) {
      showToast({
        title: "Restore failed",
        description:
          nextError instanceof Error
            ? nextError.message
            : "Unable to restore this history entry right now.",
        tone: "error",
      });
    }
  };

  const columns: Array<DataTableColumn<ApplicationsLoaderData["items"][number]>> = [
    {
      id: "job",
      header: "Job",
      cell: (item) => (
        <JobTitleCell
          title={item.job_title}
          subtitle={item.company_name ?? item.company}
        />
      ),
      accessor: (item) => item.job_title,
      sortable: true,
      sortType: "string",
      widthClassName: "min-w-[240px]",
    },
    {
      id: "applied",
      header: "Applied",
      cell: (item) => new Date(String(item.created_at_utc)).toLocaleDateString(),
      accessor: (item) => new Date(String(item.created_at_utc)),
      sortable: true,
      sortType: "date",
    },
    {
      id: "status",
      header: "Status",
      cell: (item) => <ApplicationStatusBadge status={String(item.status)} />,
      accessor: (item) => item.status,
      sortable: true,
      sortType: "string",
    },
    {
      id: "actions",
      header: "Actions",
      align: "right",
      widthClassName: "min-w-[168px]",
      cell: (item) => {
        const itemId = String(item.id);
        const isRestoring = unarchivingId === itemId;
        const isDeleting = deletingHistoryId === itemId;

        return (
          <div className="flex flex-nowrap items-center justify-end gap-2 whitespace-nowrap">
            <ActionButton
              icon={isRestoring ? <Loader2 className="h-4 w-4 animate-spin" /> : <ArchiveRestore className="h-4 w-4" />}
              label="Restore history"
              iconOnly
              disabled={isRestoring || isDeleting}
              onClick={() => {
                void handleRestoreHistory(itemId);
              }}
            />
            <ActionButton
              icon={isDeleting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
              label="Delete history"
              destructive
              iconOnly
              disabled={isDeleting || isRestoring}
              onClick={() => {
                void handleDeleteHistory(itemId);
              }}
            />
          </div>
        );
      },
      headerClassName: "w-[168px] whitespace-nowrap",
      cellClassName: "w-[168px] whitespace-nowrap",
    },
  ];

  return (
    <Card className="min-h-screen rounded-none border-0 bg-transparent p-0 shadow-none">
      <div className="space-y-6">
        <div className="space-y-2">
          <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100 sm:text-2xl">
            Archived Histories
          </h2>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            Review application history entries you archived and restore any item back to your active list.
          </p>
          <Link
            to="/applications"
            className="inline-flex items-center rounded-full border border-zinc-300 bg-zinc-100 px-4 py-2 text-sm font-semibold text-zinc-800 shadow-sm transition hover:border-zinc-400 hover:bg-zinc-200 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 dark:hover:border-zinc-600 dark:hover:bg-zinc-800"
          >
            Back to application history
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
                placeholder="Search job title or company"
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
              <option value="">All statuses</option>
              <option value="Applied">Applied</option>
              <option value="Under Review">Under Review</option>
              <option value="Shortlisted">Shortlisted</option>
              <option value="Interview">Interview</option>
              <option value="Offer">Offer</option>
              <option value="Hired">Hired</option>
              <option value="Rejected">Rejected</option>
              <option value="Withdrawn">Withdrawn</option>
            </select>
          </div>
        </div>

        <section className="overflow-hidden rounded-[28px] border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950/40">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-zinc-200 px-4 py-4 dark:border-zinc-800">
            <div>
              <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                Archived application history
              </p>
              <p className="text-sm text-zinc-500 dark:text-zinc-400">
                {data.totalCount} archived entries
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
              No archived histories found.
            </div>
          ) : (
            <>
              <DataTable
                data={data.items}
                columns={columns}
                getRowKey={(item) => String(item.id)}
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
                itemLabel="archived entries"
                showPageSizeSelector={false}
              />
            </>
          )}
        </section>
      </div>
    </Card>
  );
};
