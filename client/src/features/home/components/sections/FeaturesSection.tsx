import { LANDING_FEATURES } from "@features/home/data/landing.data";
import { useReveal } from "@features/home/hooks/useReveal";
import type { IconName } from "@features/home/types/landing.types";
import { LandingIcon, RevealTitle } from "@features/home/components/sections/LandingSectionShared";

const FeatureCard = ({
  title,
  description,
  icon,
  index,
}: {
  title: string;
  description: string;
  icon: IconName;
  index: number;
}) => {
  const ref = useReveal<HTMLDivElement>();
  const delay = [100, 200, 300][index % 3];

  return (
    <div
      ref={ref}
      className={`reveal feature-card rounded-2xl border border-zinc-100 bg-white p-7 shadow-[0_2px_12px_rgba(0,0,0,0.04)] delay-${delay} dark:border-white/10 dark:bg-zinc-900`}
    >
      <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl border border-zinc-100 bg-zinc-50 text-zinc-600 dark:border-white/10 dark:bg-white/5 dark:text-zinc-200">
        <LandingIcon icon={icon} size={19} />
      </div>
      <h3 className="mb-1.5 text-base font-semibold text-zinc-800 dark:text-zinc-100">{title}</h3>
      <p className="text-sm leading-relaxed text-zinc-400 dark:text-zinc-400">{description}</p>
    </div>
  );
};

export const FeaturesSection = () => (
  <section id="features" className="font-body bg-white py-28 dark:bg-zinc-950">
    <div className="mx-auto max-w-6xl px-6">
      <RevealTitle
        eyebrow="Platform Features"
        title="Everything a hiring team needs"
        accent="to move faster."
        description="Semantic search, ranked shortlists, and pipeline visibility help companies make better hiring decisions with less manual screening."
      />

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {LANDING_FEATURES.map((feature, index) => (
          <FeatureCard key={feature.title} index={index} title={feature.title} description={feature.description} icon={feature.icon} />
        ))}
      </div>
    </div>
  </section>
);
