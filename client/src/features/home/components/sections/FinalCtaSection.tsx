import { Link } from "react-router-dom";
import { useReveal } from "@features/home/hooks/useReveal";
import { LandingIcon } from "@features/home/components/sections/LandingSectionShared";

export const FinalCtaSection = () => {
  const ref = useReveal<HTMLDivElement>();

  return (
    <section className="font-body border-t border-zinc-100 bg-zinc-50 py-28 dark:border-white/10 dark:bg-zinc-900/60">
      <div className="mx-auto max-w-3xl px-6 text-center">
        <div ref={ref} className="reveal space-y-6">
          <p className="text-xs font-semibold uppercase tracking-widest text-zinc-400 dark:text-zinc-500">Get Started</p>
          <h2 className="font-display text-4xl leading-tight text-zinc-800 dark:text-zinc-100 sm:text-5xl">
            Ready to hire
            <br />
            <em className="italic text-zinc-400 dark:text-zinc-500">smarter?</em>
          </h2>
          <p className="mx-auto max-w-md text-base leading-relaxed text-zinc-400 dark:text-zinc-400">
            Launch your hiring workflow with SkillSense. Candidates stay free to apply, while your team gets the tools to review and shortlist faster.
          </p>
          <div className="flex flex-wrap justify-center gap-3 pt-2">
            <Link to="/login" className="btn-primary inline-flex items-center gap-2 rounded-xl px-7 py-3.5 text-sm font-semibold">
              Sign In
              <LandingIcon icon="arrow" size={16} />
            </Link>
            <Link
              to="/signup"
              className="inline-flex items-center gap-2 rounded-xl border border-zinc-200 bg-white px-7 py-3.5 text-sm font-semibold text-zinc-700 transition-all hover:border-zinc-400 dark:border-white/10 dark:bg-white/5 dark:text-zinc-100 dark:hover:bg-white/10"
            >
              Sign Up as Jobseeker
            </Link>
            <Link
              to="/signup?account=company"
              className="inline-flex items-center gap-2 rounded-xl border border-zinc-200 bg-white px-7 py-3.5 text-sm font-semibold text-zinc-700 transition-all hover:border-zinc-400 dark:border-white/10 dark:bg-white/5 dark:text-zinc-100 dark:hover:bg-white/10"
            >
              Request Company Account
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};
