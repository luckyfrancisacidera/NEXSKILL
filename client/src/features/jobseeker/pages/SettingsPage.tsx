import { Card } from '@shared/components/Card';
import { useSession } from '@app/providers/session-store';
import type { Role } from '@shared/types';

const roles: Role[] = ['jobseeker', 'recruiter', 'admin'];

export const SettingsPage = () => {
  const {
    state: { role },
    setRole,
  } = useSession();

  return (
    <Card>
      <h2 className="text-2xl font-semibold">Settings</h2>
      <div className="mt-4 max-w-sm space-y-2">
        <label htmlFor="role" className="text-sm font-medium text-zinc-700">Demo role selector</label>
        <select
          id="role"
          value={role}
          onChange={(event) => setRole(event.target.value as Role)}
          className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm"
        >
          {roles.map((item) => (
            <option key={item} value={item}>{item}</option>
          ))}
        </select>
      </div>
    </Card>
  );
};
