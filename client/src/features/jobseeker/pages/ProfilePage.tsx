import { useEffect, useState } from 'react';
import { Card } from '@shared/components/Card';
import { jobseekerService } from '@features/jobseeker/service/jobseeker.service';

export const ProfilePage = () => {
  const [form, setForm] = useState<Record<string, string>>({});
  const [message, setMessage] = useState('');

  useEffect(() => { void jobseekerService.getProfile().then((data) => setForm(data as Record<string, string>)); }, []);

  const onSave = async (event: React.FormEvent) => {
    event.preventDefault();
    await jobseekerService.updateProfile(form);
    setMessage('Profile updated successfully.');
  };

  const fields = ['full_name', 'email', 'phone', 'location', 'professional_title', 'skills', 'bio', 'experience_summary', 'resume_url', 'avatar_url'];

  return (
    <Card>
      <h2 className="mb-4 text-2xl font-semibold">Profile</h2>
      <form onSubmit={onSave} className="grid gap-3 sm:grid-cols-2">
        {fields.map((field) => (
          <label key={field} className={field === 'bio' || field === 'experience_summary' ? 'sm:col-span-2' : ''}>
            <span className="mb-1 block text-sm capitalize text-zinc-600">{field.replaceAll('_', ' ')}</span>
            <input value={form[field] ?? ''} onChange={(e) => setForm((prev) => ({ ...prev, [field]: e.target.value }))} className="w-full rounded border border-zinc-300 px-3 py-2 text-sm" />
          </label>
        ))}
        <div className="sm:col-span-2 flex flex-wrap items-center gap-2">
          <button type="submit" className="rounded bg-zinc-900 px-4 py-2 text-white">Save profile</button>
          {message ? <span className="text-sm text-green-700">{message}</span> : null}
        </div>
      </form>
    </Card>
  );
};
