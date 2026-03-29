import { useState, type FormEvent } from "react";
import { Button } from "@shared/components/Button";
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
          <Button
            type="button"
            variant="secondary"
            className="rounded-full px-4 py-1.5 text-xs"
            onClick={onCancel}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
        ) : null}
        <Button
          type="submit"
          className="rounded-full px-4 py-1.5 text-xs"
          loading={isSubmitting}
          loadingText="Sending"
        >
          {submitLabel}
        </Button>
      </div>
    </form>
  );
};
