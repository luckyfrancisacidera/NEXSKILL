import { useAuth } from "@app/providers/AuthProvider";
import { Card } from "@shared/components/Card";

export const SettingsPage = () => {
  const { roles } = useAuth();

  return (
    <Card>
      <h2 className="text-2xl font-semibold">Settings</h2>
      <div className="mt-4 max-w-sm space-y-2">
        <label className="text-sm font-medium text-zinc-700">
          Current role
        </label>
        <p className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm">
          {roles[0] ?? "jobseeker"}
        </p>
      </div>
    </Card>
  );
};
