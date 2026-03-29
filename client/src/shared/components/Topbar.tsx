import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

import { Bell, LogOut, Menu, Moon, Search, Sun, UserRound } from "lucide-react";
import { Avatar } from "@shared/components/Avatar";
import { SideDrawer } from "@shared/components/SideDrawer";
import { useAuth } from "@app/providers/AuthProvider";
import { useNotifications } from "@app/providers/NotificationsProvider";
import { useTheme } from "@app/providers/ThemeProvider";
import { useCurrentCompany } from "@app/providers/CurrentCompanyProvider";
import { GlobalSearchBar } from "@shared/components/GlobalSearchBar";
import { cn } from "@shared/utils/cn";
import { formatNotificationTimestamp } from "@shared/utils/notifications";

const topbarControlClassName =
  "inline-flex items-center gap-1.5 rounded-lg border border-zinc-200 bg-white/80 px-2.5 py-1.5 text-xs text-zinc-700 shadow-sm transition-colors duration-300 hover:bg-zinc-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-400 dark:border-zinc-700 dark:bg-zinc-900/80 dark:text-zinc-200 dark:hover:bg-zinc-800 dark:focus-visible:ring-zinc-500 sm:px-3 sm:py-2 sm:text-sm";

const topbarIconButtonClassName = cn(
  topbarControlClassName,
  "justify-center p-2",
);

interface TopbarProps {
  onMenuToggle?: () => void;
  pageTitle?: string;
}

