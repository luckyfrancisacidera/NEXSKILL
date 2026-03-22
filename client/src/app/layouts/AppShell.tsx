import { Outlet } from 'react-router-dom';
import { Sidebar } from '@shared/components/Sidebar';
import { Topbar } from '@shared/components/Topbar';

export const AppShell = () => (
  <div className="min-h-screen bg-white/80 text-zinc-900 transition-colors duration-300 dark:bg-zinc-950 dark:text-zinc-100 font-inter">
    <div className="min-h-screen lg:grid lg:grid-cols-[16rem_minmax(0,1fr)]">
      <Sidebar />
      <div className="min-w-0 flex min-h-screen flex-col">
        <Topbar />
        <main className="min-w-0 flex-1 p-4 transition-colors duration-300 sm:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  </div>
);
