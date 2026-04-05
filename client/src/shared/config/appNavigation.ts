import {
  BriefcaseBusiness,
  CalendarClock,
  FileCheck2,
  LayoutDashboard,
  Users,
  type LucideIcon,
} from "lucide-react";
import { Sparkles } from "lucide-react";

export type NavigationSection = "jobseeker" | "recruiter" | "companyadmin" | "superadmin";

export interface AppNavigationItem {
  label: string;
  to: string;
  icon: LucideIcon;
}

export interface NavigationContext {
  section: NavigationSection;
  title: string;
  eyebrow: string;
  items: AppNavigationItem[];
}

const jobseekerItems: AppNavigationItem[] = [
  { label: "Dashboard", to: "/dashboard", icon: LayoutDashboard },
  { label: "Find Jobs", to: "/jobs", icon: BriefcaseBusiness },
  { label: "Applications", to: "/applications", icon: Users },
  { label: "Offers & Hiring", to: "/offers", icon: FileCheck2 },
  { label: "Interviews", to: "/jobseeker/interviews", icon: CalendarClock },
  { label: "Saved Jobs", to: "/saved", icon: Sparkles },
];

const recruiterItems: AppNavigationItem[] = [
  { label: "Dashboard", to: "/recruiter/dashboard", icon: LayoutDashboard },
  { label: "Job Posts", to: "/recruiter/job-posts", icon: BriefcaseBusiness },
  { label: "Candidates", to: "/recruiter/candidates", icon: Users },
  { label: "My Hires", to: "/recruiter/hired", icon: FileCheck2 },
  { label: "Interviews", to: "/recruiter/interviews", icon: CalendarClock },
];

const superAdminItems: AppNavigationItem[] = [
  { label: "Platform Overview", to: "/admin/super", icon: LayoutDashboard },
  { label: "Users", to: "/admin/super/users", icon: Users },
  { label: "Company Admins", to: "/admin/super/company-admins", icon: Users },
  { label: "Recruiters", to: "/admin/super/recruiters", icon: BriefcaseBusiness },
];

const companyAdminItems: AppNavigationItem[] = [
  { label: "Company Dashboard", to: "/admin/company", icon: LayoutDashboard },
  { label: "Employees", to: "/admin/company/employees", icon: Users },
];

export const resolveNavigationSection = ({
  isSuperAdmin,
  isCompanyAdmin,
  isRecruiter,
}: {
  isSuperAdmin: boolean;
  isCompanyAdmin: boolean;
  isRecruiter: boolean;
}): NavigationSection => {
  if (isSuperAdmin) {
    return "superadmin";
  }

  if (isCompanyAdmin) {
    return "companyadmin";
  }

  if (isRecruiter) {
    return "recruiter";
  }

  return "jobseeker";
};

export const getNavigationContext = (section: NavigationSection): NavigationContext => {
  switch (section) {
    case "superadmin":
      return {
        section,
        title: "Super Admin",
        eyebrow: "Platform",
        items: superAdminItems,
      };
    case "companyadmin":
      return {
        section,
        title: "Company Admin",
        eyebrow: "Admin",
        items: companyAdminItems,
      };
    case "recruiter":
      return {
        section,
        title: "Recruiter ATS",
        eyebrow: "Workspace",
        items: recruiterItems,
      };
    case "jobseeker":
    default:
      return {
        section,
        title: "Career Hub",
        eyebrow: "Workspace",
        items: jobseekerItems,
      };
  }
};

export const isNavigationItemActive = (pathname: string, item: AppNavigationItem) => {
  const exactOnlyRoutes = new Set(["/dashboard", "/admin/company", "/admin/super"]);

  if (pathname === item.to) {
    return true;
  }

  if (exactOnlyRoutes.has(item.to)) {
    return false;
  }

  return pathname.startsWith(`${item.to}/`);
};

export const getNavigationPageTitle = (
  pathname: string,
  context: NavigationContext,
) => {
  const activeItem = context.items.find((item) => isNavigationItemActive(pathname, item));

  if (activeItem) {
    return activeItem.label;
  }

  if (pathname === "/notifications") {
    return "Notifications";
  }

  if (pathname === "/profile") {
    return "My Profile";
  }

  return context.title;
};
