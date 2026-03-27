import type { LucideIcon } from "lucide-react";
import {
  Blocks,
  Building2,
  ChartPie,
  Factory,
  FolderKanban,
  Handshake,
  HeartPulse,
  Landmark,
  LayoutGrid,
  Megaphone,
  Palette,
  Scale,
  ShieldCheck,
  Users,
  Headset,
  GraduationCap,
  BadgeDollarSign,
  Truck,
  ShoppingCart,
  FlaskConical,
  Globe,
  MonitorCog,
  ClipboardList,
  Warehouse,
} from "lucide-react";

const departmentIconMatchers: Array<{ keywords: string[]; icon: LucideIcon }> = [
  { keywords: ["engineering", "technology", "it", "development", "platform", "infrastructure"], icon: Blocks },
  { keywords: ["data", "analytics", "business intelligence", "insights"], icon: ChartPie },
  { keywords: ["ai", "machine learning", "research", "innovation"], icon: LayoutGrid },
  { keywords: ["marketing", "growth", "communications", "content", "brand"], icon: Megaphone },
  { keywords: ["design", "creative", "ux", "ui"], icon: Palette },
  { keywords: ["security", "risk", "compliance", "governance"], icon: ShieldCheck },
  { keywords: ["people", "human resources", "hr", "talent", "recruiting", "culture"], icon: Users },
  { keywords: ["operations", "admin", "administration", "back office"], icon: Factory },
  { keywords: ["finance", "accounting", "payroll", "treasury"], icon: Landmark },
  { keywords: ["legal"], icon: Scale },
  { keywords: ["sales", "partnerships", "business development"], icon: Handshake },
  { keywords: ["health", "medical", "clinical"], icon: HeartPulse },
  { keywords: ["education", "training", "learning"], icon: FolderKanban },
  { keywords: ["customer support", "support", "customer success", "service desk"], icon: Headset },
  { keywords: ["learning and development", "l&d", "academy"], icon: GraduationCap },
  { keywords: ["revenue", "commercial"], icon: BadgeDollarSign },
  { keywords: ["logistics", "supply chain", "procurement", "distribution"], icon: Truck },
  { keywords: ["product", "merchandising", "commerce", "ecommerce"], icon: ShoppingCart },
  { keywords: ["quality", "laboratory", "science", "r&d"], icon: FlaskConical },
  { keywords: ["international", "localization", "global"], icon: Globe },
  { keywords: ["information systems", "business systems", "technical operations"], icon: MonitorCog },
  { keywords: ["project management", "program management", "pmo"], icon: ClipboardList },
  { keywords: ["facilities", "inventory", "warehouse"], icon: Warehouse },
];

export const getDepartmentIcon = (department?: string | null): LucideIcon => {
  const normalizedDepartment = department?.trim().toLowerCase() ?? "";

  if (!normalizedDepartment) {
    return Building2;
  }

  const matched = departmentIconMatchers.find(({ keywords }) =>
    keywords.some((keyword) => normalizedDepartment.includes(keyword)),
  );

  return matched?.icon ?? Building2;
};
