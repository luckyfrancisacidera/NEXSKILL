import {
  BadgeCheck,
  CalendarDays,
  CircleDollarSign,
  ClipboardList,
  Crown,
  Eye,
  Gem,
  Sparkles,
} from "lucide-react";
import { Link } from "react-router-dom";
import { iconActionButtonClassName } from "@shared/components/actions";
import { Badge } from "@shared/components/data-display/Badge";
import { DataTable } from "@shared/components/data-display/data-table/DataTable";
import { TablePagination } from "@shared/components/data-display/data-table/TablePagination";
import { TablePageSizeControl } from "@shared/components/data-display/data-table/TablePageSizeControl";
import type { CompanyRequestListItemDto, Paged } from "@features/admin/types/admin.type";

const submittedAtFormatter = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  year: "numeric",
});

const getPlanMeta = (planId: string) => {
  switch (planId) {
    case "free-trial":
      return { icon: Sparkles, label: "Free Trial", className: "bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300" };
    case "basic":
      return { icon: CircleDollarSign, label: "Basic", className: "bg-sky-50 text-sky-700 dark:bg-sky-900/30 dark:text-sky-300" };
    case "standard":
      return { icon: Crown, label: "Standard", className: "bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300" };
    case "premium":
      return { icon: Gem, label: "Premium", className: "bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300" };
    default:
      return { icon: ClipboardList, label: planId, className: "bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300" };
  }
};

const getBillingMeta = (billingCycle?: string | null) => {
  if (!billingCycle) {
    return { label: "Trial", icon: Sparkles };
  }

  return {
    label: billingCycle === "Annual" ? "Annual" : "Monthly",
    icon: CalendarDays,
  };
};

const getStatusMeta = (status: string) => {
  switch (status) {
    case "PendingReview":
      return "bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300";
    case "Approved":
      return "bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300";
    case "Rejected":
      return "bg-rose-50 text-rose-700 dark:bg-rose-900/30 dark:text-rose-300";
    default:
      return "bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300";
  }
};

interface AdminCompanyRequestsTableCardProps {
  requests: Paged<CompanyRequestListItemDto>;
  getPageHref: (page: number) => string;
  onPageSizeChange: (nextPageSize: string) => void;
}

export const AdminCompanyRequestsTableCard = ({
  requests,
  getPageHref,
  onPageSizeChange,
}: AdminCompanyRequestsTableCardProps) => (
  <section className="min-w-0 border-y border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950">
    <div className="flex flex-wrap items-start justify-between gap-3 border-b border-zinc-200 px-4 py-4 dark:border-zinc-800 sm:px-6">
      <div className="min-w-0 flex-1">
        <h2 className="text-lg font-semibold text-zinc-950 dark:text-zinc-100">Company Requests</h2>
        <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-200">Review requests, plans, billing choices, and approval state from one queue.</p>
      </div>
      <div className="ml-auto flex w-full flex-wrap items-center justify-between gap-2 sm:w-auto sm:justify-end">
        <Badge>{requests.totalCount} total</Badge>
        <TablePageSizeControl value={requests.pageSize} onChange={(pageSize) => onPageSizeChange(String(pageSize))} />
      </div>
    </div>
    <DataTable
      data={requests.items}
      getRowKey={(request) => request.id}
      surfaceClassName="border-0"
      emptyState={(
        <div className="px-4 py-10 text-center text-sm text-zinc-500 dark:text-zinc-400">
          No company requests found.
        </div>
      )}
      columns={[
        {
          id: "company",
          header: "Company",
          cell: (request) => (
            <div className="space-y-1">
              <p className="text-sm font-semibold text-zinc-950 dark:text-zinc-100">{request.companyName}</p>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">{request.primaryAdminEmail}</p>
            </div>
          ),
          accessor: (request) => request.companyName,
          sortable: true,
          sortType: "string",
          widthClassName: "min-w-[220px]",
        },
        {
          id: "plan",
          header: "Plan",
          cell: (request) => {
            const meta = getPlanMeta(request.requestedPlanId);
            const Icon = meta.icon;
            return (
              <span className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold ${meta.className}`}>
                <Icon className="h-3.5 w-3.5" />
                {request.requestedPlanName ?? meta.label}
              </span>
            );
          },
          accessor: (request) => request.requestedPlanName ?? request.requestedPlanId,
          sortable: true,
          sortType: "string",
        },
        {
          id: "billing",
          header: "Billing",
          cell: (request) => {
            const meta = getBillingMeta(request.billingCycle);
            const Icon = meta.icon;
            return (
              <span className="inline-flex items-center gap-2 text-sm text-zinc-700 dark:text-zinc-300">
                <Icon className="h-4 w-4 text-zinc-500 dark:text-zinc-400" />
                {meta.label}
              </span>
            );
          },
          accessor: (request) => request.billingCycle ?? "Trial",
          sortable: true,
          sortType: "string",
        },
        {
          id: "submitted",
          header: "Submitted",
          cell: (request) => submittedAtFormatter.format(new Date(request.submittedAtUtc)),
          accessor: (request) => new Date(request.submittedAtUtc),
          sortable: true,
          sortType: "date",
        },
        {
          id: "reviewState",
          header: "State",
          cell: (request) => (
            <span className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold ${getStatusMeta(request.status)}`}>
              <BadgeCheck className="h-3.5 w-3.5" />
              {request.status === "PendingReview" ? "Pending" : request.status}
            </span>
          ),
          accessor: (request) => request.status,
          sortable: true,
          sortType: "string",
        },
        {
          id: "actions",
          header: "Actions",
          align: "right",
          cell: (request) => (
            <Link
              to={`/admin/super/company-requests/${request.id}`}
              aria-label={`Review ${request.companyName}`}
              title={`Review ${request.companyName}`}
              className={iconActionButtonClassName("neutral")}
            >
              <Eye className="h-4 w-4" />
            </Link>
          ),
          cellClassName: "w-[72px]",
        },
      ]}
    />
    <TablePagination
      page={requests.pageNumber}
      totalPages={requests.totalPages}
      totalCount={requests.totalCount}
      pageSize={requests.pageSize}
      getPageHref={getPageHref}
      itemLabel="requests"
      className="px-4 sm:px-6"
      showPageSizeSelector={false}
    />
  </section>
);
