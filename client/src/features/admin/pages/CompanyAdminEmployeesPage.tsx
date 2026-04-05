import { useState } from "react";
import { Search, SlidersHorizontal } from "lucide-react";
import { Link, useLoaderData, useSubmit } from "react-router-dom";

import type { CompanyAdminEmployeesDto } from "@features/admin/types/admin.type";
import { Card } from "@shared/components/data-display/Card";
import { actionButtonClassName } from "@shared/components/actions/ActionButton";
import { DepartmentCell } from "@shared/components/data-display/DepartmentCell";
import { DataTable } from "@shared/components/data-display/data-table/DataTable";
import { IdentityCell } from "@shared/components/data-display/data-table/IdentityCell";
import { TablePagination } from "@shared/components/data-display/data-table/TablePagination";
import { TablePageSizeControl } from "@shared/components/data-display/data-table/TablePageSizeControl";
import { FilterSnapSheet } from "@shared/components/overlay/FilterSnapSheet";
import type { DataTableColumn } from "@shared/components/data-display/data-table/table-types";

export const CompanyAdminEmployeesPage = () => {
  const data = useLoaderData() as CompanyAdminEmployeesDto & { filters: { search: string } };
  const submit = useSubmit();
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [draftPageSize, setDraftPageSize] = useState(String(data.pageSize));

  const submitFilters = (searchValue: string, pageSizeValue: number | string) => {
    const formData = new FormData();
    formData.set("search", searchValue);
    formData.set("pageSize", String(pageSizeValue));
    formData.set("page", "1");
    submit(formData, { method: "get", action: "/admin/company/employees" });
  };

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
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <h2 className="text-lg font-semibold text-zinc-950 dark:text-zinc-100 sm:text-xl">Employees</h2>
            <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
              Confirmed hires across your company, sourced directly from hired applications.
            </p>
          </div>
        </div>
      </div>

      <div className="px-4 py-4 sm:px-6">
        <form
          onSubmit={(event) => {
            event.preventDefault();
            submitSearch(event.currentTarget);
          }}
        >
          <div className="space-y-3">
            <div className="relative w-full max-w-md flex-1">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
              <input
                name="search"
                defaultValue={data.filters.search}
                placeholder="Search employees, recruiters, jobs, or departments"
                className="h-10 w-full rounded-2xl border border-zinc-200 bg-white pl-9 pr-3 text-[13px] text-zinc-700 outline-none transition placeholder:text-zinc-400 hover:border-zinc-300 focus:border-zinc-500 sm:h-11 sm:pr-3.5 sm:text-sm dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-100"
              />
            </div>

            <div className="flex justify-end lg:hidden">
              <button
                type="button"
                className="inline-flex items-center gap-2 rounded-xl border border-zinc-300 bg-white px-4 py-2.5 text-sm font-medium text-zinc-700 shadow-sm transition hover:border-zinc-400 hover:bg-zinc-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-400 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 dark:hover:border-zinc-600 dark:hover:bg-zinc-800"
                aria-label="Open employee filters"
                aria-expanded={isDrawerOpen}
                aria-controls="employee-filter-drawer"
                onClick={() => {
                  setDraftPageSize(String(data.pageSize));
                  setIsDrawerOpen(true);
                }}
              >
                <SlidersHorizontal className="h-4 w-4" />
                <span>Filters</span>
                <span className="inline-flex min-w-6 items-center justify-center rounded-full bg-zinc-900 px-1.5 py-0.5 text-xs font-semibold text-zinc-50 dark:bg-zinc-100 dark:text-zinc-900">
                  {Number(data.pageSize !== 10)}
                </span>
              </button>
            </div>

            <TablePageSizeControl
              className="hidden lg:inline-flex"
              value={data.pageSize}
              onChange={(pageSize) => submitFilters(data.filters.search, pageSize)}
            />
            <input type="hidden" name="pageSize" value={String(data.pageSize)} />
          </div>
        </form>
      </div>

      <FilterSnapSheet
        id="employee-filter-drawer"
        title="Filter employees"
        description="Adjust the employee list, then apply the changes."
        isOpen={isDrawerOpen}
        footer={
          <div className="grid grid-cols-[minmax(0,1fr)_auto] gap-3">
            <button
              type="button"
              className="h-11 rounded-xl bg-zinc-100 px-4 text-sm font-medium text-zinc-900 transition hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-400"
              onClick={() => {
                submitFilters(data.filters.search, draftPageSize);
                setIsDrawerOpen(false);
              }}
            >
              Apply Filters
            </button>
            <button
              type="button"
              className="h-11 rounded-xl border border-zinc-700 px-4 text-sm font-medium text-zinc-200 transition hover:bg-zinc-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-500"
              onClick={() => setDraftPageSize("10")}
            >
              Reset
            </button>
          </div>
        }
        onClose={() => setIsDrawerOpen(false)}
      >
        <div>
          <label className="mb-1.5 block text-xs font-medium uppercase tracking-[0.16em] text-zinc-400">
            Page Size
          </label>
          <select
            value={draftPageSize}
            onChange={(event) => setDraftPageSize(event.target.value)}
            className="h-11 w-full rounded-xl border border-zinc-700 bg-zinc-800 px-3.5 text-sm text-zinc-100 outline-none transition hover:border-zinc-600 focus:border-zinc-500 focus:ring-4 focus:ring-zinc-500/20"
          >
            {["10", "20", "50"].map((value) => (
              <option key={value} value={value}>
                {value} per page
              </option>
            ))}
          </select>
        </div>
      </FilterSnapSheet>

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
        showPageSizeSelector={false}
      />
    </Card>
  );
};

