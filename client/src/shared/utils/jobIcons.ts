import type { LucideIcon } from "lucide-react";
import {
  BriefcaseBusiness,
  Code2,
  FilePenLine,
  BarChart3,
  Cog,
  PenSquare,
  ShieldCheck,
  Database,
  Cpu,
  Megaphone,
  Palette,
  Users,
  Headset,
  GraduationCap,
  BadgeDollarSign,
  Stethoscope,
  Gavel,
  ClipboardList,
  ShoppingCart,
  Truck,
  Wrench,
  FlaskConical,
  Camera,
  Globe,
  Calculator,
  Building,
  MonitorSmartphone,
  ServerCog,
  Network,
} from "lucide-react";

const jobIconMatchers: Array<{ keywords: string[]; icon: LucideIcon }> = [
  { keywords: ["frontend developer", "frontend engineer", "front-end developer", "front-end engineer", "ui developer"], icon: MonitorSmartphone },
  { keywords: ["backend developer", "backend engineer", "back-end developer", "back-end engineer", "api developer"], icon: ServerCog },
  { keywords: ["devops", "site reliability", "sre", "platform engineer", "cloud engineer", "infrastructure engineer"], icon: Network },
  { keywords: ["technical support engineer", "technicaal support engineer", "support engineer", "help desk engineer", "technical support", "technicaal support"], icon: Headset },
  { keywords: ["full stack", "full-stack", "fullstack"], icon: Code2 },
  { keywords: ["engineer", "enginner", "developer", "frontend", "front-end", "backend", "back-end", "software"], icon: Code2 },
  { keywords: ["analyst", "analytics", "data", "insights", "reporting"], icon: BarChart3 },
  { keywords: ["writer", "copywriter", "editor", "content"], icon: FilePenLine },
  { keywords: ["designer", "ui", "ux", "graphic", "product designer", "visual"], icon: Palette },
  { keywords: ["marketing", "seo", "brand", "social media", "growth"], icon: Megaphone },
  { keywords: ["operations", "operator", "ops", "coordinator"], icon: Cog },
  { keywords: ["security", "compliance", "infosec", "cybersecurity"], icon: ShieldCheck },
  { keywords: ["database", "sql", "bi", "etl", "warehouse"], icon: Database },
  { keywords: ["ai", "ml", "machine learning", "artificial intelligence"], icon: Cpu },
  { keywords: ["manager", "hr", "recruiter", "people", "talent acquisition", "human resources"], icon: Users },
  { keywords: ["author", "documentation"], icon: PenSquare },
  { keywords: ["support", "customer service", "customer success", "help desk"], icon: Headset },
  { keywords: ["teacher", "trainer", "instructor", "education"], icon: GraduationCap },
  { keywords: ["sales", "account executive", "account manager", "business development"], icon: BadgeDollarSign },
  { keywords: ["doctor", "nurse", "medical", "clinical", "healthcare", "therapist"], icon: Stethoscope },
  { keywords: ["lawyer", "legal", "attorney", "paralegal"], icon: Gavel },
  { keywords: ["project", "program", "scrum", "delivery"], icon: ClipboardList },
  { keywords: ["product manager", "product owner", "merchandiser", "ecommerce"], icon: ShoppingCart },
  { keywords: ["logistics", "supply chain", "procurement", "warehouse manager"], icon: Truck },
  { keywords: ["technician", "mechanic", "maintenance", "installer"], icon: Wrench },
  { keywords: ["scientist", "chemist", "laboratory", "lab"], icon: FlaskConical },
  { keywords: ["photographer", "videographer", "media"], icon: Camera },
  { keywords: ["translator", "localization", "international"], icon: Globe },
  { keywords: ["accountant", "bookkeeper", "finance", "auditor", "payroll"], icon: Calculator },
  { keywords: ["architect", "civil", "construction", "real estate"], icon: Building },
];

export const getJobIcon = (title?: string | null): LucideIcon => {
  const normalizedTitle = title?.trim().toLowerCase() ?? "";

  if (!normalizedTitle) {
    return BriefcaseBusiness;
  }

  const matched = jobIconMatchers.find(({ keywords }) =>
    keywords.some((keyword) => normalizedTitle.includes(keyword)),
  );

  return matched?.icon ?? BriefcaseBusiness;
};
