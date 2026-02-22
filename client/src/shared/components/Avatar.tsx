import { UserRound } from 'lucide-react';

interface AvatarProps {
  name: string;
}

export const Avatar = ({ name }: AvatarProps) => (
  <div className="flex h-9 w-9 items-center justify-center rounded-full border border-zinc-300 bg-zinc-100" aria-label={name}>
    <UserRound className="h-5 w-5 text-zinc-700" />
  </div>
);
