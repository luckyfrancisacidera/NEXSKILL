interface ProgressProps {
  value: number;
  variant?: "usage" | "time";
}

const getBarColor = (value: number, variant: "usage" | "time") => {
  if (variant === "usage") {
    // High usage = bad (red), low usage = good (green)
    if (value >= 90) return "bg-red-500 dark:bg-red-400";
    if (value >= 70) return "bg-yellow-500 dark:bg-yellow-400";
    return "bg-emerald-500 dark:bg-emerald-400";
  } else {
    // Time elapsed: little time left = bad (red)
    if (value >= 90) return "bg-red-500 dark:bg-red-400";
    if (value >= 70) return "bg-yellow-500 dark:bg-yellow-400";
    return "bg-emerald-500 dark:bg-emerald-400";
  }
};

export const Progress = ({ value, variant = "usage" }: ProgressProps) => (
  <div className="h-2 w-full overflow-hidden rounded-full bg-zinc-200 dark:bg-zinc-700">
    <div
      className={`h-full rounded-full transition-all ${getBarColor(value, variant)}`}
      style={{ width: `${value}%` }}
    />
  </div>
);