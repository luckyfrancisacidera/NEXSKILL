import { UserRound } from 'lucide-react';
import { cn } from '@shared/utils/cn';

interface AvatarProps {
  name: string;
}

export const Avatar = ({ name }: AvatarProps) => (
  <div
    className={cn(
      'flex h-9 w-9 items-center justify-center rounded-full border border-zinc-300 bg-zinc-100 transition-colors duration-300 dark:border-zinc-700 dark:bg-zinc-900',
    )}
    aria-label={name}
  >
    <UserRound className="h-5 w-5 text-zinc-700 transition-colors duration-300 dark:text-zinc-200" />
  </div>
);
