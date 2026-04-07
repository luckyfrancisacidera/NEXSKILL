import { LANDING_STEPS } from "@features/home/data/landing.data";
import { useReveal } from "@features/home/hooks/useReveal";
import type { IconName } from "@features/home/types/landing.types";
import { LandingIcon, RevealTitle } from "@features/home/components/sections/LandingSectionShared";

const StepCard = ({
  number,
  title,
  description,
  icon,
  index,
}: {
  number: string;
  title: string;
  description: string;
  icon: IconName;
  index: number;
}) => {
  const ref = useReveal<HTMLDivElement>();
  const delay = Math.min((index + 1) * 100, 400);

  return (
    <div
      ref={ref}
      className={`reveal rounded-2xl border border-zinc-100 bg-white p-7 shadow-[0_2px_12px_rgba(0,0,0,0.04)] delay-${delay} dark:border-white/10 dark:bg-zinc-900`}
    >
      <div className="mb-4 flex items-center justify-between">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-zinc-800 text-white dark:bg-white dark:text-zinc-900">
          <LandingIcon icon={icon} size={18} />
        </div>
        <span className="font-display select-none text-4xl text-zinc-100 dark:text-white/10">{number}</span>
      </div>
      <h3 className="mb-1.5 text-base font-semibold text-zinc-800 dark:text-zinc-100">{title}</h3>
      <p className="text-sm leading-relaxed text-zinc-400 dark:text-zinc-400">{description}</p>
    </div>
  );
};

export const HowItWorksSection = () => (
  <section id="how-it-works" className="font-body border-y border-zinc-100 bg-zinc-50 py-28 dark:border-white/10 dark:bg-zinc-900/60">
    <div className="mx-auto max-w-6xl px-6">
      <RevealTitle eyebrow="Process" title="Four steps from role posting" accent="to shortlist." />

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {LANDING_STEPS.map((step, index) => (
          <StepCard
            key={step.number}
            index={index}
            number={step.number}
            title={step.title}
            description={step.description}
            icon={step.icon}
          />
        ))}
      </div>
    </div>
  </section>
);
