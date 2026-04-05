import { useEffect, useMemo, useState } from "react";
import { Search, SlidersHorizontal } from "lucide-react";
import { useLoaderData, useSearchParams } from "react-router-dom";
import { JobsFilterFields } from "@features/jobseeker/pages/JobsPage/components/JobsFilterFields";
import { jobseekerService } from "@features/jobseeker/services/jobseeker.service";
import type { JobListItemDto, JobsLoaderData } from "@features/jobseeker/types";
import { Card } from "@shared/components/data-display/Card";
import { JobCard } from "@shared/components/data-display/JobCard";
import { SearchInput } from "@shared/components/form";
import { FilterSnapSheet } from "@shared/components/overlay/FilterSnapSheet";
import type { Job, JobType } from "@shared/types";
import { cn } from "@shared/utils/cn";
import { stripRichText } from "@shared/utils/richText";
import { matchesSearchFields, normalizeSearchInput } from "@shared/utils/search";

const LARGE_SCREEN_QUERY = "(min-width: 1024px)";

const salaryFilterOptions = [
  { value: "any", label: "Any salary" },
  { value: "below-15000", label: "Below \u20B115,000 / month" },
  { value: "15000-25000", label: "\u20B115,000 - \u20B125,000 / month" },
  { value: "25000-40000", label: "\u20B125,000 - \u20B140,000 / month" },
  { value: "40000-plus", label: "\u20B140,000+ / month" },
] as const;

type SalaryFilterValue = (typeof salaryFilterOptions)[number]["value"];

type JobsFiltersValue = {
  salaryFilter: SalaryFilterValue;
  employmentTypeFilter: string;
};

const toPositiveNumber = (value: string | null, fallbackValue: number) => {
  const parsedValue = Number(value ?? "");
  return Number.isFinite(parsedValue) && parsedValue > 0 ? parsedValue : fallbackValue;
};

const normalizeText = (value?: string | null) => value?.trim().toLowerCase() ?? "";

const toJobType = (employmentType?: string): JobType => {
  if (!employmentType) return "Contract";

  const normalizedType = employmentType.trim().toLowerCase();
  if (normalizedType.includes("part")) return "Part-time";
  if (normalizedType.includes("contract")) return "Contract";
  if (normalizedType.includes("remote")) return "Remote";
  return "Full-time";
};

const normalizeEmploymentType = (value?: string | null) => {
  const normalized = normalizeText(value).replace(/[_\s]+/g, "-");

  switch (normalized) {
    case "full-time":
    case "fulltime":
      return { key: "full-time", label: "Full-time" };
    case "part-time":
    case "parttime":
      return { key: "part-time", label: "Part-time" };
    case "contract":
      return { key: "contract", label: "Contract" };
    case "internship":
      return { key: "internship", label: "Internship" };
    case "temporary":
      return { key: "temporary", label: "Temporary" };
    case "freelance":
      return { key: "freelance", label: "Freelance" };
    default:
      if (!normalized) {
        return null;
      }

      return {
        key: normalized,
        label:
          value
            ?.trim()
            .split(/[\s_-]+/)
            .filter(Boolean)
            .map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1).toLowerCase())
            .join("-") ?? "Other",
      };
  }
};

const toMonthlySalaryRange = (job: JobListItemDto) => {
  const minAnnual = Number(job.salary_min_per_annum ?? 0);
  const maxAnnual = Number(job.salary_max_per_annum ?? 0);
  const minMonthly = minAnnual > 0 ? minAnnual / 12 : null;
  const maxMonthly = maxAnnual > 0 ? maxAnnual / 12 : null;

  if (minMonthly === null && maxMonthly === null) {
    return null;
  }

  return {
    min: minMonthly ?? maxMonthly ?? 0,
    max: maxMonthly ?? minMonthly ?? 0,
  };
};

const matchesSalaryFilter = (job: JobListItemDto, salaryFilter: SalaryFilterValue) => {
  if (salaryFilter === "any") {
    return true;
  }

  const salaryRange = toMonthlySalaryRange(job);
  if (!salaryRange) {
    return false;
  }

  const selectedRange =
    salaryFilter === "below-15000"
      ? { min: 0, max: 15000 }
      : salaryFilter === "15000-25000"
        ? { min: 15000, max: 25000 }
        : salaryFilter === "25000-40000"
          ? { min: 25000, max: 40000 }
          : { min: 40000, max: Number.POSITIVE_INFINITY };

  return salaryRange.max >= selectedRange.min && salaryRange.min <= selectedRange.max;
};

const jobMatchesSearch = (job: JobListItemDto, query: string) =>
  matchesSearchFields([job.title, job.company_name, job.location, job.employment_type], query);

