import { useMemo, useState } from "react";
import { useLoaderData } from "react-router-dom";
import { Card } from "@shared/components/Card";
import Dropdown, { type DropdownOption } from "@shared/components/Dropdown";
import { SearchField } from "@features/jobseeker/components";
import { useApplications } from "@features/jobseeker/hooks";
import type { ApplicationsLoaderData } from "@features/jobseeker/types";

const statusOptions: DropdownOption[] = [
  { value: "", label: "All statuses" },
  { value: "Applied", label: "Applied" },
  { value: "Interview", label: "Interview" },
  { value: "Hire", label: "Hire" },
  { value: "Rejected", label: "Rejected" },
  { value: "Withdrawn", label: "Withdrawn" },
];

const badgeClassByStatus: Record<string, string> = {
  Applied: "bg-blue-50 text-blue-700",
  Interview: "bg-violet-50 text-violet-700",
  Hire: "bg-emerald-50 text-emerald-700",
  Rejected: "bg-rose-50 text-rose-700",
  Withdrawn: "bg-zinc-100 text-zinc-700",
};

export const ApplicationsPage = () => {
  const initialData = useLoaderData() as ApplicationsLoaderData;
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const { data, withdrawingId, withdraw } = useApplications({
    initialData,
    search,
    status,
  });

  const currentStatusOptions = useMemo(() => statusOptions, []);

  return (
    <Card className="min-h-screen space-y-4">
      <h2 className="text-2xl font-semibold">Applications</h2>
      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <label className="mb-1.5 block text-xs font-medium text-zinc-600">
            Search
          </label>
          <SearchField
            ariaLabel="Search applications"
            placeholder="Search job/company"
            value={search}
            onChange={setSearch}
          />
        </div>
        <Dropdown
          label="Status"
          name="status"
          value={status}
          options={currentStatusOptions}
          onChange={(event) => setStatus(event.target.value)}
        />
      </div>
      {data.items.length === 0 ? (
        <p className="text-zinc-500">No applications found.</p>
      ) : (
        <ul className="space-y-3">
          {data.items.map((item) => {
            const itemId = String(item.id);
            const itemStatus = String(item.status);

            return (
              <li key={itemId} className="rounded-lg border border-zinc-200 p-3">
                <p className="font-medium text-zinc-900">
                  {String(item.job_title)}
                </p>
                <p className="text-sm text-zinc-500">
                  {String(item.company)} ·{" "}
                  {new Date(String(item.created_at_utc)).toLocaleDateString()}
                </p>
                <div className="mt-2 flex flex-wrap gap-2">
                  <span
                    className={`rounded px-2 py-1 text-xs ${
                      badgeClassByStatus[itemStatus] ??
                      "bg-zinc-100 text-zinc-700"
                    }`}
                  >
                    {itemStatus}
                  </span>
                  <button
                    type="button"
                    disabled={withdrawingId === itemId}
                    className="rounded border border-zinc-300 px-2 py-1 text-xs disabled:cursor-not-allowed disabled:opacity-60"
                    onClick={() => {
                      void withdraw(itemId);
                    }}
                  >
                    {withdrawingId === itemId ? "Withdrawing..." : "Withdraw"}
                  </button>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </Card>
  );
};
