import { LANDING_TRUST_ITEMS } from "@features/home/data/landing.data";
import { useReveal } from "@features/home/hooks/useReveal";
import { LandingIcon } from "@features/home/components/sections/LandingSectionShared";

export const TrustBarSection = () => {
  const ref = useReveal<HTMLDivElement>();

  return (
    <div ref={ref} className="reveal font-body border-y border-zinc-100 bg-zinc-50 py-5 dark:border-white/10 dark:bg-zinc-900/60">
      <div className="mx-auto flex max-w-6xl flex-wrap justify-center gap-x-10 gap-y-3 px-6">
        {LANDING_TRUST_ITEMS.map((item) => (
          <div key={item} className="flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-zinc-400 dark:text-zinc-400">
            <LandingIcon icon="check" size={13} />
            {item}
          </div>
        ))}
      </div>
    </div>
  );
};
