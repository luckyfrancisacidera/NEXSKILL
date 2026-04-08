import { useNavigate, useLoaderData, useSearchParams } from "react-router-dom";
import { Card } from "@shared/components/data-display/Card";
import { DashboardPageHeader } from "@shared/components/layout/DashboardPrimitives";
import { AdminMetricCard } from "@features/admin/components/AdminMetricCard";
import { AdminCompanyRequestsTableCard } from "@features/admin/components/AdminCompanyRequestsTableCard";
import type { SuperAdminCompanyRequestsPageDto } from "@features/admin/types/admin.type";

export const SuperAdminCompanyRequestsPage = () => {
  const data = useLoaderData() as SuperAdminCompanyRequestsPageDto;
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  const buildQuery = (updates: Record<string, string>) => {
    const next = new URLSearchParams(searchParams);
    Object.entries(updates).forEach(([key, value]) => {
      next.set(key, value);
    });
    return `?${next.toString()}`;
  };

  const statusCounts = {
    pending: data.requests.items.filter((item) => item.status === "PendingReview").length,
    approved: data.requests.items.filter((item) => item.status === "Approved").length,
  };

  return (
    <div className="space-y-6">
      <DashboardPageHeader
        eyebrow="Super Admin"
        title="Company request review"
        description="Review incoming tenant requests, inspect submitted documents inline, and approve or reject access with a single queue."
      />

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <AdminMetricCard label="Requests on page" value={data.requests.items.length} accent="border-sky-200 bg-sky-50 text-sky-700 dark:border-sky-900 dark:bg-sky-900/30 dark:text-sky-400" />
        <AdminMetricCard label="Pending on page" value={statusCounts.pending} accent="border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-900 dark:bg-amber-900/30 dark:text-amber-300" />
        <Card className="rounded-2xl border border-zinc-200 bg-white p-3.5 shadow-sm dark:border-zinc-800 dark:bg-zinc-950 sm:p-5">
          <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400 sm:text-sm">Total requests</p>
          <p className="mt-2 text-xl font-semibold text-zinc-950 dark:text-zinc-100 sm:mt-3 sm:text-2xl">{data.requests.totalCount}</p>
        </Card>
      </section>

      <div className="flex flex-wrap gap-2">
        {["", "PendingReview", "Approved", "Rejected"].map((value) => (
          <button
            key={value || "all"}
            type="button"
            onClick={() => {
              const next = new URLSearchParams(searchParams);
              if (value) {
                next.set("status", value);
              } else {
                next.delete("status");
              }
              next.set("page", "1");
              setSearchParams(next);
            }}
            className={`rounded-full px-3 py-1.5 text-sm ${
              data.filters.status === value
                ? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900"
                : "bg-zinc-100 text-zinc-700 dark:bg-zinc-900 dark:text-zinc-300"
            }`}
          >
            {value || "All"}
          </button>
        ))}
      </div>

      <AdminCompanyRequestsTableCard
        requests={data.requests}
        getPageHref={(page) => buildQuery({ page: String(page) })}
        onPageSizeChange={(nextPageSize) => navigate(buildQuery({ pageSize: nextPageSize, page: "1" }))}
      />
    </div>
  );
};

export default SuperAdminCompanyRequestsPage;
