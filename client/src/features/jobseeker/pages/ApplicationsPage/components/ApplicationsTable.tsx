import { Archive, Eye, Loader2, Trash2, Undo2 } from "lucide-react";
import { Link } from "react-router-dom";
import type { JobseekerApplicationDto } from "@features/jobseeker/types";
import { ApplicationStatusBadge } from "@features/jobseeker/pages/ApplicationsPage/components/ApplicationStatusBadge";
import { getJobseekerListActions } from "@features/jobseeker/utils/applicationActionRules";
import { ActionButton, actionButtonClassName } from "@shared/components/actions/ActionButton";
import { JobTitleCell } from "@shared/components/data-display/JobTitleCell";
import { DataTable } from "@shared/components/data-display/data-table/DataTable";
import type { DataTableColumn } from "@shared/components/data-display/data-table/table-types";

type ApplicationsTableProps = {
  items: JobseekerApplicationDto[];
  withdrawingId: string | null;
  archivingId: string | null;
  deletingHistoryId: string | null;
  onWithdraw: (applicationId: string) => void;
  onArchiveHistory: (applicationId: string) => void;
  onDeleteHistory: (applicationId: string) => void;
  loading?: boolean;
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
  loading = false,
}: ApplicationsTableProps) => {
  const columns: Array<DataTableColumn<JobseekerApplicationDto>> = [
    {
      id: "job",
      header: "Job",
      cell: (item) => (
        <JobTitleCell
          title={String(item.job_title)}
          subtitle={String(item.company_name ?? item.company)}
          className="min-w-0 max-w-full"
        />
      ),
      accessor: (item) => item.job_title,
      sortable: true,
      sortType: "string",
      cellClassName: "min-w-0",
    },
    {
      id: "applied",
      header: "Applied",
      cell: (item) => (
        <div className="min-w-0 max-w-full space-y-1 overflow-hidden">
          <p className="text-[10px] sm:text-sm font-medium text-zinc-800 dark:text-zinc-200">
            {formatAppliedDate(String(item.created_at_utc))}
          </p>
          <p className="truncate text-xs text-zinc-500 dark:text-zinc-400">
            Submitted application
          </p>
        </div>
      ),
      accessor: (item) => new Date(item.created_at_utc),
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
      cell: (item) => {
        const itemId = String(item.id);
        const isWithdrawing = withdrawingId === itemId;
        const isArchiving = archivingId === itemId;
        const isDeletingHistory = deletingHistoryId === itemId;
        const actions = getJobseekerListActions(item.current_stage ?? item.status, "applications");

        return (
          <div className="flex min-w-0 max-w-full flex-nowrap items-center justify-end gap-2 whitespace-nowrap">
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
                label={isWithdrawing ? "Withdrawing application" : "Withdraw application"}
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
        );
      },
      headerClassName: "whitespace-nowrap",
      cellClassName: "min-w-0 whitespace-nowrap",
    },
  ];

  return (
    <DataTable
      data={items}
      columns={columns}
      getRowKey={(item) => String(item.id)}
      loading={loading}
      loadingRowCount={6}
    />
  );
};

