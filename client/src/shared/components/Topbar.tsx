import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

import { Bell, ChevronDown, LogOut, Search } from "lucide-react";
import { Avatar } from "@shared/components/Avatar";
import { useAuth } from "@app/providers/AuthProvider";

export const Topbar = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const onPointerDown = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsUserMenuOpen(false);
      }
    };

    window.addEventListener("mousedown", onPointerDown);
    return () => window.removeEventListener("mousedown", onPointerDown);
  }, []);

  const onLogout = async () => {
    await logout();
    setIsUserMenuOpen(false);
    navigate("/login", { replace: true });
  };

  return (
    <header className="fixed left-64 right-0 top-0 z-30 flex items-center justify-between gap-4 border-b border-white/60 bg-white/40 px-6 py-4 shadow-[0_1px_0_rgba(255,255,255,0.7),0_10px_30px_rgba(15,23,42,0.06)] backdrop-blur-md transition-all duration-300 supports-backdrop-filter:bg-white/70">
            {" "}
      <label className="flex flex-1 items-center gap-2 rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2 text-sm text-zinc-500">
        <Search className="h-4 w-4" />
        <input
          aria-label="Search jobs"
          className="w-full bg-transparent text-zinc-900 outline-none placeholder:text-zinc-400"
          placeholder="Search job title or keywords"
        />
      </label>
      <button className="flex items-center gap-2 rounded-lg border border-zinc-200 px-3 py-2 text-sm text-zinc-700 hover:bg-zinc-100">
        Remote
        <ChevronDown className="h-4 w-4" />
      </button>
      <button
        className="rounded-lg border border-zinc-200 p-2 hover:bg-zinc-100"
        aria-label="Notifications"
      >
        <Bell className="h-5 w-5 text-zinc-700" />
      </button>
      <div className="relative" ref={menuRef}>
        <button
          type="button"
          className="rounded-full"
          aria-haspopup="menu"
          aria-expanded={isUserMenuOpen}
          onClick={() => setIsUserMenuOpen((current) => !current)}
        >
          <Avatar name={user?.email ?? "User"} />
        </button>

        {isUserMenuOpen && (
          <div className="absolute right-0 top-12 z-20 min-w-44 rounded-lg border border-zinc-200 bg-white p-2 shadow-lg">
            <button
              type="button"
              className="flex w-full items-center gap-2 rounded-md bg-red-50 px-3 py-2 text-left text-sm font-medium text-red-700 hover:bg-red-100"
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
