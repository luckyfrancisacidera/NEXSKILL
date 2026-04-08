import { Link } from "react-router-dom";
import { LandingIcon } from "@features/home/components/sections/LandingSectionShared";
import { useTheme } from "@app/providers/ThemeProvider";

export const HeroSection = () => {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const heroImageSrc = isDark ? "/hero/hero-dark.jpg" : "/hero/hero-light.jpg";

  return (
    <section className="hero-bg font-body relative flex min-h-screen items-center overflow-hidden pt-20">
      <div
        className="absolute right-0 top-32 h-[520px] w-[520px] rounded-full"
        style={{
          background: isDark
            ? "radial-gradient(circle, rgba(96,165,250,0.18) 0%, transparent 70%)"
            : "radial-gradient(circle, rgba(161,161,170,0.12) 0%, transparent 70%)",
        }}
      />
      <div
        className="absolute bottom-0 left-0 h-[380px] w-[380px] rounded-full"
        style={{
          background: isDark
            ? "radial-gradient(circle, rgba(244,114,182,0.14) 0%, transparent 70%)"
            : "radial-gradient(circle, rgba(212,212,216,0.15) 0%, transparent 70%)",
        }}
      />

      <div className="mx-auto w-full max-w-6xl px-6 py-20">
        <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-8">
          <div className="relative z-10 space-y-7">
            <div className="inline-flex items-center gap-2 rounded-full border border-zinc-200 bg-white/80 px-4 py-1.5 shadow-sm backdrop-blur-sm dark:border-white/10 dark:bg-white/5">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-zinc-500 dark:bg-zinc-300" />
              <span className="text-xs font-medium uppercase tracking-wide text-zinc-500 dark:text-zinc-300">
                Semantic ATS Platform
              </span>
            </div>

            <h1 className="font-display text-[3.2rem] leading-[1.08] text-zinc-800 dark:text-zinc-100 sm:text-[3.8rem]">
              Hiring that
              <br />
              <em className="italic text-zinc-500 dark:text-zinc-400">understands</em> your candidates.
            </h1>

            <p className="max-w-md text-lg font-light leading-relaxed text-zinc-500 dark:text-zinc-300">
              SkillSense helps companies hire faster with semantic screening, ranked shortlists, and structured ATS workflows.
              Jobseekers can apply for free while your team pays only for hiring tools.
            </p>

            <div className="flex flex-wrap gap-3 pt-1">
              <Link to="/signup" className="btn-primary inline-flex items-center gap-2 rounded-xl px-6 py-3 text-sm font-semibold">
                Start Hiring
                <LandingIcon icon="arrow" size={16} />
              </Link>
              <a
                href="#pricing"
                className="inline-flex items-center gap-2 rounded-xl border border-zinc-200 bg-white px-6 py-3 text-sm font-semibold text-zinc-700 transition-all hover:border-zinc-400 hover:bg-zinc-50 dark:border-white/10 dark:bg-white/5 dark:text-zinc-100 dark:hover:bg-white/10"
              >
                View Company Plans
              </a>
            </div>

            <div className="flex items-center gap-4 pt-2">
              <div className="flex -space-x-2">
                {["#a1a1aa", "#71717a", "#52525b", "#3f3f46"].map((color) => (
                  <div key={color} className="h-7 w-7 rounded-full border-2 border-white dark:border-zinc-950" style={{ background: color }} />
                ))}
              </div>
              <p className="text-sm text-zinc-400 dark:text-zinc-400">Built for hiring teams, recruiters, and candidate-friendly applications</p>
            </div>
          </div>

          <div className="relative hidden h-[340px] sm:block lg:h-[520px]">
            <div className={`hero-image-wrap h-full w-full ${isDark ? "hero-image-wrap-dark" : "hero-image-wrap-light"}`}>
              <img
                src={heroImageSrc}
                alt="SkillSense recruitment dashboard"
                className="h-full w-full rounded-2xl object-cover object-center"
              />
            </div>
            <div className="absolute bottom-8 left-4 flex items-center gap-3 rounded-xl border border-zinc-100 bg-white px-4 py-3 shadow-lg dark:border-white/10 dark:bg-zinc-900/95">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-zinc-100 text-zinc-600 dark:bg-white/10 dark:text-zinc-200">
                <LandingIcon icon="target" size={18} />
              </div>
              <div>
                <p className="text-[11px] font-medium uppercase tracking-wide text-zinc-400 dark:text-zinc-500">Match Accuracy</p>
                <p className="text-sm font-semibold text-zinc-800 dark:text-zinc-100">Semantically ranked results</p>
              </div>
            </div>
            <div className="absolute right-2 top-8 flex items-center gap-3 rounded-xl border border-zinc-100 bg-white px-4 py-3 shadow-lg dark:border-white/10 dark:bg-zinc-900/95">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-zinc-800 text-white">
                <LandingIcon icon="brain" size={18} />
              </div>
              <div>
                <p className="text-[11px] font-medium text-zinc-400 dark:text-zinc-500">AI Insights</p>
                <p className="text-sm font-semibold text-zinc-800 dark:text-zinc-100">Explainable fit scores</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
