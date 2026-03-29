/* eslint-disable react-hooks/set-state-in-effect */
import { useEffect, useMemo, useState } from "react";
import { Link, useLoaderData } from "react-router-dom";
import { Search } from "lucide-react";
import { Card } from "@shared/components/Card";
import { SearchField } from "@features/jobseeker/components";
import { useApplications } from "@features/jobseeker/hooks";
import type { ApplicationsLoaderData } from "@features/jobseeker/types";
import { ApplicationsEmptyState } from "@features/jobseeker/pages/ApplicationsPage/components/ApplicationsEmptyState";
import { ApplicationListSkeleton } from "@features/jobseeker/pages/ApplicationsPage/components/ApplicationListSkeleton";
import { ApplicationsTable } from "@features/jobseeker/pages/ApplicationsPage/components/ApplicationsTable";
import { TablePageSizeControl } from "@shared/components/ui/data-table/TablePageSizeControl";
import { TablePagination } from "@shared/components/ui/data-table/TablePagination";

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

  return (
    <Card className="min-h-screen rounded-none border-0 bg-transparent p-0 shadow-none">
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
            className="inline-flex text-sm font-medium text-zinc-700 underline-offset-4 hover:underline dark:text-zinc-300"
          >
            View archived histories
          </Link>
        </div>

        <div className="grid w-full min-w-0 grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-5">
          <div>
            <label className="mb-1.5 block text-xs font-medium uppercase tracking-[0.08em] text-zinc-500 dark:text-zinc-400">
              Search
            </label>
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400 dark:text-zinc-500" />
              <SearchField
                ariaLabel="Search applications"
                placeholder="Search job title or company"
                value={search}
                onChange={handleSearchChange}
                className="h-11 w-full min-w-0 border border-zinc-200 bg-white pl-9 pr-3.5 text-sm text-zinc-700 outline-none transition placeholder:text-zinc-400 hover:border-zinc-300 focus:border-zinc-400 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100 dark:placeholder:text-zinc-500 dark:hover:border-zinc-600 dark:focus:border-zinc-500 xl:col-span-4"
              />
            </div>
          </div>

          <div className="min-w-0 xl:col-span-1">
            <label className="mb-1.5 block text-xs font-medium uppercase tracking-[0.08em] text-zinc-500 dark:text-zinc-400">
              Status
            </label>
            <select
              name="status"
              value={status}
              className="h-11 w-full border border-zinc-200 bg-white px-3.5 text-sm text-zinc-700 outline-none transition hover:border-zinc-300 focus:border-zinc-400 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:border-zinc-600 dark:focus:border-zinc-500"
              onChange={(event) => handleStatusChange(event.target.value)}
            >
              {currentStatusOptions.map((option) => (
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
            <div className="border-b border-zinc-200 px-4 py-3 text-sm text-rose-600 dark:border-zinc-800 dark:text-rose-400">
              {error}
            </div>
          ) : null}

          {isLoading ? (
            <div className="p-4">
              <ApplicationListSkeleton />
            </div>
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
                  void withdraw(applicationId);
                }}
                onArchiveHistory={(applicationId) => {
                  void archiveHistory(applicationId);
                }}
                onDeleteHistory={(applicationId) => {
                  void deleteHistory(applicationId);
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
        </section>
      </div>
    </Card>
  );
};
