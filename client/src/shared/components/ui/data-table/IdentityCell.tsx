import { Avatar } from "@shared/components/Avatar";
import { cn } from "@shared/utils/cn";

interface IdentityCellProps {
  name: string;
  email?: string | null;
  avatarSrc?: string | null;
  className?: string;
  nameClassName?: string;
  emailClassName?: string;
}

export const IdentityCell = ({
  name,
  email,
  avatarSrc,
  className,
  nameClassName,
  emailClassName,
}: IdentityCellProps) => (
  <div className={cn("flex min-w-0 items-center gap-2.5 sm:gap-3", className)}>
    <Avatar
      name={name}
      email={email}
      src={avatarSrc ?? undefined}
      className="h-8 w-8 border-zinc-200 bg-zinc-100 text-[10px] font-semibold text-zinc-700 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 sm:h-9 sm:w-9"
      textClassName="text-[10px] font-semibold tracking-[0.08em] sm:text-[11px]"
    />
    <div className="min-w-0 self-center">
      <p className={cn("truncate text-[12px] font-medium leading-[1.125rem] text-zinc-800 dark:text-zinc-100 sm:text-[13px] sm:leading-5", nameClassName)}>
        {name}
      </p>
      <p className={cn("truncate text-[11px] leading-[1.125rem] text-zinc-500 dark:text-zinc-400 sm:text-[12px] sm:leading-5", emailClassName)}>
        {email || "No email available"}
      </p>
    </div>
  </div>
);
