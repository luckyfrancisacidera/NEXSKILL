import { useState, type FormEvent } from "react";
import { RichTextField } from "@shared/components/RichTextField";
import { sanitizeRichText, stripRichText } from "@shared/utils/richText";

interface RescheduleRequestFormProps {
  onSubmit: (message: string) => Promise<void> | void;
  onCancel?: () => void;
  submitLabel?: string;
}

export const RescheduleRequestForm = ({
  onSubmit,
  onCancel,
  submitLabel = "Send request",
}: RescheduleRequestFormProps) => {
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!stripRichText(message)) {
      setError("Please add a message for the recruiter.");
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit(sanitizeRichText(message));
      setMessage("");
      setError("");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form className="space-y-4" onSubmit={handleSubmit}>
      <div className="space-y-2">
        <RichTextField
          label="Message"
          value={message}
          onChange={(value) => {
            setMessage(value);
            setError("");
          }}
          placeholder="Suggest an alternative time and share any context."
          helperText="Include your preferred reschedule window and any context the recruiter should know."
          required
          minHeightClassName="min-h-[170px]"
          error={error}
        />
      </div>

      <div className="flex justify-end gap-2 pt-1">
        {onCancel ? (
          <button
            type="button"
            className="rounded-full border border-zinc-300 bg-white px-4 py-1.5 text-xs font-semibold text-zinc-700 shadow-sm transition hover:bg-zinc-100 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 dark:hover:bg-zinc-800"
            onClick={onCancel}
            disabled={isSubmitting}
          >
            Cancel
          </button>
        ) : null}
        <button
          type="submit"
          className="rounded-full bg-zinc-900 px-4 py-1.5 text-xs font-semibold text-white shadow-sm transition hover:bg-zinc-800 disabled:cursor-wait disabled:opacity-80 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
          disabled={isSubmitting}
        >
          {isSubmitting ? "Sending..." : submitLabel}
        </button>
      </div>
    </form>
  );
};
