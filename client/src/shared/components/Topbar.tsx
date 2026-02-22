import { Bell, ChevronDown, Search } from 'lucide-react';
import { Avatar } from '@shared/components/Avatar';
import { useSession } from '@app/providers/session-store';

export const Topbar = () => {
  const {
    state: { user },
  } = useSession();

  return (
    <header className="flex items-center justify-between gap-4 border-b border-zinc-200 bg-white px-6 py-4">
      <label className="flex flex-1 items-center gap-2 rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2 text-sm text-zinc-500">
        <Search className="h-4 w-4" />
        <input
          aria-label="Search jobs"
          className="w-full bg-transparent text-zinc-900 outline-none placeholder:text-zinc-400"
          placeholder="Search job title or keywords"
        />
      </label>
      <button className="flex items-center gap-2 rounded-lg border border-zinc-200 px-3 py-2 text-sm text-zinc-700 hover:bg-zinc-100">
        {user.location}
        <ChevronDown className="h-4 w-4" />
      </button>
      <button className="rounded-lg border border-zinc-200 p-2 hover:bg-zinc-100" aria-label="Notifications">
        <Bell className="h-5 w-5 text-zinc-700" />
      </button>
      <Avatar name={user.name} />
    </header>
  );
};
