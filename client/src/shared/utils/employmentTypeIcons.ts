import type { LucideIcon } from "lucide-react";
import {
  BadgeCheck,
  Briefcase,
  Clock3,
  GraduationCap,
  Handshake,
} from "lucide-react";

const employmentTypeMatchers: Array<{ keywords: string[]; icon: LucideIcon }> = [
  { keywords: ["full-time", "full time"], icon: BadgeCheck },
  { keywords: ["part-time", "part time"], icon: Clock3 },
  { keywords: ["contract", "freelance", "temporary"], icon: Handshake },
  { keywords: ["intern", "internship", "trainee"], icon: GraduationCap },
];

export const getEmploymentTypeIcon = (employmentType?: string | null): LucideIcon => {
  const normalizedEmploymentType = employmentType?.trim().toLowerCase() ?? "";

  if (!normalizedEmploymentType) {
    return Briefcase;
  }

  const matched = employmentTypeMatchers.find(({ keywords }) =>
    keywords.some((keyword) => normalizedEmploymentType.includes(keyword)),
  );

  return matched?.icon ?? Briefcase;
};
