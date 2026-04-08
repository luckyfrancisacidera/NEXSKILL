import { useLoaderData } from "react-router-dom";
import { Card } from "@shared/components/data-display/Card";
import { Progress } from "@shared/components/feedback/Progress";
import type { CompanySubscriptionSummaryDto } from "@features/admin/types/admin.type";

const usagePercent = (used: number, max?: number | null) => {
  if (!max || max <= 0) return used > 0 ? 100 : 0;
  return Math.min(100, Math.round((used / max) * 100));
};

export const CompanyAdminBillingPage = () => {
  const data = useLoaderData() as CompanySubscriptionSummaryDto;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-100">Billing & Subscription</h1>
        <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">Monitor plan status, company-wide usage, and remaining trial or billing time.</p>
      </div>

      <Card className="space-y-4 bg-zinc-950 text-zinc-100 dark:bg-zinc-100 dark:text-zinc-900">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.25em] text-zinc-400 dark:text-zinc-600">{data.isTrial ? "Free Trial" : "Current Plan"}</p>
            <h2 className="mt-2 text-3xl font-semibold">{data.planName}</h2>
            <p className="mt-2 text-sm text-zinc-300 dark:text-zinc-700">{data.isExpired ? "Expired" : `${data.daysRemaining} days left`}</p>
          </div>
          <div className={`rounded-full px-3 py-1 text-sm ${data.isExpired ? "bg-red-500/15 text-red-200 dark:bg-red-500/10 dark:text-red-700" : "bg-white/10 text-zinc-100 dark:bg-zinc-900/10 dark:text-zinc-900"}`}>
            {data.status}
          </div>
        </div>
        <Progress value={data.isExpired ? 100 : Math.min(100, Math.max(5, 100 - Math.max(0, data.daysRemaining * 5)))} />
        <p className="text-sm text-zinc-300 dark:text-zinc-700">{data.restrictionMessage ?? "Your company subscription is active."}</p>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="space-y-3">
          <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">Active Job Posts</p>
          <p className="text-3xl font-semibold text-zinc-900 dark:text-zinc-100">{data.activeJobPostsUsed}{data.activeJobPostsMax ? ` / ${data.activeJobPostsMax}` : ""}</p>
          <Progress value={usagePercent(data.activeJobPostsUsed, data.activeJobPostsMax)} />
          <p className="text-sm text-zinc-500 dark:text-zinc-400">{data.usageSharedNoteJobPosts}</p>
        </Card>

        <Card className="space-y-3">
          <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">Resume Screenings</p>
          <p className="text-3xl font-semibold text-zinc-900 dark:text-zinc-100">{data.screeningsUsed}{data.screeningsMax ? ` / ${data.screeningsMax}` : ""}</p>
          <Progress value={usagePercent(data.screeningsUsed, data.screeningsMax)} />
          <p className="text-sm text-zinc-500 dark:text-zinc-400">{data.usageSharedNoteScreenings}</p>
        </Card>
      </div>

      <Card className="space-y-3">
        <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">{data.isTrial ? "Upgrade Path" : data.isExpired ? "Renew Access" : "Plan Notes"}</p>
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          {data.isTrial
            ? "Analytics remain locked during the free trial. Upgrade to Basic, Standard, or Premium to unlock full analytics and higher shared company limits."
            : data.isExpired
              ? "Historical data stays available in restricted mode, but creating job posts, activating jobs, and running screenings remain blocked until renewal or upgrade."
              : "Usage is enforced company-wide across all recruiters. Recruiters share the same active job and screening allocation."}
        </p>
        <div className="flex flex-wrap gap-3">
          {data.canUpgrade ? <a href="/company-account-request" className="rounded-2xl bg-zinc-900 px-4 py-3 text-sm font-medium text-white dark:bg-zinc-100 dark:text-zinc-900">{data.isExpired ? "Renew or Upgrade" : "Upgrade Plan"}</a> : null}
          {data.isExpired ? <a href="/company-account-request" className="rounded-2xl border border-zinc-300 px-4 py-3 text-sm font-medium text-zinc-700 dark:border-zinc-700 dark:text-zinc-300">Renew Access</a> : null}
        </div>
      </Card>
    </div>
  );
};

export default CompanyAdminBillingPage;
