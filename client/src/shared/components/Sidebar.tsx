import {
  BriefcaseBusiness,
  CalendarClock,
  FileCheck2,
  LayoutDashboard,
  Users,
} from "lucide-react";
import { NavLink, useLocation } from "react-router-dom";
import { cn } from "@shared/utils/cn";
import { usePermissions } from "@shared/hooks/usePermissions";

const jobseekerItems = [
  { label: "Dashboard", to: "/dashboard", icon: LayoutDashboard },
  { label: "Find Jobs", to: "/jobs", icon: BriefcaseBusiness },
  { label: "Applications", to: "/applications", icon: Users },
  { label: "Offers & Hiring", to: "/offers", icon: FileCheck2 },
  { label: "Interviews", to: "/jobseeker/interviews", icon: CalendarClock },
];

const recruiterItems = [
  { label: "Dashboard", to: "/recruiter/dashboard", icon: LayoutDashboard },
  { label: "Job Posts", to: "/recruiter/job-posts", icon: BriefcaseBusiness },
  { label: "Candidates", to: "/recruiter/candidates", icon: Users },
  { label: "Interviews", to: "/recruiter/interviews", icon: CalendarClock },
];

const superAdminItems = [
  { label: "Platform Overview", to: "/admin/super", icon: LayoutDashboard },
  { label: "Company Admins", to: "/admin/super/company-admins", icon: Users },
  { label: "Recruiters", to: "/admin/super/recruiters", icon: BriefcaseBusiness },
];

const companyAdminItems = [
  { label: "Company Dashboard", to: "/admin/company", icon: LayoutDashboard },
];

export const Sidebar = () => {
  const { isSuperAdmin, isCompanyAdmin, isRecruiter } = usePermissions();
  const location = useLocation();

  const section = isSuperAdmin
    ? "superAdmin"
    : isCompanyAdmin
      ? "companyAdmin"
      : isRecruiter
        ? "recruiter"
        : "jobseeker";

  const navItems = section === "superAdmin"
    ? superAdminItems
    : section === "companyAdmin"
      ? companyAdminItems
      : section === "recruiter"
        ? recruiterItems
        : jobseekerItems;

  const title = section === "superAdmin"
    ? "Super Admin"
    : section === "companyAdmin"
      ? "Company Admin"
      : section === "recruiter"
        ? "Recruiter"
        : "Dashboard";

  return (
    <aside className="w-full border-b border-zinc-200 bg-white p-4 dark:border-zinc-900 dark:bg-zinc-950 lg:sticky lg:top-0 lg:h-screen lg:w-64 lg:border-b-0 lg:border-r ">
      <div className="mb-6 rounded-xl bg-white dark:bg-zinc-900 dark:shadow-zinc-900 dark:text-zinc-200 p-4 text-lg font-semibold text-zinc-900 shadow-sm">
        {title}
      </div>
      <nav className="flex gap-1 overflow-x-auto pb-1 lg:block lg:space-y-1 lg:overflow-visible lg:pb-0">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === "/dashboard" || item.to === "/admin/company" || item.to === "/admin/super"}
            className={({ isActive }) => {
              const isNestedActive =
                !isActive &&
                item.to !== "/dashboard" &&
                item.to !== "/admin/company" &&
                item.to !== "/admin/super" &&
                location.pathname.startsWith(`${item.to}/`);

              return (
              cn(
                "shrink-0 flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition lg:w-full",
                isActive || isNestedActive
                  ? "bg-zinc-900 text-white shadow-sm hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-950 dark:hover:bg-zinc-200"
                  : "text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-900 dark:hover:text-zinc-100",
              )
            );
            }}
          >
            <item.icon className="h-4 w-4" />
            {item.label}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
};
