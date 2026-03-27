import { cn } from "@shared/utils/cn";
import { getApplicationStatusAppearance } from "@shared/utils/applicationStatus";

type StatusBadgeProps = {
  status?: string | null;
  label?: string;
  className?: string;
  appearanceClassName?: string;
  size?: "sm" | "md";
};

const sizeClassName: Record<NonNullable<StatusBadgeProps["size"]>, string> = {
  sm: "px-2.5 py-1 text-[11px] leading-4",
  md: "px-3 py-1 text-[13px] leading-5",
};

export const StatusBadge = ({
  status,
  label,
  className,
  appearanceClassName,
  size = "sm",
}: StatusBadgeProps) => {
  const appearance = getApplicationStatusAppearance(status);

  return (
    <span
      className={cn(
        "inline-flex items-center justify-center rounded-full border font-medium normal-case",
        sizeClassName[size],
        appearanceClassName ?? appearance.badgeClassName,
        className,
      )}
    >
      {label ?? appearance.label}
    </span>
  );
};