export const JobsPage = () => {
  const data = useLoaderData() as JobsLoaderData;
  const [params] = useSearchParams();

  const [search, setSearch] = useState(() => params.get("search") ?? "");
  const [salaryFilter, setSalaryFilter] = useState<SalaryFilterValue>(() => {
    const initialValue = params.get("salary");
    return salaryFilterOptions.some((option) => option.value === initialValue)
      ? (initialValue as SalaryFilterValue)
      : "any";
  });
  const [employmentTypeFilter, setEmploymentTypeFilter] = useState(() => params.get("employmentType") ?? "all");
  const [currentPage, setCurrentPage] = useState(() => toPositiveNumber(params.get("page"), 1));
  const [isFilterDrawerOpen, setIsFilterDrawerOpen] = useState(false);
  const [mobileFilters, setMobileFilters] = useState<JobsFiltersValue>({
    salaryFilter,
    employmentTypeFilter,
  });
  const [isLargeScreen, setIsLargeScreen] = useState(() => {
    if (typeof window === "undefined") {
      return false;
    }

    return window.matchMedia(LARGE_SCREEN_QUERY).matches;
  });
  const [savedJobIds, setSavedJobIds] = useState<Set<string>>(
    () => new Set(data.items.filter((job) => job.is_saved).map((job) => String(job.id))),
  );

  useEffect(() => {
    if (typeof window === "undefined") {
      return undefined;
    }

    const mediaQuery = window.matchMedia(LARGE_SCREEN_QUERY);
    const handleChange = (event?: MediaQueryListEvent) => {
      const matches = event?.matches ?? mediaQuery.matches;
      setIsLargeScreen(matches);

      if (matches) {
        setIsFilterDrawerOpen(false);
      }
    };

    if (typeof mediaQuery.addEventListener === "function") {
      mediaQuery.addEventListener("change", handleChange);
      return () => mediaQuery.removeEventListener("change", handleChange);
    }

    mediaQuery.addListener(handleChange);
    return () => mediaQuery.removeListener(handleChange);
  }, []);

  const itemsPerPage = isLargeScreen ? 9 : 10;

  const employmentTypeOptions = useMemo(() => {
    const options = new Map<string, string>();

    data.items.forEach((job) => {
      const normalized = normalizeEmploymentType(job.employment_type);
      if (normalized) {
        options.set(normalized.key, normalized.label);
      }
    });

    return [
      { value: "all", label: "All types" },
      ...Array.from(options.entries())
        .sort((left, right) => left[1].localeCompare(right[1]))
        .map(([value, label]) => ({ value, label })),
    ];
  }, [data.items]);

  const normalizedSearch = useMemo(() => normalizeSearchInput(search), [search]);

  const filteredJobs = useMemo(() => {
    return data.items
      .filter((job) => {
        if (!normalizedSearch) {
          return true;
        }

        return jobMatchesSearch(job, normalizedSearch);
      })
      .filter((job) => matchesSalaryFilter(job, salaryFilter))
      .filter((job) => {
        if (employmentTypeFilter === "all") {
          return true;
        }

        return normalizeEmploymentType(job.employment_type)?.key === employmentTypeFilter;
      });
  }, [data.items, employmentTypeFilter, normalizedSearch, salaryFilter]);

  const totalPages = filteredJobs.length > 0 ? Math.ceil(filteredJobs.length / itemsPerPage) : 1;
  const safeCurrentPage = Math.min(Math.max(currentPage, 1), totalPages);

  const paginatedJobs = useMemo(() => {
    const startIndex = (safeCurrentPage - 1) * itemsPerPage;
    return filteredJobs.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredJobs, itemsPerPage, safeCurrentPage]);

  const activeFilterCount = Number(salaryFilter !== "any") + Number(employmentTypeFilter !== "all");
  const showingFrom = filteredJobs.length === 0 ? 0 : (safeCurrentPage - 1) * itemsPerPage + 1;
  const showingTo = filteredJobs.length === 0 ? 0 : Math.min(filteredJobs.length, safeCurrentPage * itemsPerPage);

  const applyFilters = (nextFilters: JobsFiltersValue) => {
    setSalaryFilter(nextFilters.salaryFilter);
    setEmploymentTypeFilter(nextFilters.employmentTypeFilter);
    setCurrentPage(1);
  };

  const resetFilters = () => {
    setSalaryFilter("any");
    setEmploymentTypeFilter("all");
    setCurrentPage(1);
  };

  const resetMobileFilters = () => {
    setMobileFilters({
      salaryFilter: "any",
      employmentTypeFilter: "all",
    });
  };

  return (
    <div className="space-y-6">
      <Card className="overflow-hidden rounded-[28px] border border-zinc-200 bg-white p-0 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
        <div className="border-b border-zinc-200 bg-[radial-gradient(circle_at_top_right,_rgba(63,63,70,0.16),_transparent_35%),linear-gradient(135deg,#fafafa_0%,#f4f4f5_100%)] px-4 py-5 dark:border-zinc-800 dark:bg-[radial-gradient(circle_at_top_right,_rgba(161,161,170,0.10),_transparent_35%),linear-gradient(135deg,#09090b_0%,#18181b_100%)] sm:px-5 sm:py-6">
          <div className="space-y-5">
            <div className="space-y-2">
              <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100 sm:text-2xl">Find Jobs</h2>
              <p className="text-sm text-zinc-500 dark:text-zinc-400">
                Browse open roles with a compact overview, then jump into the details when something fits.
              </p>
            </div>

            <div className="min-w-0">
              <div className="flex w-full min-w-0 flex-col gap-3 lg:flex-row lg:items-end">
                <div className="min-w-0 flex-1 lg:max-w-none">
                  <SearchInput
                    id="job-search"
                    label="Search"
                    ariaLabel="Search job posts"
                    icon={<Search className="h-4 w-4" />}
                    placeholder="Search roles, companies, locations, or job types"
                    value={search}
                    compactOnMobile={false}
                    onValueChange={(value) => {
                      setSearch(value);
                      setCurrentPage(1);
                    }}
                  />
                </div>

                <div className="flex w-full min-w-0 flex-col gap-2 sm:flex-row sm:items-end lg:hidden">
                <button
                  type="button"
                  className="flex h-11 w-full items-center justify-center gap-2 rounded-xl border border-zinc-300 bg-white px-4 text-sm font-medium text-zinc-700 shadow-sm transition hover:border-zinc-400 hover:bg-zinc-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-400 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 dark:hover:border-zinc-600 dark:hover:bg-zinc-800 sm:w-auto sm:shrink-0"
                  aria-label="Open filter drawer"
                  aria-expanded={isFilterDrawerOpen}
                  aria-controls="mobile-filter-drawer"
                  onClick={() => {
                    setMobileFilters({ salaryFilter, employmentTypeFilter });
                    setIsFilterDrawerOpen(true);
                  }}
                >
                  <SlidersHorizontal className="h-4 w-4" />
                  <span>Filters</span>
                  <span
                    className={cn(
                      "inline-flex min-w-6 items-center justify-center rounded-full px-1.5 py-0.5 text-xs font-semibold",
                      activeFilterCount > 0
                        ? "bg-zinc-900 text-zinc-50 dark:bg-zinc-100 dark:text-zinc-900"
                        : "bg-zinc-200 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400",
                    )}
                  >
                    {activeFilterCount}
                  </span>
                </button>
                </div>

                <div className="hidden min-w-0 gap-3 lg:grid lg:flex-[1.35] lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_auto]">
                  <JobsFilterFields
                    employmentTypeFilter={employmentTypeFilter}
                    employmentTypeOptions={employmentTypeOptions}
                    salaryFilter={salaryFilter}
                    salaryOptions={salaryFilterOptions}
                    compactOnMobile={false}
                    onEmploymentTypeChange={(value) => applyFilters({ salaryFilter, employmentTypeFilter: value })}
                    onSalaryChange={(value) =>
                      applyFilters({
                        salaryFilter: value as SalaryFilterValue,
                        employmentTypeFilter,
                      })
                    }
                  />

                  <div className="flex items-end">
                    <button
                      type="button"
                      onClick={resetFilters}
                      disabled={activeFilterCount === 0}
                      className="h-11 w-full rounded-xl border border-zinc-300 px-4 text-sm font-medium text-zinc-700 transition hover:bg-zinc-100 disabled:cursor-not-allowed disabled:opacity-50 dark:border-zinc-700 dark:text-zinc-200 dark:hover:bg-zinc-900"
                    >
                      Reset filters
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-2 px-4 py-3 text-sm text-zinc-500 dark:text-zinc-400 sm:px-5 md:flex-row md:items-center md:justify-between">
          <span>
            Showing {showingFrom}-{showingTo} of {filteredJobs.length} open role{filteredJobs.length === 1 ? "" : "s"}
          </span>
          <span>
            {data.totalCount} total published role{data.totalCount === 1 ? "" : "s"}
          </span>
        </div>
      </Card>

      <Card className="rounded-[24px] border border-zinc-200 bg-zinc-50/70 px-4 py-3 text-sm leading-6 text-zinc-500 shadow-sm dark:border-zinc-800 dark:bg-zinc-950/60 dark:text-zinc-400">
        Salary bands use monthly equivalents derived from the API&apos;s annual salary fields.
      </Card>

      <FilterSnapSheet
        isOpen={isFilterDrawerOpen}
        id="mobile-filter-drawer"
        title="Filter jobs"
        description="Adjust the job list, then apply when you're ready."
        footer={
          <div className="grid grid-cols-[minmax(0,1fr)_auto] gap-3">
            <button
              type="button"
              className="h-11 rounded-xl bg-zinc-100 px-4 text-sm font-medium text-zinc-900 transition hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-400"
              onClick={() => {
                applyFilters(mobileFilters);
                setIsFilterDrawerOpen(false);
              }}
            >
              Apply Filters
            </button>
            <button
              type="button"
              className="h-11 rounded-xl border border-zinc-700 px-4 text-sm font-medium text-zinc-200 transition hover:bg-zinc-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-500"
              onClick={resetMobileFilters}
            >
              Reset
            </button>
          </div>
        }
        onClose={() => setIsFilterDrawerOpen(false)}
      >
        <JobsFilterFields
          employmentTypeFilter={mobileFilters.employmentTypeFilter}
          employmentTypeOptions={employmentTypeOptions}
          salaryFilter={mobileFilters.salaryFilter}
          salaryOptions={salaryFilterOptions}
          selectButtonClassName="dark:bg-zinc-950"
          onEmploymentTypeChange={(value) =>
            setMobileFilters((current) => ({ ...current, employmentTypeFilter: value }))
          }
          onSalaryChange={(value) =>
            setMobileFilters((current) => ({
              ...current,
              salaryFilter: value as SalaryFilterValue,
            }))
          }
        />
      </FilterSnapSheet>

      {filteredJobs.length === 0 ? (
        <Card className="rounded-[24px] border border-dashed border-zinc-300 bg-white px-6 py-12 text-center shadow-sm dark:border-zinc-700 dark:bg-zinc-950">
          <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">No job posts found</h3>
          <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
            Try adjusting your search term or filters.
          </p>
        </Card>
      ) : (
        <>
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {paginatedJobs.map((job) => {
              const cardJob: Job = {
                id: String(job.id),
                title: job.title,
                company: job.company_name ?? "Company",
                salaryMin: Number(job.salary_min_per_annum ?? 0),
                salaryMax: Number(job.salary_max_per_annum ?? 0),
                currency: job.currency,
                location: job.location,
                type: toJobType(job.employment_type),
                snippet: stripRichText(job.description),
              };

              return (
                <JobCard
                  key={job.id}
                  job={cardJob}
                  isSaved={savedJobIds.has(String(job.id))}
                  onToggleSave={async (jobId, nextSavedState) => {
                    setSavedJobIds((current) => {
                      const next = new Set(current);
                      if (nextSavedState) {
                        next.add(String(jobId));
                      } else {
                        next.delete(String(jobId));
                      }
                      return next;
                    });

                    try {
                      if (nextSavedState) {
                        await jobseekerService.saveJob(jobId);
                      } else {
                        await jobseekerService.removeSavedJob(jobId);
                      }
                    } catch (error) {
                      setSavedJobIds((current) => {
                        const next = new Set(current);
                        if (nextSavedState) {
                          next.delete(String(jobId));
                        } else {
                          next.add(String(jobId));
                        }
                        return next;
                      });
                      throw error;
                    }
                  }}
                />
              );
            })}
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <span className="text-sm text-zinc-600 dark:text-zinc-400">
              Page {safeCurrentPage} of {totalPages}
            </span>

            <div className="grid grid-cols-2 gap-2 sm:flex">
              <button
                type="button"
                onClick={() => setCurrentPage(Math.max(1, safeCurrentPage - 1))}
                disabled={safeCurrentPage <= 1}
                className="rounded-lg border border-zinc-300 px-3 py-2 text-sm text-zinc-700 transition hover:bg-zinc-100 disabled:cursor-not-allowed disabled:opacity-50 dark:border-zinc-600 dark:text-zinc-300 dark:hover:bg-zinc-800"
              >
                Prev
              </button>
              <button
                type="button"
                onClick={() => setCurrentPage(Math.min(totalPages, safeCurrentPage + 1))}
                disabled={safeCurrentPage >= totalPages}
                className="rounded-lg border border-zinc-300 px-3 py-2 text-sm text-zinc-700 transition hover:bg-zinc-100 disabled:cursor-not-allowed disabled:opacity-50 dark:border-zinc-600 dark:text-zinc-300 dark:hover:bg-zinc-800"
              >
                Next
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
