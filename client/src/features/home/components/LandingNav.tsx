import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "@app/providers/ThemeProvider";
import { LANDING_NAV_ITEMS } from "@features/home/data/landing.data";

const MenuIcon = ({ open }: { open: boolean }) => (
  <svg
    width="22"
    height="22"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.6"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d={open ? "M18 6 6 18M6 6l12 12" : "M3 12h18M3 6h18M3 18h18"} />
  </svg>
);

export const LandingNav = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isGetStartedOpen, setIsGetStartedOpen] = useState(false);
  const { theme, toggleTheme } = useTheme();
  const logoSrc = theme === "dark" ? "/logo/Lightbrand_logo.png" : "/logo/Darkbrand_logo.png";
  const themeLabel = theme === "dark" ? "Switch to light mode" : "Switch to dark mode";

  useEffect(() => {
    const onScroll = () => setIsScrolled(window.scrollY > 24);

    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const onDocumentClick = (event: MouseEvent) => {
      const target = event.target as HTMLElement | null;
      if (target?.closest("[data-get-started-menu]")) {
        return;
      }

      setIsGetStartedOpen(false);
    };

    document.addEventListener("click", onDocumentClick);
    return () => document.removeEventListener("click", onDocumentClick);
  }, []);

  return (
    <nav
      className={[
        "font-body fixed left-0 right-0 top-0 z-50 transition-all duration-300",
        isScrolled
          ? "border-b border-zinc-100 bg-white/95 shadow-sm backdrop-blur-md dark:border-white/10 dark:bg-zinc-950/90"
          : "bg-transparent",
      ].join(" ")}
    >
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Link to="/" className="flex items-center gap-2.5">
          <img src={logoSrc} alt="SkillSense logo" className="h-10 w-auto object-contain" />
          <span className="text-[15px] font-semibold tracking-tight text-zinc-800 dark:text-zinc-100">SkillSense</span>
        </Link>

        <div className="hidden items-center gap-8 md:flex">
          {LANDING_NAV_ITEMS.map((item) => (
            <a
              key={item.label}
              href={item.href}
              className="nav-link text-sm font-medium text-zinc-500 transition-colors hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-100"
            >
              {item.label}
            </a>
          ))}
        </div>

        <div className="hidden items-center gap-3 md:flex">
          <button
            type="button"
            onClick={toggleTheme}
            aria-label={themeLabel}
            className="rounded-lg border border-zinc-200 bg-white/80 p-2 text-zinc-700 transition-colors hover:border-zinc-300 hover:bg-zinc-50 dark:border-white/10 dark:bg-white/5 dark:text-zinc-200 dark:hover:bg-white/10"
          >
            {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
          </button>
          <Link to="/login" className="px-3 py-2 text-sm font-medium text-zinc-600 transition-colors hover:text-zinc-800 dark:text-zinc-300 dark:hover:text-zinc-100">
            Sign In
          </Link>
          <div className="relative" data-get-started-menu>
            <button
              type="button"
              onClick={(event) => {
                event.stopPropagation();
                setIsGetStartedOpen((value) => !value);
              }}
              className="btn-primary rounded-lg px-4 py-2 text-sm font-medium"
            >
              Get Started
            </button>

            {isGetStartedOpen ? (
              <div className="absolute right-0 top-full mt-3 w-64 rounded-2xl border border-zinc-200 bg-white p-3 shadow-xl dark:border-white/10 dark:bg-zinc-900">
                <div className="flex flex-col gap-2">
                  <Link
                    to="/signup"
                    className="rounded-xl px-4 py-3 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-50 dark:text-zinc-100 dark:hover:bg-white/10"
                    onClick={() => setIsGetStartedOpen(false)}
                  >
                    Sign Up as Jobseeker
                  </Link>
                  <Link
                    to="/signup?account=company"
                    className="rounded-xl px-4 py-3 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-50 dark:text-zinc-100 dark:hover:bg-white/10"
                    onClick={() => setIsGetStartedOpen(false)}
                  >
                    Request Company Account
                  </Link>
                </div>
              </div>
            ) : null}
          </div>
        </div>

        <div className="flex items-center gap-2 md:hidden">
          <button
            type="button"
            onClick={toggleTheme}
            aria-label={themeLabel}
            className="rounded-lg border border-zinc-200 bg-white/80 p-2 text-zinc-700 dark:border-white/10 dark:bg-white/5 dark:text-zinc-200"
          >
            {theme === "dark" ? <Sun size={16} /> : <Moon size={16} />}
          </button>
          <button type="button" className="text-zinc-700 dark:text-zinc-100" onClick={() => setIsOpen((value) => !value)}>
          <MenuIcon open={isOpen} />
          </button>
        </div>
      </div>

      {isOpen ? (
        <div className="flex flex-col gap-4 border-t border-zinc-100 bg-white px-6 py-4 dark:border-white/10 dark:bg-zinc-950 md:hidden">
          {LANDING_NAV_ITEMS.map((item) => (
            <a
              key={item.label}
              href={item.href}
              className="text-sm font-medium text-zinc-600 dark:text-zinc-300"
              onClick={() => setIsOpen(false)}
            >
              {item.label}
            </a>
          ))}
          <div className="flex flex-col gap-3 border-t border-zinc-100 pt-2 dark:border-white/10">
            <Link to="/login" className="py-2 text-sm font-medium text-zinc-600 dark:text-zinc-300" onClick={() => setIsOpen(false)}>
              Sign In
            </Link>
            <Link to="/signup" className="rounded-lg border border-zinc-200 bg-white px-4 py-2 text-sm font-medium text-zinc-700 dark:border-white/10 dark:bg-white/5 dark:text-zinc-100" onClick={() => setIsOpen(false)}>
              Sign Up as Jobseeker
            </Link>
            <Link to="/signup?account=company" className="btn-primary rounded-lg px-4 py-2 text-sm font-medium" onClick={() => setIsOpen(false)}>
              Request Company Account
            </Link>
          </div>
        </div>
      ) : null}
    </nav>
  );
};
