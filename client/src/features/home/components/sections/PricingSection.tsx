import { LANDING_PLANS } from "@features/home/data/landing.data";
import { useReveal } from "@features/home/hooks/useReveal";
import { LandingIcon, PricingCard, RevealTitle } from "@features/home/components/sections/LandingSectionShared";

export const PricingSection = () => {
  const noteRef = useReveal<HTMLDivElement>();

  return (
    <section id="pricing" className="font-body border-t border-zinc-100 bg-white py-28 dark:border-white/10 dark:bg-zinc-950">
      <div className="mx-auto max-w-6xl px-6">
        <RevealTitle
          eyebrow="Plans for Companies"
          title="Simple pricing for"
          accent="teams that hire."
          description="Companies pay for hiring tools and ATS workflows. Jobseekers can create accounts and apply for free."
        />

        <div ref={noteRef} className="reveal mb-12 flex justify-center">
          <div className="inline-flex items-center gap-2.5 rounded-xl border border-zinc-200 bg-zinc-50 px-5 py-3 dark:border-white/10 dark:bg-zinc-900">
            <span className="flex-shrink-0 text-zinc-500 dark:text-zinc-300">
              <LandingIcon icon="user" size={15} />
            </span>
            <p className="text-sm leading-snug text-zinc-500 dark:text-zinc-300">
              Jobseekers do not need a subscription to apply.
              <span className="text-zinc-400 dark:text-zinc-500"> Plans below are only for companies and hiring teams.</span>
            </p>
          </div>
        </div>

        <div className="relative">
          <div className="scrollbar-hide flex snap-x snap-mandatory gap-5 overflow-x-auto px-6 scroll-smooth md:grid md:grid-cols-3 md:overflow-visible md:px-0">
            {LANDING_PLANS.map((plan) => (
              <div key={plan.name} className="min-w-[85%] flex-shrink-0 snap-center md:min-w-0 md:flex-shrink">
                <PricingCard {...plan} />
              </div>
            ))}
          </div>
          <div className="pointer-events-none absolute right-0 top-0 h-full w-12 bg-gradient-to-l from-white to-transparent dark:from-zinc-950 md:hidden" />
        </div>

        <p className="mt-5 select-none text-center text-xs tracking-wide text-zinc-300 dark:text-zinc-500 md:hidden">Swipe to explore -&gt;</p>
      </div>
    </section>
  );
};
