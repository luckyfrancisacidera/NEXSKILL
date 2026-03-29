import { X } from "lucide-react";
import { NavLink, useLocation } from "react-router-dom";
import type { FocusEventHandler } from "react";

import { cn } from "@shared/utils/cn";
import { usePermissions } from "@shared/hooks/usePermissions";
import {
  getNavigationContext,
  isNavigationItemActive,
  resolveNavigationSection,
} from "@shared/config/appNavigation";

interface SidebarProps {
  isMobileOpen?: boolean;
  isDesktopExpanded?: boolean;
  onCloseMobile?: () => void;
  onDesktopHoverChange?: (hovered: boolean) => void;
}

interface SidebarContentProps {
  expanded: boolean;
  mobile?: boolean;
  onNavigate?: () => void;
  onClose?: () => void;
}

const SidebarContent = ({
  expanded,
  mobile = false,
  onNavigate,
  onClose,
}: SidebarContentProps) => {
  const { isSuperAdmin, isCompanyAdmin, isRecruiter } = usePermissions();
  const location = useLocation();
  const section = resolveNavigationSection({ isSuperAdmin, isCompanyAdmin, isRecruiter });
  const { eyebrow, items: navItems, title } = getNavigationContext(section);

  return (
      <div className="flex h-full flex-col rounded-r-[24px] border-r border-zinc-200 bg-white shadow-[0_18px_50px_rgba(15,23,42,0.08)] dark:border-zinc-800 dark:bg-zinc-900 dark:shadow-[0_18px_50px_rgba(0,0,0,0.32)]">
      <div
        className={cn(
          "flex h-18 items-center gap-3 border-b border-zinc-200 px-3 dark:border-zinc-800",
          expanded || mobile ? "justify-between" : "justify-start",
        )}
        >
        <div className="px-1.5 flex min-w-0 flex-1 items-center gap-3">
          <img
            src="/logo/Darkbrand_logo.png"
            alt="Nexskill logo"
            className="block h-[2.375rem] w-auto max-w-none flex-none object-contain dark:hidden"
          />
          <img
            src="/logo/Lightbrand_logo.png"
            alt="Nexskill logo"
            className="hidden h-[2.375rem] w-auto max-w-none flex-none object-contain dark:block"
          />
          <div
            className={cn(
              "min-w-0 overflow-hidden whitespace-nowrap transition-[max-width,opacity,transform] duration-300 ease-in-out",
              expanded || mobile ? "max-w-48 opacity-100 translate-x-0" : "max-w-8 opacity-100 translate-x-0",
            )}
          >
            <p className="whitespace-nowrap text-[10px] font-semibold uppercase tracking-[0.18em] text-zinc-400 dark:text-zinc-500">
              SkillSense ATS
            </p>
            <p
              className={cn(
                "truncate text-sm font-semibold text-zinc-900 transition-[max-height,opacity,margin] duration-300 ease-in-out dark:text-zinc-100",
                expanded || mobile ? "mt-0.5 max-h-8 opacity-100" : "mt-0 max-h-0 opacity-0",
              )}
              aria-hidden={!expanded && !mobile}
            >
              {title}
            </p>
          </div>
        </div>

        <div className={cn("flex h-10 w-10 shrink-0 items-center justify-center", !mobile && "invisible")}>
          {mobile ? (
            <button
              type="button"
              onClick={onClose}
              className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-zinc-200 bg-white text-zinc-600 transition hover:bg-zinc-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-400 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800 dark:focus-visible:ring-zinc-500"
              aria-label="Close sidebar"
            >
              <X className="h-5 w-5" />
            </button>
          ) : null}
        </div>
      </div>

      <div className="flex flex-1 flex-col overflow-y-auto px-3 py-4">
        <div
          className={cn(
            "mb-2 flex h-7 items-center px-2",
            mobile ? "opacity-100" : "",
          )}
          aria-hidden={!expanded && !mobile}
        >
          <div
            className={cn(
              "overflow-hidden whitespace-nowrap transition-[max-width,opacity,transform] duration-300 ease-in-out",
              expanded || mobile ? "max-w-40 opacity-100 translate-x-0" : "max-w-8 opacity-100 translate-x-0",
            )}
          >
            <div
              className={cn(
                "text-[10px] font-semibold text-zinc-500 dark:text-zinc-400",
                expanded || mobile ? "uppercase tracking-[0.22em]" : "px-3.5 tracking-normal",
              )}
            >
              {expanded || mobile ? eyebrow : <span className="block h-0.5 w-3 bg-zinc-300" />}
            </div>
          </div>
        </div>

        <nav className="space-y-1" aria-label={`${title} navigation`}>
          {navItems.map((item) => {
            const isActive = isNavigationItemActive(location.pathname, item);

            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === "/dashboard" || item.to === "/admin/company" || item.to === "/admin/super"}
                onClick={() => onNavigate?.()}
                title={!expanded ? item.label : undefined}
                className={cn(
                  "flex h-10.5 w-full items-center gap-2.5 rounded-xl px-1.5 text-xs font-medium transition-colors duration-200 ease-in-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-400 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:focus-visible:ring-zinc-500 dark:focus-visible:ring-offset-zinc-900 sm:text-sm",
                  isActive
                    ? "bg-zinc-900 text-white shadow-sm dark:bg-zinc-100 dark:text-zinc-900"
                    : "text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-100",
                )}
              >
                <span className="flex h-9 w-9 shrink-0 items-center justify-center">
                  <item.icon className="h-3.5 w-3.5 shrink-0 sm:h-4 sm:w-4" />
                </span>
                <span
                  className={cn(
                    "min-w-0 overflow-hidden whitespace-nowrap transition-[max-width,opacity,transform] duration-300 ease-in-out",
                    expanded || mobile ? "max-w-48 opacity-100 translate-x-0" : "max-w-0 opacity-0 -translate-x-1",
                  )}
                  aria-hidden={!expanded && !mobile}
                >
                  {item.label}
                </span>
              </NavLink>
            );
          })}
        </nav>

        <div className="mt-auto pt-5">
          <div
            className={cn(
              "rounded-2xl border border-zinc-200 bg-zinc-50 px-3 py-3 transition-colors duration-300 ease-in-out dark:border-zinc-800 dark:bg-zinc-800/70",
              expanded || mobile ? "min-h-24" : "min-h-12",
            )}
          >
            <div className="flex h-5 items-center overflow-hidden">
              <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-zinc-400 dark:text-zinc-500">
                {expanded || mobile ? "Workspace" : "NEX"}
              </p>
            </div>
            <div
              className={cn(
                "overflow-hidden transition-[max-height,opacity,margin] duration-300 ease-in-out",
                expanded || mobile ? "mt-2 max-h-24 opacity-100" : "mt-0 max-h-0 opacity-0",
              )}
              aria-hidden={!expanded && !mobile}
            >
              <p className="text-xs font-medium text-zinc-900 dark:text-zinc-100 sm:text-sm">
                Modern hiring operations
              </p>
              <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400 sm:text-sm">
                Keep pipeline, interviews, and hiring activity in one place.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export const Sidebar = ({
  isMobileOpen = false,
  isDesktopExpanded = false,
  onCloseMobile,
  onDesktopHoverChange,
}: SidebarProps) => {
  const handleDesktopBlur: FocusEventHandler<HTMLElement> = (event) => {
    if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
      onDesktopHoverChange?.(false);
    }
  };

  return (
    <>
      <aside
        className={cn(
          "pointer-events-auto fixed inset-y-0 left-0 z-50 hidden overflow-visible lg:block lg:transition-[width] lg:duration-300 lg:ease-in-out",
          isDesktopExpanded ? "lg:w-72" : "lg:w-20",
        )}
        aria-label="Sidebar navigation"
        onMouseEnter={() => {
          onDesktopHoverChange?.(true);
        }}
        onMouseLeave={() => onDesktopHoverChange?.(false)}
        onFocusCapture={() => onDesktopHoverChange?.(true)}
        onBlurCapture={handleDesktopBlur}
      >
        <div className="h-full overflow-hidden">
          <SidebarContent expanded={isDesktopExpanded} />
        </div>
      </aside>

      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex w-68 max-w-[85vw] flex-col shadow-[0_18px_50px_rgba(15,23,42,0.12)] transition-transform duration-300 dark:shadow-[0_18px_50px_rgba(0,0,0,0.35)] lg:hidden",
          isMobileOpen ? "translate-x-0" : "-translate-x-full",
        )}
        aria-label="Sidebar navigation"
      >
        <SidebarContent expanded mobile onClose={onCloseMobile} onNavigate={onCloseMobile} />
      </aside>
    </>
  );
};
