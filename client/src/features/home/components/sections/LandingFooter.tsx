import { Link } from "react-router-dom";

export const LandingFooter = () => (
  <footer className="font-body border-t border-transparent bg-zinc-800 py-10 text-zinc-400 dark:border-white/10 dark:bg-black">
    <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-6 sm:flex-row">
      <div className="flex items-center gap-3">
        <img src="/logo/Lightbrand_logo.png" alt="SkillSense logo" className="h-8 w-auto object-contain" />
        <span className="text-sm font-medium text-white">SkillSense</span>
        <span className="ml-2 text-xs text-zinc-600">Semantic ATS Platform</span>
      </div>
      <p className="text-xs text-zinc-500">© 2025 SkillSense. Capstone / Thesis Project - Academic Use.</p>
      <div className="flex gap-5 text-xs">
        <Link to="/privacy" className="transition-colors hover:text-zinc-200">
          Privacy
        </Link>
        <Link to="/terms" className="transition-colors hover:text-zinc-200">
          Terms
        </Link>
        <Link to="/signup" className="transition-colors hover:text-zinc-200">
          Contact
        </Link>
      </div>
    </div>
  </footer>
);
