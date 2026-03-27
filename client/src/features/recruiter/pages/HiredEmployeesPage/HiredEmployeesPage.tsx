import { Eye, Search } from "lucide-react";
import { Link, useLoaderData, useSubmit } from "react-router-dom";

import type { HiredEmployeesLoaderData } from "@features/recruiter/types";
import { Card } from "@shared/components/Card";
import { actionButtonClassName } from "@shared/components/ActionButton";
import { DepartmentCell } from "@shared/components/DepartmentCell";
import { JobTitleCell } from "@shared/components/JobTitleCell";
import { DataTable } from "@shared/components/ui/data-table/DataTable";
import { IdentityCell } from "@shared/components/ui/data-table/IdentityCell";
import { TablePagination } from "@shared/components/ui/data-table/TablePagination";
import type { DataTableColumn } from "@shared/components/ui/data-table/table-types";

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

  const columns: Array<DataTableColumn<HiredEmployeesLoaderData["employees"][number]>> = [
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
      id: "hire-date",
      header: "Hire Date",
      cell: (employee) => new Date(employee.hire_date_utc).toLocaleDateString(),
      accessor: (employee) => new Date(employee.hire_date_utc),
      sortable: true,
      sortType: "date",
    },
    {
      id: "job",
      header: "Job",
      cell: (employee) => (
        <JobTitleCell
          title={employee.job_title}
          subtitle={employee.offer_title || undefined}
        />
      ),
      accessor: (employee) => employee.job_title,
      sortable: true,
      sortType: "string",
      widthClassName: "min-w-[220px]",
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
      id: "offer",
      header: "Offer",
      cell: (employee) => employee.offer_title || employee.offer_salary_text || "Accepted offer",
      accessor: (employee) => employee.offer_title || employee.offer_salary_text || "Accepted offer",
      sortable: true,
      sortType: "string",
    },
    {
      id: "actions",
      header: "Actions",
      align: "right",
      cell: (employee) => (
        <Link
          to={`/recruiter/candidates/${employee.resume_submission_id}`}
          className={actionButtonClassName({ iconOnly: true })}
          title="View candidate"
        >
          <Eye size={16} />
        </Link>
      ),
      cellClassName: "w-[72px]",
    },
  ];

  return (
    <Card className="border-0 bg-transparent p-0 shadow-none dark:border-0 dark:bg-transparent">
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
        <DataTable
          data={employees}
          columns={columns}
          getRowKey={(employee) => employee.resume_submission_id}
        />
      )}

      <TablePagination
        page={pagination.page}
        totalPages={pagination.totalPages}
        totalCount={pagination.total}
        pageSize={pagination.pageSize}
        itemLabel="hires"
        getPageHref={buildHref}
      />
    </Card>
  );
};
