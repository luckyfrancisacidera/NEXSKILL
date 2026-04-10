import "@features/account-request/styles/company-account-request.css";
import { ChevronLeft, ChevronRight, Loader2, ShieldCheck } from "lucide-react";
import { useTheme } from "@app/providers/ThemeProvider";
import { ACCOUNT_REQUEST_STEPS } from "@features/account-request/data/accountRequest.data";
import { AccountRequestStepper } from "@features/account-request/components/AccountRequestStepper";
import { SuccessScreen } from "@features/account-request/components/AccountRequestShared";
import {
  AdminContactStep,
  CompanyInfoStep,
  ReviewSubmitStep,
  VerificationStep,
} from "@features/account-request/components/steps";
import { useCompanyAccountRequestForm } from "@features/account-request/hooks/useCompanyAccountRequestForm";

export default function CompanyAccountRequest() {
  const { theme } = useTheme();
  const logoSrc = theme === "dark" ? "/logo/Lightbrand_logo.png" : "/logo/Darkbrand_logo.png";
  const {
    step,
    formData,
    errors,
    isSubmitting,
    isValidatingAdminEmail,
    submitted,
    referenceNumber,
    setCompany,
    setAdmin,
    setDocumentField,
    setDocumentFile,
    setAgreement,
    goNext,
    goBack,
    submit,
  } = useCompanyAccountRequestForm();

  return (
    <div className="account-request-page flex min-h-screen items-start justify-center bg-zinc-50 px-4 py-8 dark:bg-zinc-950">
      <div className="w-full max-w-3xl">
        <div className="mb-8 text-center">
          <div className="mb-5 inline-flex items-center gap-2.5">
            <img src={logoSrc} alt="SkillSense logo" className="h-10 w-auto object-contain" />
            <span className="text-base font-semibold text-zinc-800 dark:text-zinc-100">SkillSense</span>
          </div>
          <h1 className="font-display text-3xl text-zinc-800 dark:text-zinc-100">Company Account Request</h1>
          <p className="mt-2 text-sm text-zinc-400 dark:text-zinc-500">
            Complete the form below to request access to the SkillSense ATS platform.
          </p>
        </div>

        <div className="overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm dark:border-white/10 dark:bg-zinc-900">
          {!submitted ? (
            <div className="border-b border-zinc-100 px-4 pb-5 pt-6 dark:border-white/10 sm:px-6 sm:pt-7">
              <AccountRequestStepper current={step} />
            </div>
          ) : null}

          <div className="px-4 py-6 sm:px-6 sm:py-7">
            {submitted ? (
              <SuccessScreen referenceNumber={referenceNumber} />
            ) : (
              <>
                {step === 1 ? (
                  <CompanyInfoStep data={formData.company} errors={errors} onChange={setCompany} />
                ) : null}
                {step === 2 ? (
                  <AdminContactStep data={formData.admin} errors={errors} onChange={setAdmin} />
                ) : null}
                {step === 3 ? (
                  <VerificationStep
                    data={formData.docs}
                    errors={errors}
                    onChange={setDocumentField}
                    onFile={setDocumentFile}
                  />
                ) : null}
                {step === 4 ? (
                  <ReviewSubmitStep data={formData} errors={errors} onChange={setAgreement} />
                ) : null}
              </>
            )}
          </div>

          {!submitted ? (
            <div className="flex flex-col gap-4 border-t border-zinc-100 px-4 pb-6 pt-5 dark:border-white/10 sm:flex-row sm:items-center sm:justify-between sm:px-6">
              <button
                type="button"
                onClick={goBack}
                disabled={step === 1}
                className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-zinc-200 px-5 py-2.5 text-sm font-medium text-zinc-600 transition-all hover:border-zinc-400 hover:bg-zinc-50 disabled:pointer-events-none disabled:opacity-30 dark:border-white/10 dark:text-zinc-300 dark:hover:bg-white/5 sm:w-auto"
              >
                <ChevronLeft size={16} />
                Back
              </button>

              <div className="flex items-center justify-center gap-1.5">
                {ACCOUNT_REQUEST_STEPS.map((item) => (
                  <div
                    key={item.id}
                    className={`rounded-full transition-all duration-300 ${
                      step === item.id
                        ? "h-2 w-5 bg-zinc-800 dark:bg-zinc-100"
                        : item.id < step
                          ? "h-2 w-2 bg-zinc-400 dark:bg-zinc-400"
                          : "h-2 w-2 bg-zinc-200 dark:bg-white/10"
                    }`}
                  />
                ))}
              </div>

              {step < 4 ? (
                <button
                  type="button"
                  onClick={() => {
                    void goNext();
                  }}
                  disabled={isValidatingAdminEmail}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-zinc-800 px-5 py-2.5 text-sm font-medium text-white transition-all active:scale-95 hover:bg-zinc-900 hover:shadow-lg hover:shadow-zinc-200 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-white dark:hover:shadow-none sm:w-auto"
                >
                  {isValidatingAdminEmail ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      Checking email...
                    </>
                  ) : (
                    <>
                      Continue
                      <ChevronRight size={16} />
                    </>
                  )}
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    void submit();
                  }}
                  disabled={isSubmitting}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-zinc-800 px-6 py-2.5 text-sm font-medium text-white transition-all active:scale-95 hover:bg-zinc-900 hover:shadow-lg hover:shadow-zinc-200 disabled:pointer-events-none disabled:opacity-70 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-white dark:hover:shadow-none sm:w-auto"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 size={15} className="animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    <>
                      <ShieldCheck size={15} />
                      Submit Request
                    </>
                  )}
                </button>
              )}
            </div>
          ) : null}
        </div>

        <p className="mt-5 text-center text-xs text-zinc-400 dark:text-zinc-500">
          Already have an account?{" "}
          <a href="/login" className="font-medium text-zinc-700 underline underline-offset-2 hover:text-zinc-900 dark:text-zinc-100 dark:hover:text-zinc-300">
            Sign In
          </a>
        </p>
      </div>
    </div>
  );
}
