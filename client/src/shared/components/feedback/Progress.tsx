interface ProgressProps {
  value: number;
}

export const Progress = ({ value }: ProgressProps) => (
  <div className="h-2 w-full overflow-hidden rounded-full bg-zinc-200 dark:bg-zinc-700">
    <div className="h-full rounded-full bg-zinc-900 dark:bg-zinc-100 transition-all" style={{ width: `${value}%` }} />
  </div>
);
