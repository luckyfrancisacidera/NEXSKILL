import { Outlet } from 'react-router-dom';
import { Sidebar } from '@shared/components/Sidebar';
import { Topbar } from '@shared/components/Topbar';

export const JobseekerLayout = () => (
  <div className="min-h-screen bg-zinc-100 pt-6">
    <div className="mx-auto flex min-h-[90vh] max-w-370 overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-[0_24px_60px_rgba(0,0,0,0.08)]">
      <Sidebar />
      <div className="flex flex-1 flex-col pl-63">
        <Topbar />
        <main className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  </div>
);
