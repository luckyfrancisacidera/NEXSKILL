import { useCallback, useEffect, useMemo, useRef, useState, type ChangeEvent } from "react";
import { Form } from "react-router-dom";
import { ApplyWizardStepper } from "@features/jobseeker/pages/JobDetailPage/components/ApplyWizardStepper";
import { useConfirmation } from "@shared/hooks/useConfirmation";

type Step = 1 | 2 | 3;

type WizardValues = {
  full_name: string;
  email: string;
  postal_code: string;
  location: string;
};

type ApplyModalWizardProps = {
  actionData?: { error?: string };
  isSubmitting: boolean;
  onClose: () => void;
};

const isEmailValid = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());

const formatBytes = (size: number) => {
  if (size < 1024) return `${size} B`;
  if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`;
  return `${(size / (1024 * 1024)).toFixed(2)} MB`;
};

export const ApplyModalWizard = ({ actionData, isSubmitting, onClose }: ApplyModalWizardProps) => {
  const [step, setStep] = useState<Step>(1);
  const [values, setValues] = useState<WizardValues>({
    full_name: "",
    email: "",
    postal_code: "",
    location: "",
  });
  const [resumeFile, setResumeFile] = useState<File | null>(null);

  const confirm = useConfirmation();
  const modalRef = useRef<HTMLDivElement>(null);
  const firstInputRef = useRef<HTMLInputElement>(null);
  const allowSubmitRef = useRef(false);

  const resumePreviewUrl = useMemo(() => {
    if (!resumeFile || resumeFile.type !== "application/pdf") return "";
    return URL.createObjectURL(resumeFile);
  }, [resumeFile]);

  const isDirty = useMemo(
    () =>
      values.full_name.trim() !== "" ||
      values.email.trim() !== "" ||
      values.postal_code.trim() !== "" ||
      values.location.trim() !== "" ||
      resumeFile !== null,
    [resumeFile, values],
  );

  const isStep1Valid =
    values.full_name.trim() !== "" &&
    values.email.trim() !== "" &&
    isEmailValid(values.email) &&
    values.postal_code.trim() !== "" &&
    values.location.trim() !== "";

  const isStep2Valid = Boolean(resumeFile && resumeFile.size > 0);

  useEffect(() => {
    firstInputRef.current?.focus();
  }, []);

  useEffect(() => {
    return () => {
      if (resumePreviewUrl) URL.revokeObjectURL(resumePreviewUrl);
    };
  }, [resumePreviewUrl]);

  const handleClose = useCallback(async () => {
    if (isDirty) {
      const shouldClose = await confirm({
        title: "Discard application progress?",
        message: "You have unsaved application data. Close anyway?",
        confirmLabel: "Discard",
        accent: "red",
      });

      if (!shouldClose) {
        return;
      }
    }

    onClose();
  }, [confirm, isDirty, onClose]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (!modalRef.current) return;

      if (event.key === "Escape") {
        event.preventDefault();
        void handleClose();
        return;
      }

      if (event.key !== "Tab") return;

      const focusable = modalRef.current.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), textarea, input:not([disabled]), select, [tabindex]:not([tabindex="-1"])',
      );

      if (focusable.length === 0) return;

      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [handleClose]);

  const updateField = (key: keyof WizardValues) => (event: ChangeEvent<HTMLInputElement>) => {
    setValues((prev) => ({ ...prev, [key]: event.target.value }));
  };

  const goNext = () => {
    allowSubmitRef.current = false;
    setStep((prev) => (prev === 1 ? 2 : 3));
  };

  const goBack = () => {
    allowSubmitRef.current = false;
    setStep((prev) => (prev === 3 ? 2 : 1));
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-950/60 p-3 backdrop-blur-sm sm:p-6"
      onClick={(event) => {
        if (event.target === event.currentTarget) void handleClose();
      }}
    >
      <div
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="apply-modal-title"
        className="w-full max-w-5xl rounded-xl bg-white p-4 shadow-2xl sm:p-6"
      >
        <div className="mb-4 flex items-center justify-between gap-3">
          <h3 id="apply-modal-title" className="text-lg font-semibold">
            Proceed to Apply
          </h3>
          <button
            type="button"
            onClick={() => {
              void handleClose();
            }}
            aria-label="Close application modal"
            className="rounded-md px-2 py-1 text-zinc-500 transition hover:bg-zinc-100 hover:text-zinc-900"
          >
            ×
          </button>
        </div>

        <ApplyWizardStepper step={step} />

        <Form
          method="post"
          encType="multipart/form-data"
          className="mt-5 space-y-4"
          onSubmit={(event) => {
            if (step !== 3 || !allowSubmitRef.current) {
              event.preventDefault();
              return;
            }

            allowSubmitRef.current = false;
          }}
          onKeyDown={(event) => {
            if (event.key !== "Enter" || step === 3) return;

            const target = event.target as HTMLElement;
            if (target.tagName.toLowerCase() === "textarea") return;

            const canAdvance = (step === 1 && isStep1Valid) || (step === 2 && isStep2Valid);
            if (!canAdvance) {
              event.preventDefault();
              return;
            }

            event.preventDefault();
            allowSubmitRef.current = false;
            setStep((prev) => (prev === 1 ? 2 : 3));
          }}
        >
          {actionData?.error ? (
            <p className="rounded-md bg-red-50 p-3 text-sm text-red-700">{actionData.error}</p>
          ) : null}

          <div className={step === 1 ? "space-y-3" : "hidden"}>
            <input
              ref={firstInputRef}
              name="full_name"
              required
              value={values.full_name}
              onChange={updateField("full_name")}
              className="w-full rounded border border-zinc-300 px-3 py-2"
              placeholder="Full name"
            />
            <input
              type="email"
              name="email"
              required
              value={values.email}
              onChange={updateField("email")}
              className="w-full rounded border border-zinc-300 px-3 py-2"
              placeholder="Email"
            />
            <input
              name="postal_code"
              required
              value={values.postal_code}
              onChange={updateField("postal_code")}
              className="w-full rounded border border-zinc-300 px-3 py-2"
              placeholder="Postal code"
            />
            <input
              name="location"
              required
              value={values.location}
              onChange={updateField("location")}
              className="w-full rounded border border-zinc-300 px-3 py-2"
              placeholder="Location"
            />
            {values.email !== "" && !isEmailValid(values.email) ? (
              <p className="text-xs text-red-600">Please provide a valid email address.</p>
            ) : null}
          </div>

          <div className={step === 2 ? "space-y-3" : "hidden"}>
            <input
              type="file"
              name="resume_file"
              required
              accept=".pdf,.doc,.docx,.txt,.rtf"
              onChange={(event) => {
                const file = event.target.files?.[0] ?? null;
                setResumeFile(file);
              }}
              className="w-full rounded border border-zinc-300 px-3 py-2"
            />

            {resumeFile ? (
              <div className="space-y-2 rounded-md border border-zinc-200 bg-zinc-50 p-3 text-sm">
                <p className="font-medium text-zinc-900">Selected file: {resumeFile.name}</p>
                <p className="text-zinc-600">Size: {formatBytes(resumeFile.size)}</p>
                {resumeFile.type === "application/pdf" && resumePreviewUrl ? (
                  <a className="inline-flex text-zinc-900 underline" href={resumePreviewUrl} target="_blank" rel="noreferrer">
                    Open preview
                  </a>
                ) : null}
                <p className="text-xs text-zinc-500">Use the file picker above to replace file.</p>
              </div>
            ) : (
              <p className="text-sm text-zinc-500">Upload your resume to continue.</p>
            )}
          </div>

          <div className={step === 3 ? "space-y-3 text-sm" : "hidden"}>
            <div className="rounded-md border border-zinc-200 p-3">
              <p className="font-semibold">Credentials</p>
              <ul className="mt-2 space-y-1 text-zinc-700">
                <li>
                  <span className="font-medium">Full name:</span> {values.full_name}
                </li>
                <li>
                  <span className="font-medium">Email:</span> {values.email}
                </li>
                <li>
                  <span className="font-medium">Postal code:</span> {values.postal_code}
                </li>
                <li>
                  <span className="font-medium">Location:</span> {values.location}
                </li>
              </ul>
            </div>

            <div className="rounded-md border border-zinc-200 p-3">
              <p className="font-semibold">Resume</p>
              {resumeFile ? (
                <p className="mt-2 text-zinc-700">
                  {resumeFile.name} ({formatBytes(resumeFile.size)})
                </p>
              ) : (
                <p className="mt-2 text-red-600">No file selected.</p>
              )}
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 border-t border-zinc-200 pt-4">
            {step > 1 ? (
              <button type="button" onClick={goBack} className="rounded border border-zinc-300 px-4 py-2 text-zinc-700">
                Back
              </button>
            ) : null}

            {step < 3 ? (
              <button
                type="button"
                disabled={(step === 1 && !isStep1Valid) || (step === 2 && !isStep2Valid)}
                onClick={goNext}
                className="rounded bg-zinc-900 px-4 py-2 text-white disabled:opacity-60"
              >
                Next
              </button>
            ) : (
              <button
                type="submit"
                disabled={isSubmitting}
                onClick={() => {
                  allowSubmitRef.current = true;
                }}
                className="rounded bg-zinc-900 px-4 py-2 text-white disabled:opacity-60"
              >
                {isSubmitting ? "Submitting..." : "Submit"}
              </button>
            )}
          </div>
        </Form>
      </div>
    </div>
  );
};
