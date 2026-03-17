import { cn } from "@shared/utils/cn";
import { getApplicationStatusAppearance } from "@shared/utils/applicationStatus";

type StatusBadgeProps = {
  status?: string | null;
  label?: string;
  className?: string;
  size?: "sm" | "md";
};

const sizeClassName: Record<NonNullable<StatusBadgeProps["size"]>, string> = {
  sm: "px-2.5 py-1 text-xs",
  md: "px-3 py-1 text-sm",
};

export const StatusBadge = ({
  status,
  label,
  className,
  size = "sm",
}: StatusBadgeProps) => {
  const appearance = getApplicationStatusAppearance(status);

  return (
    <span
      className={cn(
        "inline-flex items-center justify-center rounded-full border font-medium",
        sizeClassName[size],
        appearance.badgeClassName,
        className,
      )}
    >
      {label ?? appearance.label}
    </span>
  );
};
