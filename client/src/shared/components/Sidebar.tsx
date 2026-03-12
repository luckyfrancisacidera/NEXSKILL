import {
  BriefcaseBusiness,
  CalendarClock,
  FileCheck2,
  LayoutDashboard,
  Settings,
  Users,
} from "lucide-react";
import { NavLink } from "react-router-dom";
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
  { label: "Settings", to: "/recruiter/settings", icon: Settings },
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
    <aside className="fixed z-40 min-h-screen w-64 border-r border-zinc-200 bg-zinc-50/50 p-4">
      <div className="mb-6 rounded-xl bg-white p-4 text-lg font-semibold text-zinc-900 shadow-sm">
        {title}
      </div>
      <nav className="space-y-1">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition",
                isActive
                  ? "bg-zinc-900 text-white hover:bg-zinc-800"
                  : "text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900",
              )
            }
          >
            <item.icon className="h-4 w-4" />
            {item.label}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
};
