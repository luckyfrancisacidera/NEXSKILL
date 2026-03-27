import { cn } from '@shared/utils/cn';
import { getAvatarInitials } from '@shared/utils/avatar';

interface AvatarProps {
  name: string;
  email?: string | null;
  src?: string;
  className?: string;
  textClassName?: string;
}

export const Avatar = ({ name, email, src, className, textClassName }: AvatarProps) => {
  const initials = getAvatarInitials(name, email);

  return (
    <div
      className={cn(
        "relative flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-full border border-zinc-300 bg-zinc-100 transition-colors duration-300 dark:border-zinc-700 dark:bg-zinc-900",
        className,
      )}
      aria-label={name}
    >
      {src ? (
        <img src={src} alt={name} className="h-full w-full object-cover" />
      ) : (
        <span
          className={cn(
            "text-xs font-semibold uppercase tracking-[0.08em] text-zinc-700 transition-colors duration-300 dark:text-zinc-100",
            textClassName,
          )}
        >
          {initials}
        </span>
      )}
    </div>
  );
};
