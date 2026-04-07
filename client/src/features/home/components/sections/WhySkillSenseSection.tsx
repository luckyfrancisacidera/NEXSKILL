import { LANDING_COMPARISONS } from "@features/home/data/landing.data";
import { useReveal } from "@features/home/hooks/useReveal";
import { LandingIcon, RevealTitle } from "@features/home/components/sections/LandingSectionShared";

const ComparisonCard = ({
  label,
  items,
  highlight = false,
}: {
  label: string;
  items: string[];
  highlight?: boolean;
}) => {
  const ref = useReveal<HTMLDivElement>();

  return (
    <div
      ref={ref}
      className={`reveal rounded-2xl border p-8 ${
        highlight
          ? "border-zinc-700 bg-zinc-800 shadow-[0_8px_40px_rgba(39,39,42,0.18)]"
          : "border-zinc-100 bg-zinc-50 dark:border-white/10 dark:bg-zinc-900"
      }`}
    >
      <div
        className={`mb-5 inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-semibold uppercase tracking-widest ${
          highlight ? "bg-zinc-700 text-zinc-300" : "bg-zinc-200 text-zinc-500 dark:bg-white/10 dark:text-zinc-300"
        }`}
      >
        {highlight ? <LandingIcon icon="star" size={12} /> : null}
        {label}
      </div>
      <ul className="space-y-3">
        {items.map((item) => (
          <li key={item} className="flex items-start gap-3">
            <span className="mt-0.5 flex-shrink-0 text-zinc-300">
              <LandingIcon icon={highlight ? "check" : "x"} size={15} />
            </span>
            <span className={`text-sm leading-relaxed ${highlight ? "text-zinc-200" : "text-zinc-400 dark:text-zinc-400"}`}>
              {item}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
};

export const WhySkillSenseSection = () => (
  <section id="why-skillsense" className="font-body bg-white py-28 dark:bg-zinc-950">
    <div className="mx-auto max-w-5xl px-6">
      <RevealTitle
        eyebrow="Why It Matters"
        title="Keyword matching is"
        accent="not enough anymore."
        description="Traditional ATS platforms filter by exact terms and miss strong applicants. SkillSense reads meaning, context, and adjacent skills the way good recruiters do."
      />

      <div className="grid gap-6 md:grid-cols-2">
        {LANDING_COMPARISONS.map((comparison) => (
          <ComparisonCard key={comparison.label} {...comparison} />
        ))}
      </div>
    </div>
  </section>
);
