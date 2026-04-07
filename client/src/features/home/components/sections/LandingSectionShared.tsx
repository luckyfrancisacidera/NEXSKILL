import { Link } from "react-router-dom";
import { useTheme } from "@app/providers/ThemeProvider";
import { useReveal } from "@features/home/hooks/useReveal";
import type { IconName, LandingPlan } from "@features/home/types/landing.types";

export const LandingIcon = ({ icon, size = 20 }: { icon: IconName; size?: number }) => {
  const paths: Record<IconName, string> = {
    arrow: "M5 12h14M12 5l7 7-7 7",
    brain: "M9.5 2a4.5 4.5 0 0 1 0 9m5-9a4.5 4.5 0 0 1 0 9M4 20a8 8 0 0 1 16 0",
    check: "M20 6L9 17l-5-5",
    cpu: "M9 3H5a2 2 0 0 0-2 2v4m6-6h10a2 2 0 0 1 2 2v4M9 3v18m0 0h10a2 2 0 0 0 2-2V9M9 21H5a2 2 0 0 1-2-2V9m0 0h18",
    dashboard: "M3 3h7v7H3zM14 3h7v7h-7zM3 14h7v7H3zM14 14h7v7h-7z",
    insight: "M12 20V10M18 20V4M6 20v-4",
    menu: "M3 12h18M3 6h18M3 18h18",
    star: "M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z",
    target: "M12 2a10 10 0 1 0 0 20A10 10 0 0 0 12 2zm0 6a4 4 0 1 0 0 8 4 4 0 0 0 0-8zm0 2a2 2 0 1 1 0 4 2 2 0 0 1 0-4",
    upload: "M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M17 8l-5-5-5 5M12 3v12",
    user: "M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z",
    x: "M18 6 6 18M6 6l12 12",
  };

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d={paths[icon]} />
    </svg>
  );
};

export const RevealTitle = ({
  eyebrow,
  title,
  accent,
  description,
}: {
  eyebrow: string;
  title: string;
  accent?: string;
  description?: string;
}) => {
  const ref = useReveal<HTMLDivElement>();

  return (
    <div ref={ref} className="reveal mb-16 space-y-3 text-center">
      <p className="text-xs font-semibold uppercase tracking-widest text-zinc-400 dark:text-zinc-500">{eyebrow}</p>
      <h2 className="font-display text-4xl leading-tight text-zinc-800 dark:text-zinc-100 sm:text-5xl">
        {title}
        {accent ? (
          <>
            <br />
            <em className="italic text-zinc-400 dark:text-zinc-500">{accent}</em>
          </>
        ) : null}
      </h2>
      {description ? (
        <p className="mx-auto max-w-xl pt-1 text-base leading-relaxed text-zinc-400 dark:text-zinc-400">
          {description}
        </p>
      ) : null}
    </div>
  );
};

