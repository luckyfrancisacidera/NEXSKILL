import { useState } from "react";
import { ModalOverlay } from "@shared/components/ModalOverlay";
import { http } from "@shared/api/http";

interface RecruiterInitialSetupModalProps {
  onCompleted: () => Promise<void>;
}

export const RecruiterInitialSetupModal = ({
  onCompleted,
}: RecruiterInitialSetupModalProps) => {
  const [companyName, setCompanyName] = useState("");
  const [companyEmail, setCompanyEmail] = useState("");
  const [location, setLocation] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!companyName.trim()) {
      setError("Company name is required.");
      return;
    }

    setIsSubmitting(true);
    setError(null);
    try {
      await http.post("/api/account/setup/recruiter", {
        companyName,
        companyEmail,
        location,
      });
      await onCompleted();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to complete setup. Please try again.",
      );
      setIsSubmitting(false);
    }
  };

  return (
    <ModalOverlay onClose={() => undefined}>
      <div className="rounded-2xl bg-white p-6 shadow-2xl ring-1 ring-zinc-200 dark:bg-zinc-950 dark:ring-zinc-800">
        <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
          Complete your recruiter setup
        </h2>
        <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
          Tell us about your company so we can attach your jobs, interviews, and
          candidates to the correct organization.
        </p>
        <form onSubmit={handleSubmit} className="mt-4 space-y-3">
          <div>
            <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300">
              Company name
            </label>
            <input
              type="text"
              value={companyName}
              onChange={(event) => setCompanyName(event.target.value)}
              className="mt-1 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 shadow-sm outline-none ring-0 transition-colors focus:border-violet-500 focus:ring-2 focus:ring-violet-200 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 dark:focus:border-violet-400 dark:focus:ring-violet-900/50"
              placeholder="Acme Corp"
              required
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300">
              Company email
            </label>
            <input
              type="email"
              value={companyEmail}
              onChange={(event) => setCompanyEmail(event.target.value)}
              className="mt-1 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 shadow-sm outline-none ring-0 transition-colors focus:border-violet-500 focus:ring-2 focus:ring-violet-200 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 dark:focus:border-violet-400 dark:focus:ring-violet-900/50"
              placeholder="talent@acme.com"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300">
              Location
            </label>
            <input
              type="text"
              value={location}
              onChange={(event) => setLocation(event.target.value)}
              className="mt-1 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 shadow-sm outline-none ring-0 transition-colors focus:border-violet-500 focus:ring-2 focus:ring-violet-200 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 dark:focus:border-violet-400 dark:focus:ring-violet-900/50"
              placeholder="City, Country"
            />
          </div>

          {error && (
            <p className="text-xs text-red-600 dark:text-red-400">{error}</p>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="mt-2 inline-flex w-full items-center justify-center rounded-lg bg-violet-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:bg-violet-700 disabled:cursor-not-allowed disabled:bg-violet-400 dark:bg-violet-500 dark:hover:bg-violet-400"
          >
            {isSubmitting ? "Saving..." : "Save and continue"}
          </button>
        </form>
      </div>
    </ModalOverlay>
  );
};
