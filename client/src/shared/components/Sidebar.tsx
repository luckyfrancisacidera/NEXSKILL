import {
  BriefcaseBusiness,
  LayoutDashboard,
  MessageCircle,
  Settings,
  UserRound,
  Bookmark,
  FileCheck2,
  Users,
  CalendarClock,
  Bot,
} from "lucide-react";
import { NavLink } from "react-router-dom";
import { cn } from "@shared/utils/cn";
import { useSession } from "@app/providers/session-store";

const jobseekerItems = [
  { label: 'Dashboard', to: '/dashboard', icon: LayoutDashboard },
  { label: 'Find Jobs', to: '/jobs', icon: BriefcaseBusiness },
  { label: 'Applications', to: '/applications', icon: FileCheck2 },
  { label: 'Messages', to: '/messages', icon: MessageCircle },
  { label: 'Saved Jobs', to: '/saved', icon: Bookmark },
  { label: 'Profile', to: '/profile', icon: UserRound },
  { label: 'Settings', to: '/settings', icon: Settings },
];

const recruiterItems = [
  { label: 'Dashboard', to: '/recruiter/dashboard', icon: LayoutDashboard },
  { label: 'Job Posts', to: '/recruiter/job-posts', icon: BriefcaseBusiness },
  { label: 'Candidates', to: '/recruiter/candidates', icon: Users },
  { label: 'Interviews', to: '/recruiter/interviews', icon: CalendarClock },
  { label: 'Automations', to: '/recruiter/automations', icon: Bot },
  { label: 'Settings', to: '/recruiter/settings', icon: Settings },
  { label: 'Global Settings', to: '/settings', icon: UserRound },
];

export const Sidebar = () => {
  const {
    state: { role },
  } = useSession();

  const navItems = role === 'recruiter' ? recruiterItems : jobseekerItems;

  return (
    <aside className="fixed w-64 border-r border-zinc-200 bg-zinc-50/50 p-4">
      <div className="mb-6 rounded-xl bg-white p-4 text-lg font-semibold text-zinc-900 shadow-sm">
        {role === 'recruiter' ? 'Recruiter' : 'Dashboard'}
      </div>
      <nav className="space-y-1">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition',
                isActive ? 'bg-zinc-900 text-white hover:bg-zinc-800' : 'text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900',
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
