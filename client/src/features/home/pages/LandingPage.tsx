import "@features/home/styles/landing-page.css";
import { LandingNav } from "@features/home/components/LandingNav";
import {
  FeaturesSection,
  FinalCtaSection,
  HeroSection,
  HowItWorksSection,
  LandingFooter,
  PricingSection,
  TrustBarSection,
  WhySkillSenseSection,
} from "@features/home/components/sections";

export default function LandingPage() {
  return (
    <div className="font-body overflow-x-hidden bg-white text-zinc-800 antialiased transition-colors duration-300 dark:bg-zinc-950 dark:text-zinc-100">
      <LandingNav />
      <HeroSection />
      <TrustBarSection />
      <FeaturesSection />
      <HowItWorksSection />
      <WhySkillSenseSection />
      <PricingSection />
      <FinalCtaSection />
      <LandingFooter />
    </div>
  );
}
