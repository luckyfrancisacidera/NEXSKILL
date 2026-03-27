import { Archive, Eye, Loader2, Trash2, Undo2 } from "lucide-react";
import { Link } from "react-router-dom";
import type { JobseekerApplicationDto } from "@features/jobseeker/types";
import { ApplicationStatusBadge } from "@features/jobseeker/pages/ApplicationsPage/components/ApplicationStatusBadge";
import { getJobseekerListActions } from "@features/jobseeker/utils/applicationActionRules";
import { ActionButton, actionButtonClassName } from "@shared/components/ActionButton";

type ApplicationsTableProps = {
  items: JobseekerApplicationDto[];
  withdrawingId: string | null;
  archivingId: string | null;
  deletingHistoryId: string | null;
  onWithdraw: (applicationId: string) => void;
  onArchiveHistory: (applicationId: string) => void;
  onDeleteHistory: (applicationId: string) => void;
};

const formatAppliedDate = (value: string) =>
  new Date(value).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

export const ApplicationsTable = ({
  items,
  withdrawingId,
  archivingId,
  deletingHistoryId,
  onWithdraw,
  onArchiveHistory,
  onDeleteHistory,
}: ApplicationsTableProps) => (
  <div className="overflow-x-auto">
    <table className="min-w-full table-fixed">
      <thead className="bg-zinc-50/80 dark:bg-zinc-900/70">
        <tr className="border-b border-zinc-200 dark:border-zinc-800">
          <th className="w-[40%] px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.12em] text-zinc-500 dark:text-zinc-400">
            Job
          </th>
          <th className="w-[18%] px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.12em] text-zinc-500 dark:text-zinc-400">
            Applied
          </th>
          <th className="w-[18%] px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.12em] text-zinc-500 dark:text-zinc-400">
            Status
          </th>
          <th className="w-[24%] px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.12em] text-zinc-500 dark:text-zinc-400">
            Actions
          </th>
        </tr>
      </thead>
      <tbody>
        {items.map((item) => {
          const itemId = String(item.id);
          const isWithdrawing = withdrawingId === itemId;
          const isArchiving = archivingId === itemId;
          const isDeletingHistory = deletingHistoryId === itemId;
          const actions = getJobseekerListActions(item.current_stage ?? item.status, "applications");

          return (
            <tr
              key={itemId}
              className="border-b border-zinc-200 transition-colors hover:bg-zinc-50/80 dark:border-zinc-800 dark:hover:bg-zinc-900/60"
            >
              <td className="px-4 py-4 align-top">
                <div className="space-y-1">
                  <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                    {String(item.job_title)}
                  </p>
                  <p className="text-sm text-zinc-500 dark:text-zinc-400">
                    {String(item.company_name ?? item.company)}
                  </p>
                </div>
              </td>
              <td className="px-4 py-4 align-top">
                <div className="space-y-1">
                  <p className="text-sm font-medium text-zinc-800 dark:text-zinc-200">
                    {formatAppliedDate(String(item.created_at_utc))}
                  </p>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400">
                    Submitted application
                  </p>
                </div>
              </td>
              <td className="px-4 py-4 align-top">
                <ApplicationStatusBadge status={String(item.status)} />
              </td>
              <td className="px-4 py-4 align-top">
                <div className="flex flex-wrap items-center gap-2">
                  {actions.includes("view_job") ? (
                    <Link
                      to={`/jobs/${String(item.job_id)}`}
                      title="View job"
                      aria-label="View job"
                      className={actionButtonClassName({ iconOnly: true })}
                    >
                      <Eye className="h-4 w-4" />
                      <span className="sr-only">View job</span>
                    </Link>
                  ) : null}
                  {actions.includes("withdraw") ? (
                    <ActionButton
                      icon={isWithdrawing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Undo2 className="h-4 w-4" />}
                      label={
                        isWithdrawing
                          ? "Withdrawing application"
                          : "Withdraw application"
                      }
                      iconOnly
                      disabled={isWithdrawing || isDeletingHistory}
                      onClick={() => onWithdraw(itemId)}
                    />
                  ) : null}
                  <ActionButton
                    icon={isArchiving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Archive className="h-4 w-4" />}
                    label="Archive history"
                    iconOnly
                    disabled={isArchiving || isDeletingHistory || isWithdrawing}
                    onClick={() => onArchiveHistory(itemId)}
                  />
                  {actions.includes("delete_history") ? (
                    <ActionButton
                      icon={isDeletingHistory ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                      label="Delete history"
                      destructive
                      iconOnly
                      disabled={isDeletingHistory || isWithdrawing}
                      onClick={() => onDeleteHistory(itemId)}
                    />
                  ) : null}
                </div>
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  </div>
);
