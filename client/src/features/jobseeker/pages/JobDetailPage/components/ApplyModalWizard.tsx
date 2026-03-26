import { useCallback, useEffect, useMemo, useRef, useState, type ChangeEvent, type FormEvent } from "react";
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
  errorMessage?: string | null;
  isSubmitting: boolean;
  submissionHint?: string;
  onClose: () => void;
  onSubmit: (formData: FormData) => Promise<void>;
};

const isEmailValid = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());

const formatBytes = (size: number) => {
  if (size < 1024) return `${size} B`;
  if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`;
  return `${(size / (1024 * 1024)).toFixed(2)} MB`;
};

const fieldClassName =
  "w-full rounded border border-zinc-300 bg-white px-3 py-2 text-zinc-900 outline-none transition focus:border-zinc-500 focus:ring-2 focus:ring-zinc-500/30 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 dark:placeholder:text-zinc-500";

export const ApplyModalWizard = ({
  errorMessage,
  isSubmitting,
  submissionHint,
  onClose,
  onSubmit,
}: ApplyModalWizardProps) => {
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
    if (isSubmitting) {
      return;
    }

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
  }, [confirm, isDirty, isSubmitting, onClose]);

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
      className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-950/70 p-3 backdrop-blur-sm sm:p-6"
      onClick={(event) => {
        if (event.target === event.currentTarget) void handleClose();
      }}
    >
      <div
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="apply-modal-title"
        className="w-full max-w-5xl rounded-xl border border-zinc-200 bg-white p-4 shadow-2xl dark:border-zinc-800 dark:bg-zinc-950 sm:p-6"
      >
        <div className="mb-4 flex items-center justify-between gap-3">
          <h3 id="apply-modal-title" className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
            Proceed to Apply
          </h3>
          <button
            type="button"
            onClick={() => {
              void handleClose();
            }}
            aria-label="Close application modal"
            className="rounded-md px-2 py-1 text-zinc-500 transition hover:bg-zinc-100 hover:text-zinc-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-500 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-100"
          >
            x
          </button>
        </div>

        <ApplyWizardStepper step={step} />

        <form
          className="mt-5 space-y-4"
          onSubmit={async (event: FormEvent<HTMLFormElement>) => {
            if (step !== 3 || !allowSubmitRef.current) {
              event.preventDefault();
              return;
            }

            allowSubmitRef.current = false;
            event.preventDefault();
            await onSubmit(new FormData(event.currentTarget));
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
          {errorMessage ? (
            <p className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700 dark:border-red-900/60 dark:bg-red-950/40 dark:text-red-300">{errorMessage}</p>
          ) : null}
          {submissionHint ? (
            <p className="rounded-md border border-zinc-200 bg-zinc-50 p-3 text-sm text-zinc-600 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300">{submissionHint}</p>
          ) : null}

          <div className={step === 1 ? "space-y-3" : "hidden"}>
            <input
              ref={firstInputRef}
              name="full_name"
              required
              value={values.full_name}
              onChange={updateField("full_name")}
              className={fieldClassName}
              placeholder="Full name"
            />
            <input
              type="email"
              name="email"
              required
              value={values.email}
              onChange={updateField("email")}
              className={fieldClassName}
              placeholder="Email"
            />
            <input
              name="postal_code"
              required
              value={values.postal_code}
              onChange={updateField("postal_code")}
              className={fieldClassName}
              placeholder="Postal code"
            />
            <input
              name="location"
              required
              value={values.location}
              onChange={updateField("location")}
              className={fieldClassName}
              placeholder="Location"
            />
            {values.email !== "" && !isEmailValid(values.email) ? (
              <p className="text-xs text-red-600 dark:text-red-400">Please provide a valid email address.</p>
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
              className="w-full rounded border border-zinc-300 bg-white px-3 py-2 text-zinc-900 outline-none transition file:mr-3 file:rounded-md file:border-0 file:bg-zinc-900 file:px-3 file:py-2 file:text-sm file:font-medium file:text-white hover:file:bg-zinc-700 focus:border-zinc-500 focus:ring-2 focus:ring-zinc-500/30 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 dark:file:bg-zinc-100 dark:file:text-zinc-900 dark:hover:file:bg-zinc-200"
            />

            {resumeFile ? (
              <div className="space-y-2 rounded-md border border-zinc-200 bg-zinc-50 p-3 text-sm dark:border-zinc-800 dark:bg-zinc-900">
                <p className="font-medium text-zinc-900 dark:text-zinc-100">Selected file: {resumeFile.name}</p>
                <p className="text-zinc-600 dark:text-zinc-300">Size: {formatBytes(resumeFile.size)}</p>
                {resumeFile.type === "application/pdf" && resumePreviewUrl ? (
                  <a className="inline-flex text-zinc-900 underline underline-offset-4 hover:text-zinc-700 dark:text-zinc-100 dark:hover:text-zinc-300" href={resumePreviewUrl} target="_blank" rel="noreferrer">
                    Open preview
                  </a>
                ) : null}
                <p className="text-xs text-zinc-500 dark:text-zinc-400">Use the file picker above to replace file.</p>
              </div>
            ) : (
              <p className="text-sm text-zinc-500 dark:text-zinc-400">Upload your resume to continue.</p>
            )}
          </div>

          <div className={step === 3 ? "space-y-3 text-sm" : "hidden"}>
            <div className="rounded-md border border-zinc-200 p-3 dark:border-zinc-800 dark:bg-zinc-900">
              <p className="font-semibold text-zinc-900 dark:text-zinc-100">Credentials</p>
              <ul className="mt-2 space-y-1 text-zinc-700 dark:text-zinc-300">
                <li>
                  <span className="font-medium text-zinc-900 dark:text-zinc-100">Full name:</span> {values.full_name}
                </li>
                <li>
                  <span className="font-medium text-zinc-900 dark:text-zinc-100">Email:</span> {values.email}
                </li>
                <li>
                  <span className="font-medium text-zinc-900 dark:text-zinc-100">Postal code:</span> {values.postal_code}
                </li>
                <li>
                  <span className="font-medium text-zinc-900 dark:text-zinc-100">Location:</span> {values.location}
                </li>
              </ul>
            </div>

            <div className="rounded-md border border-zinc-200 p-3 dark:border-zinc-800 dark:bg-zinc-900">
              <p className="font-semibold text-zinc-900 dark:text-zinc-100">Resume</p>
              {resumeFile ? (
                <p className="mt-2 text-zinc-700 dark:text-zinc-300">
                  {resumeFile.name} ({formatBytes(resumeFile.size)})
                </p>
              ) : (
                <p className="mt-2 text-red-600 dark:text-red-400">No file selected.</p>
              )}
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 border-t border-zinc-200 pt-4 dark:border-zinc-800">
            {step > 1 ? (
              <button type="button" disabled={isSubmitting} onClick={goBack} className="rounded border border-zinc-300 bg-white px-4 py-2 text-zinc-700 transition hover:bg-zinc-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-500 disabled:opacity-60 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200 dark:hover:bg-zinc-800">
                Back
              </button>
            ) : null}

            {step < 3 ? (
              <button
                type="button"
                disabled={isSubmitting || (step === 1 && !isStep1Valid) || (step === 2 && !isStep2Valid)}
                onClick={goNext}
                className="rounded bg-zinc-900 px-4 py-2 text-white transition hover:bg-zinc-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-500 disabled:opacity-60 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
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
                className="rounded bg-zinc-900 px-4 py-2 text-white transition hover:bg-zinc-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-500 disabled:opacity-60 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
              >
                {isSubmitting ? "Uploading Resume..." : "Submit"}
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};
