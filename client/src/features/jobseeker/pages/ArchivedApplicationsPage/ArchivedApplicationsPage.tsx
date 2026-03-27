import { ArchiveRestore, Loader2, Search, Trash2 } from "lucide-react";
import { Link, useLoaderData } from "react-router-dom";

import { Card } from "@shared/components/Card";
import { useApplications } from "@features/jobseeker/hooks";
import type { ApplicationsLoaderData } from "@features/jobseeker/types";
import { ApplicationsPagination } from "@features/jobseeker/pages/ApplicationsPage/components/ApplicationsPagination";
import { ApplicationStatusBadge } from "@features/jobseeker/pages/ApplicationsPage/components/ApplicationStatusBadge";
import { useEffect, useState } from "react";

export const ArchivedApplicationsPage = () => {
  const initialData = useLoaderData() as ApplicationsLoaderData;
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [pageNumber, setPageNumber] = useState(initialData.pageNumber);
  const [pageSize, setPageSize] = useState(initialData.pageSize);
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

  return (
    <Card className="min-h-screen rounded-none border-0 bg-transparent p-0 shadow-none">
      <div className="space-y-6">
        <div className="space-y-2">
          <h2 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-100">
            Archived Histories
          </h2>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            Review application history entries you archived and restore any item back to your active list.
          </p>
          <Link
            to="/applications"
            className="inline-flex text-sm font-medium text-zinc-700 underline-offset-4 hover:underline dark:text-zinc-300"
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

        <section className="border-y border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950/40">
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
              <div className="overflow-x-auto">
                <table className="min-w-full table-fixed">
                  <thead className="bg-zinc-50/80 dark:bg-zinc-900/70">
                    <tr className="border-b border-zinc-200 dark:border-zinc-800">
                      <th className="w-[40%] px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.12em] text-zinc-500 dark:text-zinc-400">Job</th>
                      <th className="w-[18%] px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.12em] text-zinc-500 dark:text-zinc-400">Applied</th>
                      <th className="w-[18%] px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.12em] text-zinc-500 dark:text-zinc-400">Status</th>
                      <th className="w-[24%] px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.12em] text-zinc-500 dark:text-zinc-400">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.items.map((item) => {
                      const itemId = String(item.id);
                      const isRestoring = unarchivingId === itemId;
                      const isDeleting = deletingHistoryId === itemId;

                      return (
                        <tr key={itemId} className="border-b border-zinc-200 transition-colors hover:bg-zinc-50/80 dark:border-zinc-800 dark:hover:bg-zinc-900/60">
                          <td className="px-4 py-4 align-top">
                            <div className="space-y-1">
                              <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">{item.job_title}</p>
                              <p className="text-sm text-zinc-500 dark:text-zinc-400">{item.company_name ?? item.company}</p>
                            </div>
                          </td>
                          <td className="px-4 py-4 align-top text-sm font-medium text-zinc-800 dark:text-zinc-200">
                            {new Date(String(item.created_at_utc)).toLocaleDateString()}
                          </td>
                          <td className="px-4 py-4 align-top">
                            <ApplicationStatusBadge status={String(item.status)} />
                          </td>
                          <td className="px-4 py-4 align-top">
                            <div className="flex flex-wrap items-center gap-2">
                              <button
                                type="button"
                                disabled={isRestoring || isDeleting}
                                onClick={() => {
                                  void unarchiveHistory(itemId);
                                }}
                                className="inline-flex items-center justify-center rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm font-semibold text-zinc-700 transition hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-60 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200 dark:hover:bg-zinc-800"
                              >
                                {isRestoring ? <Loader2 className="h-4 w-4 animate-spin" /> : <ArchiveRestore className="h-4 w-4" />}
                                <span className="sr-only">Restore history</span>
                              </button>
                              <button
                                type="button"
                                disabled={isDeleting || isRestoring}
                                onClick={() => {
                                  void deleteHistory(itemId);
                                }}
                                className="inline-flex items-center justify-center rounded-lg border border-rose-300 bg-white px-3 py-2 text-sm font-semibold text-rose-700 transition hover:bg-rose-50 disabled:cursor-not-allowed disabled:opacity-60 dark:border-rose-900/70 dark:bg-zinc-900 dark:text-rose-300 dark:hover:bg-rose-950/40"
                              >
                                {isDeleting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                                <span className="sr-only">Delete history</span>
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              <ApplicationsPagination
                pageNumber={data.pageNumber}
                pageSize={data.pageSize}
                totalCount={data.totalCount}
                totalPages={data.totalPages}
                onPageChange={setPageNumber}
                onPageSizeChange={(value) => {
                  setPageSize(value);
                  setPageNumber(1);
                }}
              />
            </>
          )}
        </section>
      </div>
    </Card>
  );
};
