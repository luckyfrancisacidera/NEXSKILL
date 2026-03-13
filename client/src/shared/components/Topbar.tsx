import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

import { Bell, ChevronDown, LogOut, Moon, Search, Sun } from "lucide-react";
import { Avatar } from "@shared/components/Avatar";
import { useAuth } from "@app/providers/AuthProvider";
import { useNotifications } from "@app/providers/NotificationsProvider";
import { useTheme } from "@app/providers/ThemeProvider";
import { useCurrentCompany } from "@app/providers/CurrentCompanyProvider";
import { cn } from "@shared/utils/cn";
import { formatNotificationTimestamp } from "@shared/utils/notifications";

const topbarControlClassName =
  "inline-flex items-center gap-2 rounded-lg border border-zinc-200 bg-white/80 px-3 py-2 text-sm text-zinc-700 shadow-sm transition-colors duration-300 hover:bg-zinc-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-400 dark:border-zinc-700 dark:bg-zinc-900/80 dark:text-zinc-200 dark:hover:bg-zinc-800 dark:focus-visible:ring-zinc-500";

const topbarIconButtonClassName = cn(
  topbarControlClassName,
  "justify-center p-2",
);

export const Topbar = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { currentCompany } = useCurrentCompany();
  const { theme, toggleTheme } = useTheme();
  const {
    latestNotifications,
    unreadCount,
    notifications,
    markAllAsRead,
    markNotificationAsRead,
    refreshNotifications,
  } = useNotifications();
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);
  const notificationsRef = useRef<HTMLDivElement | null>(null);
  const ThemeIcon = theme === "dark" ? Sun : Moon;
  const themeToggleLabel =
    theme === "dark" ? "Switch to light mode" : "Switch to dark mode";

  useEffect(() => {
    const onPointerDown = (event: MouseEvent | TouchEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsUserMenuOpen(false);
      }

      if (notificationsRef.current && !notificationsRef.current.contains(event.target as Node)) {
        setIsNotificationsOpen(false);
      }
    };

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsUserMenuOpen(false);
        setIsNotificationsOpen(false);
      }
    };

    window.addEventListener("mousedown", onPointerDown);
    window.addEventListener("touchstart", onPointerDown);
    window.addEventListener("keydown", onKeyDown);

    return () => {
      window.removeEventListener("mousedown", onPointerDown);
      window.removeEventListener("touchstart", onPointerDown);
      window.removeEventListener("keydown", onKeyDown);
    };
  }, []);

  const toggleNotifications = () => {
    setIsNotificationsOpen((current) => {
      const next = !current;
      if (next) {
        void refreshNotifications();
      }

      return next;
    });
    setIsUserMenuOpen(false);
  };

  const onLogout = async () => {
    await logout();
    setIsUserMenuOpen(false);
    navigate("/login", { replace: true });
  };

  return (
    <header className="fixed left-64 right-0 top-0 z-30 flex items-center justify-between gap-4 border-b border-zinc-200/80 bg-white/75 px-6 py-4 shadow-[0_1px_0_rgba(255,255,255,0.7),0_10px_30px_rgba(15,23,42,0.06)] backdrop-blur-md transition-colors duration-300 supports-backdrop-filter:bg-white/70 dark:border-zinc-800/80 dark:bg-zinc-950/75 dark:shadow-[0_1px_0_rgba(24,24,27,0.85),0_10px_30px_rgba(0,0,0,0.3)] dark:supports-backdrop-filter:bg-zinc-950/70">
      <div className="flex flex-1 items-center gap-3">
        <div className="hidden min-w-0 flex-1 flex-col text-left text-xs text-zinc-500 dark:text-zinc-400 sm:flex">
          {currentCompany ? (
            <>
              <span className="font-semibold text-zinc-900 dark:text-zinc-100">
                {currentCompany.name}
              </span>
              {currentCompany.primaryEmail && (
                <span className="truncate text-[11px] text-zinc-500 dark:text-zinc-400">
                  {currentCompany.primaryEmail}
                </span>
              )}
            </>
          ) : (
            <span className="font-medium text-zinc-600 dark:text-zinc-300">
              SkillSense ATS
            </span>
          )}
        </div>
        <label className="flex flex-1 items-center gap-2 rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2 text-sm text-zinc-500 transition-colors duration-300 focus-within:border-zinc-400 focus-within:bg-white dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-400 dark:focus-within:border-zinc-500 dark:focus-within:bg-zinc-950">
        <Search className="h-4 w-4" />
        <input
          aria-label="Search jobs"
          className="w-full bg-transparent text-zinc-900 outline-none placeholder:text-zinc-400 transition-colors duration-300 dark:text-zinc-100 dark:placeholder:text-zinc-500"
          placeholder="Search job title or keywords"
        />
        </label>
      </div>
      <button type="button" className={topbarControlClassName}>
        Remote
        <ChevronDown className="h-4 w-4" />
      </button>
      <button
        type="button"
        className={topbarIconButtonClassName}
        aria-label={themeToggleLabel}
        title={themeToggleLabel}
        onClick={toggleTheme}
      >
        <ThemeIcon className="h-5 w-5" />
      </button>
      <div className="relative" ref={notificationsRef}>
        <button
          type="button"
          className={cn(topbarIconButtonClassName, "relative")}
          aria-label="Notifications"
          aria-expanded={isNotificationsOpen}
          onClick={toggleNotifications}
        >
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute -right-1.5 -top-1.5 inline-flex min-h-[18px] min-w-[18px] items-center justify-center rounded-full bg-rose-500 px-1 text-[11px] font-semibold text-white shadow-sm">
              {unreadCount > 99 ? "99+" : unreadCount}
            </span>
          )}
        </button>
        {isNotificationsOpen && (
          <div className="absolute right-0 top-12 z-20 w-80 rounded-xl border border-zinc-200 bg-white p-2 shadow-xl dark:border-zinc-800 dark:bg-zinc-900">
            <div className="mb-2 flex items-center justify-between px-1">
              <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                Notifications
              </p>
              {notifications.length > 0 && (
                <button
                  type="button"
                  onClick={markAllAsRead}
                  className="text-xs font-medium text-violet-600 hover:text-violet-700 dark:text-violet-400 dark:hover:text-violet-300"
                >
                  Mark all as read
                </button>
              )}
            </div>
            <div className="max-h-80 space-y-1 overflow-y-auto pr-1">
              {notifications.length === 0 ? (
                <p className="px-1 py-4 text-center text-xs text-zinc-500 dark:text-zinc-400">
                  You&apos;re all caught up.
                </p>
              ) : (
                latestNotifications.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => void markNotificationAsRead(item.id)}
                    className={cn(
                      "block w-full rounded-lg px-3 py-2 text-left text-xs transition-colors",
                      item.read
                        ? "bg-zinc-50 text-zinc-600 dark:bg-zinc-900 dark:text-zinc-400"
                        : "bg-violet-50 text-zinc-800 ring-1 ring-violet-100 dark:bg-violet-950/40 dark:text-zinc-100 dark:ring-violet-900/60",
                    )}
                  >
                    <p className="font-semibold">{item.title}</p>
                    {item.description ? (
                      <p className="mt-0.5 line-clamp-2">{item.description}</p>
                    ) : null}
                    <p className="mt-1 text-[10px] uppercase tracking-wide text-zinc-400">
                      {item.actor === "recruiter"
                        ? "Recruiter"
                        : item.actor === "jobseeker"
                          ? "Jobseeker"
                          : "System"}
                    </p>
                    <p className="mt-1 text-[11px] text-zinc-400 dark:text-zinc-500">
                      {formatNotificationTimestamp(item.createdAt)}
                    </p>
                  </button>
                ))
              )}
            </div>
            <div className="mt-2 border-t border-zinc-200 pt-2 dark:border-zinc-800">
              <button
                type="button"
                onClick={() => {
                  setIsNotificationsOpen(false);
                  navigate("/notifications");
                }}
                className="w-full rounded-lg px-3 py-2 text-sm font-semibold text-violet-600 transition hover:bg-violet-50 hover:text-violet-700 dark:text-violet-400 dark:hover:bg-violet-950/40 dark:hover:text-violet-300"
              >
                View all notifications
              </button>
            </div>
          </div>
        )}
      </div>
      <div className="relative" ref={menuRef}>
        <button
          type="button"
          className="rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-400 dark:focus-visible:ring-zinc-500"
          aria-haspopup="menu"
          aria-expanded={isUserMenuOpen}
          aria-label="Open user menu"
          onClick={() => setIsUserMenuOpen((current) => !current)}
        >
          <Avatar name={user?.email ?? "User"} />
        </button>

        {isUserMenuOpen && (
          <div
            className="absolute right-0 top-12 z-20 min-w-44 rounded-lg border border-zinc-200 bg-white p-2 shadow-lg transition-colors duration-300 dark:border-zinc-700 dark:bg-zinc-900"
            role="menu"
            aria-label="User menu"
          >
            <button
              type="button"
              className="flex w-full items-center gap-2 rounded-md bg-red-50 px-3 py-2 text-left text-sm font-medium text-red-700 transition-colors duration-300 hover:bg-red-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-300 dark:bg-red-950/40 dark:text-red-300 dark:hover:bg-red-950/70 dark:focus-visible:ring-red-900"
              role="menuitem"
              onClick={onLogout}
            >
              <LogOut className="h-4 w-4" />
              Logout
            </button>
          </div>
        )}
      </div>
    </header>
  );
};
