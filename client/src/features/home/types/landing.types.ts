export type IconName =
  | "arrow"
  | "brain"
  | "check"
  | "cpu"
  | "dashboard"
  | "insight"
  | "menu"
  | "star"
  | "target"
  | "upload"
  | "user"
  | "x";

export type LandingPlan = {
  name: string;
  price: string;
  period: string;
  badge: string | null;
  description: string;
  features: string[];
  variant: "basic" | "standard" | "premium";
  cta: string;
  ctaTo: string;
};

export type LandingFeature = {
  icon: IconName;
  title: string;
  description: string;
};

export type LandingStep = {
  number: string;
  icon: IconName;
  title: string;
  description: string;
};

export type LandingComparison = {
  label: string;
  items: string[];
  highlight?: boolean;
};
