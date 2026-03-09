import { Outlet } from 'react-router-dom';
import { Sidebar } from '@shared/components/Sidebar';
import { Topbar } from '@shared/components/Topbar';

export const AppShell = () => (
  <div className="min-h-screen bg-zinc-100 text-zinc-900 transition-colors duration-300 dark:bg-zinc-950 dark:text-zinc-100">
    <div className="mx-auto flex min-h-[90vh] overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-[0_24px_60px_rgba(0,0,0,0.08)] transition-colors duration-300 dark:border-zinc-800 dark:bg-zinc-950 dark:shadow-[0_24px_60px_rgba(0,0,0,0.45)]">
      <Sidebar />
      <div className="flex flex-1 flex-col pl-63">
        <Topbar />
        <main className="mt-17 min-h-screen flex-1 overflow-y-auto p-6 transition-colors duration-300">
          <Outlet />
        </main>
      </div>
    </div>
  </div>
);
