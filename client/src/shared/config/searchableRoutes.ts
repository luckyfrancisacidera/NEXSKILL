import type { LucideIcon } from "lucide-react";
import {
  Bell,
  BriefcaseBusiness,
  CalendarClock,
  FileCheck2,
  LayoutDashboard,
  MessageSquare,
  Sparkles,
  UserRound,
  Users,
} from "lucide-react";
import type { Role } from "@shared/types";

export type SearchRoleContext =
  | "jobseeker"
  | "recruiter"
  | "companyAdmin"
  | "superAdmin";

export interface SearchableRouteItem {
  id: string;
  label: string;
  description: string;
  path: string;
  section: string;
  roles: SearchRoleContext[];
  keywords: string[];
  icon: LucideIcon;
}

const recruiterCandidatesBaseQuery =
  "search=&jobId=all&department=all&recommendedTopPercent=10&pageSize=10&page=1";

export const searchableRoutes: SearchableRouteItem[] = [
  {
    id: "jobseeker-dashboard",
    label: "Dashboard",
    description: "Overview of your job search activity and hiring progress.",
    path: "/dashboard",
    section: "Jobseeker",
    roles: ["jobseeker"],
    keywords: ["home", "overview", "summary", "activity", "dashboard"],
    icon: LayoutDashboard,
  },
  {
    id: "jobseeker-jobs",
    label: "Jobs",
    description: "Browse and discover open jobs that match your profile.",
    path: "/jobs",
    section: "Jobseeker",
    roles: ["jobseeker"],
    keywords: ["find jobs", "open roles", "vacancies", "job board", "careers"],
    icon: BriefcaseBusiness,
  },
  {
    id: "jobseeker-applications",
    label: "Applications",
    description: "Track submitted applications and their current hiring stage.",
    path: "/applications",
    section: "Jobseeker",
    roles: ["jobseeker"],
    keywords: ["applied jobs", "submissions", "application status", "resume submissions"],
    icon: Users,
  },
  {
    id: "jobseeker-interviews",
    label: "My Interviews",
    description: "Review upcoming interviews and respond to scheduling requests.",
    path: "/jobseeker/interviews",
    section: "Jobseeker",
    roles: ["jobseeker"],
    keywords: ["interview", "interviews", "schedule", "calendar", "meeting", "my interview"],
    icon: CalendarClock,
  },
  {
    id: "jobseeker-offers",
    label: "Offers",
    description: "See offer-stage applications and hiring outcomes.",
    path: "/offers",
    section: "Jobseeker",
    roles: ["jobseeker"],
    keywords: ["offer", "offered jobs", "hiring", "offer letters", "accepted offer"],
    icon: FileCheck2,
  },
  {
    id: "jobseeker-saved",
    label: "Saved Jobs",
    description: "Open the list of jobs you saved for later review.",
    path: "/saved",
    section: "Jobseeker",
    roles: ["jobseeker"],
    keywords: ["bookmarks", "favorites", "saved roles", "wishlist"],
    icon: Sparkles,
  },
  {
    id: "shared-profile",
    label: "My Profile",
    description: "Manage your account details, email verification, and password settings.",
    path: "/profile",
    section: "Shared",
    roles: ["jobseeker", "recruiter", "companyAdmin", "superAdmin"],
    keywords: ["account", "my profile", "personal info", "email", "password", "settings"],
    icon: UserRound,
  },
  {
    id: "jobseeker-messages",
    label: "Messages",
    description: "Open your candidate messaging workspace.",
    path: "/messages",
    section: "Jobseeker",
    roles: ["jobseeker"],
    keywords: ["chat", "conversation", "inbox", "messages"],
    icon: MessageSquare,
  },
  {
    id: "recruiter-dashboard",
    label: "Dashboard",
    description: "Recruiter overview for hiring activity, metrics, and pipeline health.",
    path: "/recruiter/dashboard",
    section: "Recruiter",
    roles: ["recruiter"],
    keywords: ["home", "overview", "recruiter dashboard", "analytics", "hiring metrics"],
    icon: LayoutDashboard,
  },
  {
    id: "recruiter-job-posts",
    label: "Job Posts",
    description: "Manage active and draft job postings.",
    path: "/recruiter/job-posts",
    section: "Recruiter",
    roles: ["recruiter"],
    keywords: ["jobs", "roles", "vacancies", "openings", "job listings"],
    icon: BriefcaseBusiness,
  },
  {
    id: "recruiter-create-job",
    label: "Create Job Post",
    description: "Start a new recruiter job post.",
    path: "/recruiter/job-posts/new",
    section: "Recruiter",
    roles: ["recruiter"],
    keywords: ["new job", "post job", "create vacancy", "create role"],
    icon: BriefcaseBusiness,
  },
  {
    id: "recruiter-applicants",
    label: "Applicants",
    description: "Review applicant lists and move candidates through the pipeline.",
    path: `/recruiter/candidates?${recruiterCandidatesBaseQuery}&stage=all`,
    section: "Recruiter",
    roles: ["recruiter"],
    keywords: ["applicants", "candidate list", "resume submissions", "candidates"],
    icon: Users,
  },
  {
    id: "recruiter-all-candidates",
    label: "All Candidates",
    description: "Open the full recruiter candidate pipeline across every active stage.",
    path: `/recruiter/candidates?${recruiterCandidatesBaseQuery}&stage=all`,
    section: "Recruiter",
    roles: ["recruiter"],
    keywords: ["all", "all applicants", "all candidates", "full pipeline", "candidate pipeline"],
    icon: Users,
  },
  {
    id: "recruiter-recommended",
    label: "Recommended Candidates",
    description: "Jump to AI-recommended candidates ranked near the top of the pipeline.",
    path: `/recruiter/candidates?${recruiterCandidatesBaseQuery}&stage=Recommended`,
    section: "Recruiter",
    roles: ["recruiter"],
    keywords: ["recommended", "recommendations", "ai candidates", "top recommended", "top picks"],
    icon: Sparkles,
  },
  {
    id: "recruiter-shortlisted",
    label: "Shortlisted Candidates",
    description: "Open the shortlisted candidate stage for interview-ready applicants.",
    path: `/recruiter/candidates?${recruiterCandidatesBaseQuery}&stage=Shortlisted`,
    section: "Recruiter",
    roles: ["recruiter"],
    keywords: ["shortlist", "shortlisted", "top candidates", "recommended candidates"],
    icon: Users,
  },
  {
    id: "recruiter-interview-candidates",
    label: "Interview Candidates",
    description: "View candidates who are currently in the interview stage.",
    path: `/recruiter/candidates?${recruiterCandidatesBaseQuery}&stage=Interview`,
    section: "Recruiter",
    roles: ["recruiter"],
    keywords: ["interview candidates", "interview stage", "scheduled candidates", "candidate interviews"],
    icon: CalendarClock,
  },
  {
    id: "recruiter-offers",
    label: "Offers",
    description: "Review candidates in the offer stage of the hiring pipeline.",
    path: `/recruiter/candidates?${recruiterCandidatesBaseQuery}&stage=Offer`,
    section: "Recruiter",
    roles: ["recruiter"],
    keywords: ["offer", "offers", "offered candidates", "offer stage", "hiring offers"],
    icon: FileCheck2,
  },
  {
    id: "recruiter-hired",
    label: "Hired Candidates",
    description: "Open candidates who have already been marked as hired.",
    path: `/recruiter/candidates?${recruiterCandidatesBaseQuery}&stage=Hire`,
    section: "Recruiter",
    roles: ["recruiter"],
    keywords: ["hire", "hired", "hires", "successful hires", "hiring complete"],
    icon: FileCheck2,
  },
  {
    id: "recruiter-interviews",
    label: "Interviews",
    description: "Schedule and manage candidate interviews from the calendar view.",
    path: "/recruiter/interviews",
    section: "Recruiter",
    roles: ["recruiter"],
    keywords: ["interview", "interviews", "schedule", "calendar", "meeting"],
    icon: CalendarClock,
  },
  {
    id: "super-admin-dashboard",
    label: "Platform Overview",
    description: "Super admin dashboard for tenant health and platform oversight.",
    path: "/admin/super",
    section: "Admin",
    roles: ["superAdmin"],
    keywords: ["admin dashboard", "platform dashboard", "overview", "super admin"],
    icon: LayoutDashboard,
  },
  {
    id: "super-admin-company-admins",
    label: "Company Admins",
    description: "Manage company admin accounts across every tenant.",
    path: "/admin/super/company-admins",
    section: "Admin",
    roles: ["superAdmin"],
    keywords: ["company admins", "tenant admins", "admins", "admin accounts"],
    icon: Users,
  },
  {
    id: "super-admin-recruiters",
    label: "Recruiters",
    description: "Review and manage recruiter accounts across the platform.",
    path: "/admin/super/recruiters",
    section: "Admin",
    roles: ["superAdmin"],
    keywords: ["recruiters", "recruiter accounts", "talent team", "hiring users"],
    icon: BriefcaseBusiness,
  },
  {
    id: "company-admin-dashboard",
    label: "Company Dashboard",
    description: "Manage recruiter access and company hiring operations.",
    path: "/admin/company",
    section: "Company Admin",
    roles: ["companyAdmin"],
    keywords: ["company admin", "company dashboard", "recruiter management", "company overview"],
    icon: LayoutDashboard,
  },
  {
    id: "notifications",
    label: "Notifications",
    description: "Open your notifications center and review recent activity.",
    path: "/notifications",
    section: "Shared",
    roles: ["jobseeker", "recruiter", "companyAdmin", "superAdmin"],
    keywords: ["alerts", "updates", "notification center", "announcements"],
    icon: Bell,
  },
];

export const resolveSearchRoleContext = (
  roles: readonly Role[],
  pathname: string,
): SearchRoleContext => {
  if (pathname.startsWith("/recruiter")) {
    return "recruiter";
  }

  if (pathname.startsWith("/admin/company")) {
    return "companyAdmin";
  }

  if (pathname.startsWith("/admin")) {
    return "superAdmin";
  }

  if (roles.includes("superAdmin") || roles.includes("admin")) {
    return "superAdmin";
  }

  if (roles.includes("companyAdmin")) {
    return "companyAdmin";
  }

  if (roles.includes("recruiter")) {
    return "recruiter";
  }

  return "jobseeker";
};
