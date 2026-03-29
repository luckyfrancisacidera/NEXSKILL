import { Search } from "lucide-react";
import { Link, useLoaderData, useSubmit } from "react-router-dom";

import type { CompanyAdminEmployeesDto } from "@features/admin/types/admin.type";
import { Card } from "@shared/components/Card";
import { actionButtonClassName } from "@shared/components/ActionButton";
import { DepartmentCell } from "@shared/components/DepartmentCell";
import { DataTable } from "@shared/components/ui/data-table/DataTable";
import { IdentityCell } from "@shared/components/ui/data-table/IdentityCell";
import { TablePagination } from "@shared/components/ui/data-table/TablePagination";
import type { DataTableColumn } from "@shared/components/ui/data-table/table-types";

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

  const columns: Array<DataTableColumn<CompanyAdminEmployeesDto["items"][number]>> = [
    {
      id: "employee",
      header: "Employee",
      cell: (employee) => (
        <IdentityCell name={employee.employee_name} email={employee.employee_email} />
      ),
      accessor: (employee) => employee.employee_name,
      sortable: true,
      sortType: "string",
      widthClassName: "min-w-[240px]",
    },
    {
      id: "recruiter",
      header: "Recruiter",
      cell: (employee) => employee.recruiter_name,
      accessor: (employee) => employee.recruiter_name,
      sortable: true,
      sortType: "string",
    },
    {
      id: "date",
      header: "Date",
      cell: (employee) => new Date(employee.hire_date_utc).toLocaleDateString(),
      accessor: (employee) => new Date(employee.hire_date_utc),
      sortable: true,
      sortType: "date",
    },
    {
      id: "offer",
      header: "Offer",
      cell: (employee) => employee.offer_title || employee.offer_salary_text || "Accepted offer",
      accessor: (employee) => employee.offer_title || employee.offer_salary_text || "Accepted offer",
      sortable: true,
      sortType: "string",
    },
    {
      id: "department",
      header: "Department",
      cell: (employee) => <DepartmentCell department={employee.department} />,
      accessor: (employee) => employee.department,
      sortable: true,
      sortType: "string",
    },
    {
      id: "job",
      header: "Job",
      cell: (employee) => employee.job_title,
      accessor: (employee) => employee.job_title,
      sortable: true,
      sortType: "string",
    },
    {
      id: "actions",
      header: "Actions",
      align: "right",
      cell: (employee) => (
        <Link to={`/admin/company/candidates/${employee.resume_submission_id}`} className={actionButtonClassName()}>
          View Profile
        </Link>
      ),
      cellClassName: "w-[160px]",
    },
  ];

  return (
    <Card className="border-y border-zinc-200 bg-white p-0 shadow-none dark:border-zinc-800 dark:bg-zinc-950">
      <div className="border-b border-zinc-200 px-4 py-5 dark:border-zinc-800 sm:px-6">
        <h2 className="text-lg font-semibold text-zinc-950 dark:text-zinc-100 sm:text-xl">Employees</h2>
        <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
          Confirmed hires across your company, sourced directly from hired applications.
        </p>
      </div>

      <div className="px-4 py-4 sm:px-6">
        <form
          onSubmit={(event) => {
            event.preventDefault();
            submitSearch(event.currentTarget);
          }}
        >
          <div className="relative w-full max-w-md">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
            <input
              name="search"
              defaultValue={data.filters.search}
              placeholder="Search employees, recruiters, jobs, or departments"
              className="h-10 w-full rounded-2xl border border-zinc-200 bg-white pl-9 pr-3 text-[13px] text-zinc-700 outline-none transition placeholder:text-zinc-400 hover:border-zinc-300 focus:border-zinc-500 sm:h-11 sm:pr-3.5 sm:text-sm dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-100"
            />
            <input type="hidden" name="pageSize" value={String(data.pageSize)} />
          </div>
        </form>
      </div>

      {data.items.length === 0 ? (
        <div className="px-6 py-12 text-center text-sm text-zinc-500 dark:text-zinc-400">No employees yet.</div>
      ) : (
        <DataTable
          data={data.items}
          columns={columns}
          getRowKey={(employee) => employee.resume_submission_id}
          surfaceClassName="border-0"
        />
      )}

      <TablePagination
        page={data.pageNumber}
        totalPages={data.totalPages}
        totalCount={data.totalCount}
        pageSize={data.pageSize}
        getPageHref={buildHref}
        itemLabel="employees"
        className="px-4 sm:px-6"
      />
    </Card>
  );
};