export const Topbar = ({ onMenuToggle, pageTitle }: TopbarProps) => {
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
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);
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

  const displayName =
    [user?.firstName?.trim(), user?.lastName?.trim()].filter(Boolean).join(" ") ||
    (user?.email?.split("@")[0]?.replace(/[._-]+/g, " ") ?? "User");
  const roleLabel = user?.role ?? "Member";

  return (
    <>
      <header className="sticky top-0 z-30 flex flex-wrap items-center justify-between gap-2 rounded-xl border-2 border-zinc-200 bg-white/90 px-3 py-3 backdrop-blur-md transition-colors duration-300 sm:mx-6 sm:mt-6 sm:px-5 sm:py-3.5 lg:mx-8 lg:mt-7 dark:border-zinc-800 dark:bg-zinc-950/90">
        <div className="flex min-w-0 flex-1 items-center gap-2.5">
          <button
            type="button"
            className={cn(topbarIconButtonClassName, "lg:hidden")}
            aria-label="Open sidebar"
            onClick={onMenuToggle}
          >
            <Menu className="h-4 w-4 sm:h-5 sm:w-5" />
          </button>
          <div className="min-w-0 lg:hidden">
            <p className="truncate text-xs font-semibold text-zinc-900 dark:text-zinc-100 sm:text-sm">
              {pageTitle ?? "SkillSense ATS"}
            </p>
          </div>
          <div className="hidden min-w-0 flex-1 flex-col text-left text-[11px] text-zinc-500 dark:text-zinc-400 xl:flex">
            {currentCompany ? (
              <>
                <span className="font-semibold text-zinc-900 dark:text-zinc-100">
                  {currentCompany.name}
                </span>
                {currentCompany.primaryEmail && (
                  <span className="truncate text-[10px] text-zinc-500 dark:text-zinc-400">
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
          <div className="min-w-0 hidden flex-1 md:block">
            <GlobalSearchBar />
          </div>
        </div>
        <button
          type="button"
          className={topbarIconButtonClassName}
          aria-label={themeToggleLabel}
          title={themeToggleLabel}
          onClick={toggleTheme}
        >
          <ThemeIcon className="h-4 w-4 sm:h-5 sm:w-5" />
        </button>
        <button
          type="button"
          className={cn(topbarIconButtonClassName, "md:hidden")}
          aria-label="Open global search"
          onClick={() => setIsMobileSearchOpen(true)}
        >
          <Search className="h-4 w-4 sm:h-5 sm:w-5" />
        </button>
        <div className="relative" ref={notificationsRef}>
          <button
            type="button"
            className={cn(topbarIconButtonClassName, "relative")}
            aria-label="Notifications"
            aria-expanded={isNotificationsOpen}
            onClick={toggleNotifications}
          >
            <Bell className="h-4 w-4 sm:h-5 sm:w-5" />
            {unreadCount > 0 && (
              <span className="absolute -right-1 -top-1 inline-flex min-h-4 min-w-4 items-center justify-center rounded-full bg-rose-500 px-1 text-[10px] font-semibold text-white shadow-sm sm:-right-1.5 sm:-top-1.5 sm:min-h-[1.125rem] sm:min-w-[1.125rem] sm:text-[11px]">
                {unreadCount > 99 ? "99+" : unreadCount}
              </span>
            )}
          </button>
          {isNotificationsOpen && (
            <div className="absolute -right-12.5 top-[calc(100%+0.75rem)] z-20 w-screen max-w-[calc(100vw-2rem)] md:w-[80vw] lg:w-md lg:max-w-lg">
              <div className="relative flex max-h-[90vh] w-full flex-col overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-xl dark:border-zinc-800 dark:bg-zinc-900">
              <div className="mb-1 flex flex-wrap items-center justify-between gap-2 px-3 py-2.5 sm:py-2">
                <p className="wrap-break-word text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                  Notifications
                </p>
                {notifications.length > 0 && (
                  <button
                    type="button"
                    onClick={markAllAsRead}
                    className="shrink-0 text-xs font-medium text-zinc-600 transition hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-200"
                  >
                    Mark all as read
                  </button>
                )}
              </div>
              <div className="flex-1 space-y-1 overflow-y-auto overflow-x-hidden px-2 pb-2">
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
                        "block w-full max-w-full rounded-lg px-3 py-2 text-left text-[11px] transition-colors sm:text-xs",
                        item.read
                          ? "bg-zinc-50 text-zinc-600 dark:bg-zinc-900 dark:text-zinc-400"
                          : "bg-zinc-100 text-zinc-800 ring-1 ring-zinc-200 dark:bg-zinc-800 dark:text-zinc-100 dark:ring-zinc-700",
                      )}
                    >
                      <p className="wrap-break-word font-semibold">{item.title}</p>
                      {item.description ? (
                        <p className="mt-0.5 wrap-break-word line-clamp-2">{item.description}</p>
                      ) : null}
                      <p className="mt-1 text-[10px] uppercase tracking-wide text-zinc-400">
                        {item.actor === "recruiter"
                          ? "Recruiter"
                          : item.actor === "jobseeker"
                            ? "Jobseeker"
                            : "System"}
                      </p>
                      <p className="mt-1 text-[10px] text-zinc-400 dark:text-zinc-500 sm:text-[11px]">
                        {formatNotificationTimestamp(item.createdAt)}
                      </p>
                    </button>
                  ))
                )}
              </div>
              <div className="border-t border-zinc-200 p-2 dark:border-zinc-800">
                <button
                  type="button"
                  onClick={() => {
                    setIsNotificationsOpen(false);
                    navigate("/notifications");
                  }}
                  className="w-full rounded-lg px-3 py-2 text-xs font-semibold text-zinc-700 transition hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800 dark:hover:text-zinc-100 sm:text-sm"
                >
                  View all notifications
                </button>
              </div>
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
              className="absolute right-0 top-11 z-20 w-64 overflow-hidden rounded-[22px] border border-zinc-200 bg-white shadow-[0_18px_50px_rgba(15,23,42,0.14)] transition-colors duration-300 dark:border-zinc-700 dark:bg-zinc-900 sm:w-70"
              role="menu"
              aria-label="User menu"
            >
              <div className="flex items-center gap-3 border-b border-zinc-200 px-3.5 py-3.5 dark:border-zinc-800 sm:px-4 sm:py-4">
                <Avatar
                  name={user?.email ?? "User"}
                  className="h-10 w-10 border-zinc-200 bg-zinc-100 dark:border-zinc-700 dark:bg-zinc-800 sm:h-12 sm:w-12"
                  textClassName="text-[11px] sm:text-xs"
                />
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-zinc-900 dark:text-zinc-100 sm:text-base">
                    {displayName}
                  </p>
                  <p className="mt-0.5 truncate text-xs text-zinc-500 dark:text-zinc-400 sm:text-sm">
                    {roleLabel}
                  </p>
                </div>
              </div>

              <div className="p-2">
                <button
                  type="button"
                  className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-left text-sm font-medium text-zinc-700 transition-colors duration-300 hover:bg-zinc-100 hover:text-zinc-950 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-300 dark:text-zinc-200 dark:hover:bg-zinc-800 dark:hover:text-zinc-50 dark:focus-visible:ring-zinc-700"
                  role="menuitem"
                  onClick={() => {
                    setIsUserMenuOpen(false);
                    navigate("/profile");
                  }}
                >
                  <UserRound className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                  My Profile
                </button>
              </div>

              <div className="border-t border-zinc-200 p-2 dark:border-zinc-800">
                <button
                  type="button"
                  className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-left text-sm font-medium text-zinc-700 transition-colors duration-300 hover:bg-zinc-100 hover:text-zinc-950 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-300 dark:text-zinc-200 dark:hover:bg-zinc-800 dark:hover:text-zinc-50 dark:focus-visible:ring-zinc-700"
                  role="menuitem"
                  onClick={onLogout}
                >
                  <LogOut className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                  Log Out
                </button>
              </div>
            </div>
          )}
        </div>
      </header>
      <SideDrawer
        open={isMobileSearchOpen}
        title="Search"
        description="Search pages, tools, and actions across the app."
        onClose={() => setIsMobileSearchOpen(false)}
        widthClassName="max-w-full sm:max-w-[92vw]"
        contentClassName="px-4 py-4"
      >
        <GlobalSearchBar
          autoFocus
          compact
          inlineResults
          onSelect={() => setIsMobileSearchOpen(false)}
        />
      </SideDrawer>
    </>
  );
};
