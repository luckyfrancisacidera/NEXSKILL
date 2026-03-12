export const getAdminStatusClassName = (isActive: boolean) =>
  isActive ? 'bg-emerald-50 text-emerald-700' : 'bg-zinc-100 text-zinc-500';

export const AdminStatusBadge = ({ isActive }: { isActive: boolean }) => (
  <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${getAdminStatusClassName(isActive)}`}>
    {isActive ? 'Active' : 'Inactive'}
  </span>
);
