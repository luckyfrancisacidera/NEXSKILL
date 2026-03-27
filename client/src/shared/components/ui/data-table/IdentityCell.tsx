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
  <div className={cn("flex min-w-0 items-center gap-3", className)}>
    <Avatar
      name={name}
      email={email}
      src={avatarSrc ?? undefined}
      className="h-9 w-9 border-zinc-200 bg-zinc-100 text-[11px] font-semibold text-zinc-700 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
      textClassName="text-[11px] font-semibold tracking-[0.08em]"
    />
    <div className="min-w-0 self-center">
      <p className={cn("truncate text-[13px] font-medium leading-5 text-zinc-800 dark:text-zinc-100", nameClassName)}>
        {name}
      </p>
      <p className={cn("truncate text-[12px] leading-5 text-zinc-500 dark:text-zinc-400", emailClassName)}>
        {email || "No email available"}
      </p>
    </div>
  </div>
);
