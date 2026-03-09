import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

import { Bell, ChevronDown, LogOut, Moon, Search, Sun } from "lucide-react";
import { Avatar } from "@shared/components/Avatar";
import { useAuth } from "@app/providers/AuthProvider";
import { useTheme } from "@app/providers/ThemeProvider";
import { cn } from "@shared/utils/cn";

const topbarControlClassName =
  "inline-flex items-center gap-2 rounded-lg border border-zinc-200 bg-white/80 px-3 py-2 text-sm text-zinc-700 shadow-sm transition-colors duration-300 hover:bg-zinc-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-400 dark:border-zinc-700 dark:bg-zinc-900/80 dark:text-zinc-200 dark:hover:bg-zinc-800 dark:focus-visible:ring-zinc-500";

const topbarIconButtonClassName = cn(
  topbarControlClassName,
  "justify-center p-2",
);

export const Topbar = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);
  const ThemeIcon = theme === "dark" ? Sun : Moon;
  const themeToggleLabel =
    theme === "dark" ? "Switch to light mode" : "Switch to dark mode";

  useEffect(() => {
    const onPointerDown = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsUserMenuOpen(false);
      }
    };

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsUserMenuOpen(false);
      }
    };

    window.addEventListener("mousedown", onPointerDown);
    window.addEventListener("keydown", onKeyDown);

    return () => {
      window.removeEventListener("mousedown", onPointerDown);
      window.removeEventListener("keydown", onKeyDown);
    };
  }, []);

  const onLogout = async () => {
    await logout();
    setIsUserMenuOpen(false);
    navigate("/login", { replace: true });
  };

  return (
    <header className="fixed left-64 right-0 top-0 z-30 flex items-center justify-between gap-4 border-b border-zinc-200/80 bg-white/75 px-6 py-4 shadow-[0_1px_0_rgba(255,255,255,0.7),0_10px_30px_rgba(15,23,42,0.06)] backdrop-blur-md transition-colors duration-300 supports-backdrop-filter:bg-white/70 dark:border-zinc-800/80 dark:bg-zinc-950/75 dark:shadow-[0_1px_0_rgba(24,24,27,0.85),0_10px_30px_rgba(0,0,0,0.3)] dark:supports-backdrop-filter:bg-zinc-950/70">
      <label className="flex flex-1 items-center gap-2 rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2 text-sm text-zinc-500 transition-colors duration-300 focus-within:border-zinc-400 focus-within:bg-white dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-400 dark:focus-within:border-zinc-500 dark:focus-within:bg-zinc-950">
        <Search className="h-4 w-4" />
        <input
          aria-label="Search jobs"
          className="w-full bg-transparent text-zinc-900 outline-none placeholder:text-zinc-400 transition-colors duration-300 dark:text-zinc-100 dark:placeholder:text-zinc-500"
          placeholder="Search job title or keywords"
        />
      </label>
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
      <button
        type="button"
        className={topbarIconButtonClassName}
        aria-label="Notifications"
      >
        <Bell className="h-5 w-5" />
      </button>
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
