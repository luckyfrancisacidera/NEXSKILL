import { Search } from "lucide-react";
import { Link, useLoaderData, useSubmit } from "react-router-dom";

import type { HiredEmployeesLoaderData } from "@features/recruiter/types";
import { Card } from "@shared/components/Card";
import { actionButtonClassName } from "@shared/components/ActionButton";

export const HiredEmployeesPage = () => {
  const { employees, pagination, filters } = useLoaderData() as HiredEmployeesLoaderData;
  const submit = useSubmit();

  const submitSearch = (form: HTMLFormElement) => {
    const formData = new FormData(form);
    formData.set("page", "1");
    submit(formData, { method: "get", action: "/recruiter/hired" });
  };

  const buildHref = (page: number) =>
    `?search=${encodeURIComponent(filters.search)}&pageSize=${encodeURIComponent(filters.pageSize)}&page=${page}`;

  return (
    <Card className="dark:border-zinc-800 dark:bg-zinc-950 bg-white">
      <div className="mb-5">
        <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100">My Hires</h2>
        <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
          Candidates who accepted offers and are now part of your completed hires.
        </p>
      </div>

      <form
        className="mb-4"
        onSubmit={(event) => {
          event.preventDefault();
          submitSearch(event.currentTarget);
        }}
      >
        <div className="relative max-w-md">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
          <input
            name="search"
            defaultValue={filters.search}
            placeholder="Search hires by name, job, or department"
            className="h-11 w-full rounded-2xl border border-zinc-200 bg-white pl-9 pr-3.5 text-sm text-zinc-700 outline-none transition placeholder:text-zinc-400 hover:border-zinc-300 focus:border-zinc-500 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-100"
          />
          <input type="hidden" name="pageSize" value={filters.pageSize} />
        </div>
      </form>

      {employees.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-zinc-300 px-6 py-12 text-center text-sm text-zinc-500 dark:border-zinc-700 dark:text-zinc-400">
          No hires yet.
        </div>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-zinc-200 dark:border-zinc-800">
          <table className="min-w-full text-sm">
            <thead className="bg-zinc-100 text-zinc-700 dark:bg-zinc-900 dark:text-zinc-400">
              <tr>
                {["Name", "Date", "Job", "Department", "Offer", "Actions"].map((column) => (
                  <th key={column} className="px-3 py-3 text-left font-semibold">
                    {column}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {employees.map((employee, index) => (
                <tr
                  key={employee.resume_submission_id}
                  className={`border-t border-zinc-100 dark:border-zinc-800 ${index % 2 ? "bg-zinc-50/60 dark:bg-zinc-900/40" : "bg-white dark:bg-zinc-950"}`}
                >
                  <td className="px-3 py-3 font-medium text-zinc-900 dark:text-zinc-100">{employee.employee_name}</td>
                  <td className="px-3 py-3 text-zinc-700 dark:text-zinc-400">{new Date(employee.hire_date_utc).toLocaleDateString()}</td>
                  <td className="px-3 py-3 text-zinc-700 dark:text-zinc-400">{employee.job_title}</td>
                  <td className="px-3 py-3 text-zinc-700 dark:text-zinc-400">{employee.department}</td>
                  <td className="px-3 py-3 text-zinc-700 dark:text-zinc-400">{employee.offer_title || employee.offer_salary_text || "Accepted offer"}</td>
                  <td className="px-3 py-3">
                    <Link
                      to={`/recruiter/candidates/${employee.resume_submission_id}`}
                      className={actionButtonClassName()}
                    >
                      View Profile
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className="mt-4 flex items-center justify-between text-sm text-zinc-500 dark:text-zinc-400">
        <span>{pagination.total} total hires</span>
        <div className="flex items-center gap-2">
          <Link
            to={buildHref(Math.max(1, pagination.page - 1))}
            className={`rounded-lg border px-3 py-1.5 ${pagination.page <= 1 ? "pointer-events-none opacity-50" : "border-zinc-300 dark:border-zinc-700"}`}
          >
            Previous
          </Link>
          <span>Page {pagination.page} of {pagination.totalPages}</span>
          <Link
            to={buildHref(Math.min(pagination.totalPages, pagination.page + 1))}
            className={`rounded-lg border px-3 py-1.5 ${pagination.page >= pagination.totalPages ? "pointer-events-none opacity-50" : "border-zinc-300 dark:border-zinc-700"}`}
          >
            Next
          </Link>
        </div>
      </div>
    </Card>
  );
};
