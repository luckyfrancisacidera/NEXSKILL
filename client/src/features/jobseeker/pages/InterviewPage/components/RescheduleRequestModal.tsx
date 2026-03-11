import { useState, type FormEvent } from "react";
import { ModalOverlay } from "@shared/components/ModalOverlay";

interface RescheduleRequestModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (message: string, attachment?: File) => Promise<void> | void;
}

export const RescheduleRequestModal = ({
  open,
  onClose,
  onSubmit,
}: RescheduleRequestModalProps) => {
  const [message, setMessage] = useState("");
  const [attachment, setAttachment] = useState<File | undefined>();
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!open) return null;

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);
    try {
      await onSubmit(message, attachment);
      setMessage("");
      setAttachment(undefined);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <ModalOverlay onClose={onClose}>
      <form
        className="w-full max-w-md space-y-4 rounded-2xl bg-white p-5 shadow-2xl ring-1 ring-violet-200 dark:bg-zinc-950 dark:ring-violet-900"
        onSubmit={handleSubmit}
      >
        <header>
          <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
            Request reschedule
          </h3>
          <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
            Let the recruiter know why you&apos;d like to move this interview.
          </p>
        </header>
        <div className="space-y-2">
          <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300">
            Message
            <textarea
              required
              rows={4}
              className="mt-1 w-full rounded-xl border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-800 shadow-sm outline-none transition focus:border-violet-500 focus:ring-4 focus:ring-violet-100 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 dark:focus:border-violet-400 dark:focus:ring-violet-900/50"
              placeholder="Suggest an alternative time and share any context."
              value={message}
              onChange={(event) => setMessage(event.target.value)}
            />
          </label>
          <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300">
            Attachment (optional)
            <input
              type="file"
              className="mt-1 block w-full text-xs text-zinc-600 file:mr-3 file:rounded-lg file:border-0 file:bg-zinc-900 file:px-3 file:py-1.5 file:text-xs file:font-semibold file:text-white hover:file:bg-zinc-800 dark:text-zinc-300 dark:file:bg-zinc-100 dark:file:text-zinc-900 dark:hover:file:bg-zinc-200"
              onChange={(event) => {
                const file = event.target.files?.[0];
                setAttachment(file ?? undefined);
              }}
            />
          </label>
        </div>
        <div className="flex justify-end gap-2 pt-1">
          <button
            type="button"
            className="rounded-full border border-zinc-300 bg-white px-4 py-1.5 text-xs font-semibold text-zinc-700 shadow-sm transition hover:bg-zinc-100 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 dark:hover:bg-zinc-800"
            onClick={onClose}
            disabled={isSubmitting}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="rounded-full bg-zinc-900 px-4 py-1.5 text-xs font-semibold text-white shadow-sm transition hover:bg-zinc-800 disabled:cursor-wait disabled:opacity-80 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Sending..." : "Send request"}
          </button>
        </div>
      </form>
    </ModalOverlay>
  );
};

