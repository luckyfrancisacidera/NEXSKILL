import { Search } from "lucide-react";
import { Link, useLoaderData, useSubmit } from "react-router-dom";

import type { CompanyAdminEmployeesDto } from "@features/admin/types/admin.type";
import { Card } from "@shared/components/Card";
import { actionButtonClassName } from "@shared/components/ActionButton";

export const CompanyAdminEmployeesPage = () => {
  const data = useLoaderData() as CompanyAdminEmployeesDto & { filters: { search: string } };
  const submit = useSubmit();

  const submitSearch = (form: HTMLFormElement) => {
    const formData = new FormData(form);
    formData.set("page", "1");
    submit(formData, { method: "get", action: "/admin/company/employees" });
  };

  const buildHref = (page: number) =>
    `?search=${encodeURIComponent(data.filters.search)}&pageSize=${data.pageSize}&page=${page}`;

  return (
    <Card className="rounded-3xl border border-zinc-200 bg-white p-0 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
      <div className="border-b border-zinc-200 px-6 py-5 dark:border-zinc-800">
        <h2 className="text-xl font-semibold text-zinc-950 dark:text-zinc-100">Employees</h2>
        <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
          Confirmed hires across your company, sourced directly from hired applications.
        </p>
      </div>

      <div className="px-6 py-4">
        <form
          onSubmit={(event) => {
            event.preventDefault();
            submitSearch(event.currentTarget);
          }}
        >
          <div className="relative max-w-md">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
            <input
              name="search"
              defaultValue={data.filters.search}
              placeholder="Search employees, recruiters, jobs, or departments"
              className="h-11 w-full rounded-2xl border border-zinc-200 bg-white pl-9 pr-3.5 text-sm text-zinc-700 outline-none transition placeholder:text-zinc-400 hover:border-zinc-300 focus:border-zinc-500 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-100"
            />
            <input type="hidden" name="pageSize" value={String(data.pageSize)} />
          </div>
        </form>
      </div>

      {data.items.length === 0 ? (
        <div className="px-6 py-12 text-center text-sm text-zinc-500 dark:text-zinc-400">No employees yet.</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-zinc-200 text-sm dark:divide-zinc-800">
            <thead className="bg-zinc-50 text-left text-xs uppercase tracking-[0.18em] text-zinc-500 dark:bg-zinc-900 dark:text-zinc-200">
              <tr>
                {["Name of Employee", "Recruiter", "Date", "Offer", "Department", "Job", "Actions"].map((column) => (
                  <th key={column} className="px-6 py-3">{column}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
              {data.items.map((employee) => (
                <tr key={employee.resume_submission_id}>
                  <td className="px-6 py-4 font-medium text-zinc-900 dark:text-zinc-100">{employee.employee_name}</td>
                  <td className="px-6 py-4 text-zinc-700 dark:text-zinc-300">{employee.recruiter_name}</td>
                  <td className="px-6 py-4 text-zinc-700 dark:text-zinc-300">{new Date(employee.hire_date_utc).toLocaleDateString()}</td>
                  <td className="px-6 py-4 text-zinc-700 dark:text-zinc-300">{employee.offer_title || employee.offer_salary_text || "Accepted offer"}</td>
                  <td className="px-6 py-4 text-zinc-700 dark:text-zinc-300">{employee.department}</td>
                  <td className="px-6 py-4 text-zinc-700 dark:text-zinc-300">{employee.job_title}</td>
                  <td className="px-6 py-4">
                    <Link to={`/admin/company/candidates/${employee.resume_submission_id}`} className={actionButtonClassName()}>
                      View Profile
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className="flex items-center justify-between border-t border-zinc-200 px-6 py-4 text-sm text-zinc-500 dark:border-zinc-800 dark:text-zinc-400">
        <span>{data.totalCount} total employees</span>
        <div className="flex items-center gap-2">
          <Link
            to={buildHref(Math.max(1, data.pageNumber - 1))}
            className={`rounded-lg border px-3 py-1.5 ${data.pageNumber <= 1 ? "pointer-events-none opacity-50" : "border-zinc-300 dark:border-zinc-700"}`}
          >
            Previous
          </Link>
          <span>Page {data.pageNumber} of {data.totalPages}</span>
          <Link
            to={buildHref(Math.min(data.totalPages, data.pageNumber + 1))}
            className={`rounded-lg border px-3 py-1.5 ${data.pageNumber >= data.totalPages ? "pointer-events-none opacity-50" : "border-zinc-300 dark:border-zinc-700"}`}
          >
            Next
          </Link>
        </div>
      </div>
    </Card>
  );
};
