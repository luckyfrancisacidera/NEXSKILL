import type {
  LandingComparison,
  LandingFeature,
  LandingPlan,
  LandingStep,
} from "@features/home/types/landing.types";

export const LANDING_NAV_ITEMS = [
  { label: "Features", href: "#features" },
  { label: "How it Works", href: "#how-it-works" },
  { label: "Why SkillSense", href: "#why-skillsense" },
  { label: "Pricing", href: "#pricing" },
] as const;

export const LANDING_PLANS: LandingPlan[] = [
  {
    id: "free-trial",
    name: "Free Trial",
    price: "₱0",
    period: "/14 days",
    badge: "14-Day Trial",
    description: "Try SkillSense with one active job post before upgrading.",
    tagline: "No upfront payment. Best for first-time setup.",
    features: [
      "1 active job post",
      "Up to 25 resume screenings",
      "Semantic matching enabled",
      "Basic ATS pipeline access",
      "Analytics locked",
      "14-day access",
    ],
    variant: "trial",
    cta: "Start Free Trial",
    ctaTo: "/company-account-request",
  },
  {
    id: "basic",
    name: "Basic",
    price: "₱500",
    period: "/month",
    badge: null,
    description: "A solid starting point for teams hiring at a steady pace.",
    tagline: "Best for first paid hiring workflows.",
    features: [
      "120 resume screenings / month",
      "2 active job posts",
      "Core semantic matching + explanation",
      "Full ATS pipeline + analytics",
    ],
    variant: "basic",
    cta: "Choose Plan",
    ctaTo: "/company-account-request",
  },
  {
    id: "standard",
    name: "Standard",
    price: "₱1,200",
    period: "/month",
    badge: "Most Popular",
    description: "For growing teams managing multiple openings at once.",
    tagline: "Balanced capacity for active recruitment.",
    features: [
      "300-400 screenings / month",
      "10 active job posts",
      "Core semantic matching + explanation",
      "Full ATS pipeline + analytics",
    ],
    variant: "standard",
    cta: "Choose Plan",
    ctaTo: "/company-account-request",
  },
  {
    id: "premium",
    name: "Premium",
    price: "₱2,500",
    period: "/month",
    badge: "Best Value",
    description: "Unrestricted access for high-volume, high-intent hiring teams.",
    tagline: "For the most demanding recruitment pipelines.",
    features: [
      "Unlimited resume screenings",
      "Unlimited job posts",
      "Core semantic matching + explanation",
      "Full ATS pipeline + analytics",
    ],
    variant: "premium",
    cta: "Get Started",
    ctaTo: "/company-account-request",
  },
];

export const LANDING_TRUST_ITEMS = [
  "Semantic Resume Analysis",
  "Intelligent Candidate Ranking",
  "ATS Pipeline Tracking",
  "Explainable AI Matching",
  "Academic Research Grade",
];

export const LANDING_FEATURES: LandingFeature[] = [
  {
    icon: "brain",
    title: "Semantic Resume Analysis",
    description:
      "NLP-powered parsing that understands job skills, context, and experience depth, not just keyword presence.",
  },
  {
    icon: "target",
    title: "Intelligent Candidate Matching",
    description:
      "Vector-based similarity scoring aligns candidates to job descriptions with human-like comprehension and nuance.",
  },
  {
    icon: "dashboard",
    title: "Recruiter Dashboards",
    description:
      "Clean, data-rich views that give recruiters everything they need without cognitive overload.",
  },
  {
    icon: "insight",
    title: "Explainable Fit Insights",
    description:
      "Understand why a candidate ranks highly with transparent breakdowns of skill alignment and gap areas.",
  },
  {
    icon: "star",
    title: "Ranked Shortlists",
    description:
      "Automatically surface the top candidates per job posting, prioritized by semantic fit score, not post order.",
  },
  {
    icon: "cpu",
    title: "Automated Semantic Processing",
    description:
      "Resume and role data are processed consistently so your matching pipeline stays fast as volume grows.",
  },
];

export const LANDING_STEPS: LandingStep[] = [
  {
    number: "01",
    icon: "upload",
    title: "Post a Role",
    description:
      "Hiring teams publish structured job requirements while candidates apply for free through the portal.",
  },
  {
    number: "02",
    icon: "cpu",
    title: "Semantic Processing",
    description:
      "The NLP engine parses every resume and job description, extracting skills, experience, context, and intent.",
  },
  {
    number: "03",
    icon: "target",
    title: "Matching and Ranking",
    description:
      "Candidates are ranked per job by similarity across semantic embeddings instead of keyword count.",
  },
  {
    number: "04",
    icon: "dashboard",
    title: "Review and Decide",
    description:
      "Recruiters receive a ranked shortlist with fit scores, skill gaps, and explainable match reasoning.",
  },
];

export const LANDING_COMPARISONS: LandingComparison[] = [
  {
    label: "Keyword ATS",
    items: [
      "Filters by exact word matches",
      "Misses synonyms and related skills",
      "Penalizes non-standard formatting",
      "No context for experience depth",
      "High false-negative rate",
    ],
  },
  {
    label: "SkillSense",
    items: [
      "Understands skill intent and meaning",
      "Maps synonyms and adjacent skills",
      "Reads semantic structure, not format",
      "Weighs experience depth contextually",
      "Ranked confidence with explainability",
    ],
    highlight: true,
  },
];
