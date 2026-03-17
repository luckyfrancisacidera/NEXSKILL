import { Link } from "react-router-dom";
import type { JobseekerApplicationDto } from "@features/jobseeker/types";
import { ApplicationStatusBadge } from "@features/jobseeker/pages/ApplicationsPage/components/ApplicationStatusBadge";

type ApplicationsTableProps = {
  items: JobseekerApplicationDto[];
  withdrawingId: string | null;
  onWithdraw: (applicationId: string) => void;
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
  onWithdraw,
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
                  <Link
                    to={`/jobs/${String(item.job_id)}`}
                    className="inline-flex h-9 items-center border border-zinc-200 px-3 text-sm font-medium text-zinc-700 transition hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
                  >
                    View job
                  </Link>
                  <button
                    type="button"
                    disabled={isWithdrawing || String(item.status) === "Withdrawn"}
                    className="inline-flex h-9 items-center border border-zinc-200 px-3 text-sm font-medium text-zinc-700 transition hover:bg-zinc-50 disabled:cursor-not-allowed disabled:text-zinc-400 disabled:hover:bg-transparent dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800 dark:disabled:text-zinc-600"
                    onClick={() => onWithdraw(itemId)}
                  >
                    {isWithdrawing ? "Withdrawing..." : "Withdraw"}
                  </button>
                </div>
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  </div>
);
