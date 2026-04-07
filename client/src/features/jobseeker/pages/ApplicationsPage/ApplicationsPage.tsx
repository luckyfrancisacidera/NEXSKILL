/* eslint-disable react-hooks/set-state-in-effect */
import { useEffect, useMemo, useState } from "react";
import { Link, useLoaderData } from "react-router-dom";
import { Search } from "lucide-react";
import { useToast } from "@app/providers/ToastProvider";
import { Card } from "@shared/components/data-display/Card";
import { useApplications } from "@features/jobseeker/hooks";
import type { ApplicationsLoaderData } from "@features/jobseeker/types";
import { ApplicationsEmptyState } from "@features/jobseeker/pages/ApplicationsPage/components/ApplicationsEmptyState";
import { ApplicationListSkeleton } from "@features/jobseeker/pages/ApplicationsPage/components/ApplicationListSkeleton";
import { ApplicationsTable } from "@features/jobseeker/pages/ApplicationsPage/components/ApplicationsTable";
import { TablePageSizeControl } from "@shared/components/data-display/data-table/TablePageSizeControl";
import { TablePagination } from "@shared/components/data-display/data-table/TablePagination";
import { AppSelect, SearchInput } from "@shared/components/form";
import { useConfirmation } from "@shared/hooks/useConfirmation";
import {
  getApplicationActionConfirmation,
  hasExistingActiveOffer,
  type ApplicationActionType,
} from "@features/jobseeker/utils/applicationActionConfirmation";

const statusOptions = [
  { value: "", label: "All statuses" },
  { value: "Applied", label: "Applied" },
  { value: "Under Review", label: "Under Review" },
  { value: "Shortlisted", label: "Shortlisted" },
  { value: "Interview", label: "Interview" },
  { value: "Offer", label: "Offer" },
  { value: "Hired", label: "Hired" },
  { value: "Rejected", label: "Rejected" },
  { value: "Withdrawn", label: "Withdrawn" },
];

export const ApplicationsPage = () => {
  const initialData = useLoaderData() as ApplicationsLoaderData;
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [pageNumber, setPageNumber] = useState(initialData.pageNumber);
  const [pageSize, setPageSize] = useState(initialData.pageSize);
  const confirm = useConfirmation();
  const { showToast } = useToast();
  const { data, error, isLoading, withdrawingId, archivingId, deletingHistoryId, withdraw, archiveHistory, deleteHistory } = useApplications({
    initialData,
    pageNumber,
    pageSize,
    search,
    status,
    archivedOnly: false,
  });

  const currentStatusOptions = useMemo(() => statusOptions, []);
  const hasFilters = search.trim().length > 0 || status.length > 0;

  useEffect(() => {
    setPageNumber(data.pageNumber);
  }, [data.pageNumber]);

  const handleSearchChange = (value: string) => {
    setSearch(value);
    setPageNumber(1);
  };

  const handleStatusChange = (value: string) => {
    setStatus(value);
    setPageNumber(1);
  };

  const handlePageSizeChange = (value: number) => {
    setPageSize(value);
    setPageNumber(1);
  };

  const handleApplicationAction = async (
    type: ApplicationActionType,
    applicationId: string,
  ) => {
    const application = data.items.find((item) => item.id === applicationId);
    if (!application) {
      return;
    }

    const hasOffer = hasExistingActiveOffer(application);
    const isConfirmed = await confirm(getApplicationActionConfirmation(type, hasOffer));
    if (!isConfirmed) {
      return;
    }

    try {
      if (type === "withdraw") {
        await withdraw(applicationId);
        showToast({
          title: "Application withdrawn",
          description: `${application.job_title} has been withdrawn successfully.`,
          tone: "success",
        });
      } else if (type === "archive") {
        await archiveHistory(applicationId);
        showToast({
          title: "History archived",
          description: `${application.job_title} was moved to your archived histories.`,
          tone: "success",
        });
      } else {
        await deleteHistory(applicationId);
        showToast({
          title: "History deleted",
          description: `${application.job_title} was removed from your application history.`,
          tone: "success",
        });
      }
    } catch (nextError) {
      const description =
        nextError instanceof Error
          ? nextError.message
          : type === "withdraw"
            ? "Unable to withdraw this application right now."
            : type === "archive"
              ? "Unable to archive this history entry right now."
              : "Unable to remove this item from your history right now.";

      showToast({
        title:
          type === "withdraw"
            ? "Withdraw failed"
            : type === "archive"
              ? "Archive failed"
              : "Delete failed",
        description,
        tone: "error",
      });
    }
  };

  return (
    <Card className="border-0 bg-transparent p-0 shadow-none dark:border-0 dark:bg-transparent">
      <div className="space-y-6">
        <div className="space-y-2">
          <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100 sm:text-2xl">
            Applications
          </h2>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            Track your submitted applications, monitor status changes, and jump back into the jobs that matter.
          </p>
          <Link
            to="/applications/archived"
            className="inline-flex items-center rounded-full border border-zinc-300 bg-zinc-100 px-4 py-2 text-sm font-semibold text-zinc-800 shadow-sm transition hover:border-zinc-400 hover:bg-zinc-200 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 dark:hover:border-zinc-600 dark:hover:bg-zinc-800"
          >
            View archived histories
          </Link>
        </div>

        <div className="grid w-full min-w-0 grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-5">
          <div>
            <SearchInput
              label="Search"
              icon={<Search className="h-4 w-4" />}
              ariaLabel="Search applications"
              placeholder="Search job title or company"
              value={search}
              onValueChange={handleSearchChange}
            />
          </div>

          <div className="min-w-0 xl:col-span-1">
            <AppSelect
              label="Status"
              name="status"
              value={status}
              options={currentStatusOptions}
              onChange={(event) => handleStatusChange(event.target.value)}
            />
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
              Application history
            </p>
            <p className="text-sm text-zinc-500 dark:text-zinc-400">
              {data.totalCount} total applications
            </p>
          </div>
          {isLoading ? (
            <p className="text-sm text-zinc-500 dark:text-zinc-400">
              Updating results...
            </p>
          ) : null}
          <TablePageSizeControl value={data.pageSize} onChange={handlePageSizeChange} className="ml-auto" />
        </div>

        {error ? (
          <div className="text-sm text-rose-600 dark:text-rose-400">
            {error}
          </div>
        ) : null}

        {isLoading ? (
          <ApplicationListSkeleton />
        ) : data.items.length === 0 ? (
          <ApplicationsEmptyState hasFilters={hasFilters} />
        ) : (
          <>
            <ApplicationsTable
              items={data.items}
              withdrawingId={withdrawingId}
              archivingId={archivingId}
              deletingHistoryId={deletingHistoryId}
              onWithdraw={(applicationId) => {
                void handleApplicationAction("withdraw", applicationId);
              }}
              onArchiveHistory={(applicationId) => {
                void handleApplicationAction("archive", applicationId);
              }}
              onDeleteHistory={(applicationId) => {
                void handleApplicationAction("delete", applicationId);
              }}
              loading={isLoading}
            />
            <TablePagination
              page={data.pageNumber}
              pageSize={data.pageSize}
              totalCount={data.totalCount}
              totalPages={data.totalPages}
              onPageChange={setPageNumber}
              itemLabel="applications"
              showPageSizeSelector={false}
            />
          </>
        )}
      </div>
    </Card>
  );
};