export const PricingCard = ({
  name,
  price,
  period,
  badge,
  description,
  tagline,
  features,
  variant,
  cta,
  ctaTo,
}: LandingPlan) => {
  const isTrial = variant === "trial";
  const isPremium = variant === "premium";
  const isStandard = variant === "standard";
  const { theme } = useTheme();

  const cardStyle = isPremium
    ? theme === "dark"
      ? {
          background: "linear-gradient(145deg, #52525b 0%, #27272a 40%, #09090b 100%)",
          borderColor: "transparent",
          boxShadow: "0 10px 40px rgba(0,0,0,0.45)",
        }
      : {
          background: "linear-gradient(145deg, #3f3f46 0%, #27272a 45%, #18181b 100%)",
          borderColor: "transparent",
          boxShadow: "0 8px 40px rgba(39,39,42,0.22)",
        }
    : isStandard
      ? theme === "dark"
        ? {
            background: "linear-gradient(145deg, #18181b 0%, #111827 100%)",
            borderColor: "rgba(255,255,255,0.10)",
            boxShadow: "0 8px 30px rgba(0,0,0,0.30)",
          }
        : {
            background: "linear-gradient(145deg, #fafafa 0%, #f4f4f5 100%)",
            borderColor: "#e4e4e7",
            boxShadow: "0 4px 20px rgba(0,0,0,0.07)",
          }
      : isTrial
        ? theme === "dark"
          ? {
              background: "linear-gradient(145deg, #111827 0%, #09090b 100%)",
              borderColor: "rgba(255,255,255,0.10)",
              boxShadow: "0 8px 24px rgba(0,0,0,0.24)",
            }
          : {
              background: "linear-gradient(145deg, #ffffff 0%, #f8fafc 100%)",
              borderColor: "#e4e4e7",
              boxShadow: "0 2px 12px rgba(0,0,0,0.04)",
            }
      : theme === "dark"
        ? {
            background: "#09090b",
            borderColor: "rgba(255,255,255,0.10)",
            boxShadow: "0 8px 24px rgba(0,0,0,0.28)",
          }
        : {
            background: "#ffffff",
            borderColor: "#e4e4e7",
            boxShadow: "0 2px 12px rgba(0,0,0,0.04)",
          };

  return (
    <div
      className={[
        "relative flex h-full flex-col rounded-2xl p-7",
        isPremium ? "pricing-card-dark text-white" : "pricing-card-light border",
        !isPremium ? "dark:border-white/10 dark:bg-zinc-900" : "",
      ].join(" ")}
      style={cardStyle}
    >
      {badge ? (
        <div
          className={`absolute -top-3 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-widest ${
            isPremium ? "bg-white text-zinc-800" : "bg-zinc-800 text-white dark:bg-zinc-100 dark:text-zinc-900"
          }`}
        >
          {badge}
        </div>
      ) : null}

      <p className="mb-4 text-xs font-semibold uppercase tracking-widest text-zinc-400 dark:text-zinc-500">{name}</p>
      <div className="mb-2 flex items-end gap-1">
        <span className={`font-display text-4xl leading-none ${isPremium ? "text-white" : "text-zinc-800 dark:text-zinc-100"}`}>
          {price}
        </span>
        <span className="mb-0.5 text-sm text-zinc-400 dark:text-zinc-500">{period}</span>
      </div>
      {tagline ? (
        <p className={`mb-2 text-[11px] font-semibold uppercase tracking-[0.18em] ${isPremium ? "text-zinc-500" : "text-zinc-400 dark:text-zinc-500"}`}>
          {tagline}
        </p>
      ) : null}
      <p className={`mb-6 text-sm leading-relaxed ${isPremium ? "text-zinc-400" : "text-zinc-500 dark:text-zinc-400"}`}>
        {description}
      </p>
      <div className={`mb-6 h-px ${isPremium ? "bg-zinc-700" : "bg-zinc-100 dark:bg-white/10"}`} />

      <ul className="mb-7 flex-1 space-y-3">
        {features.map((feature) => (
          <li key={feature} className="flex items-start gap-2.5">
            <span className={`mt-0.5 flex-shrink-0 ${isPremium ? "text-zinc-300" : "text-zinc-500 dark:text-zinc-300"}`}>
              <LandingIcon icon="check" size={14} />
            </span>
            <span className={`text-sm leading-relaxed ${isPremium ? "text-zinc-300" : "text-zinc-500 dark:text-zinc-400"}`}>
              {feature}
            </span>
          </li>
        ))}
      </ul>

      <Link
        to={ctaTo}
        className={`inline-flex w-full items-center justify-center rounded-xl py-3 text-sm font-semibold transition-all duration-200 ${
          isPremium
            ? "bg-white text-zinc-800 hover:bg-zinc-100 hover:shadow-lg"
            : isStandard
              ? "bg-zinc-800 text-white hover:bg-zinc-900 hover:shadow-[0_8px_24px_rgba(39,39,42,0.22)] dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-white"
              : isTrial
                ? "border border-zinc-300 bg-zinc-100 text-zinc-800 hover:border-zinc-400 hover:bg-zinc-50 dark:border-white/10 dark:bg-white/10 dark:text-zinc-100 dark:hover:bg-white/15"
              : "border border-zinc-200 text-zinc-700 hover:border-zinc-400 hover:bg-zinc-50 dark:border-white/10 dark:text-zinc-100 dark:hover:bg-white/10"
        }`}
      >
        {cta}
      </Link>
    </div>
  );
};
