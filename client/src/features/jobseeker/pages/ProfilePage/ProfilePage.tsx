import { Card } from "@shared/components/Card";
import { useProfileForm } from "@features/jobseeker/hooks";
import { RichTextEditor } from "@shared/components/RichTextEditor";

const fields = [
  "full_name",
  "email",
  "phone",
  "location",
  "professional_title",
  "skills",
  "bio",
  "experience_summary",
  "resume_url",
  "avatar_url",
];

export const ProfilePage = () => {
  const { form, message, onSave, setForm } = useProfileForm();

  return (
    <Card>
      <h2 className="mb-4 text-2xl font-semibold">Profile</h2>
      <form onSubmit={onSave} className="grid gap-3 sm:grid-cols-2">
        {fields.map((field) => (
          <label
            key={field}
            className={
              field === "bio" || field === "experience_summary"
                ? "sm:col-span-2"
                : ""
            }
          >
            <span className="mb-1 block text-sm capitalize text-zinc-600">
              {field.replaceAll("_", " ")}
            </span>
            {field === "bio" || field === "experience_summary" ? (
              <RichTextEditor
                value={form[field] ?? ""}
                onChange={(value) =>
                  setForm((prev) => ({ ...prev, [field]: value }))
                }
                placeholder={
                  field === "bio"
                    ? "Share a short professional bio."
                    : "Summarize your experience and major strengths."
                }
                minHeightClassName="min-h-[160px]"
              />
            ) : (
              <input
                value={form[field] ?? ""}
                onChange={(event) =>
                  setForm((prev) => ({ ...prev, [field]: event.target.value }))
                }
                className="w-full rounded border border-zinc-300 px-3 py-2 text-sm"
              />
            )}
          </label>
        ))}
        <div className="flex flex-wrap items-center gap-2 sm:col-span-2">
          <button
            type="submit"
            className="rounded bg-zinc-900 px-4 py-2 text-white"
          >
            Save profile
          </button>
          {message ? (
            <span className="text-sm text-green-700">{message}</span>
          ) : null}
        </div>
      </form>
    </Card>
  );
};
