import { useMemo, useState } from "react";
import { useToast } from "@app/providers/ToastProvider";
import {
  ACCOUNT_REQUEST_PLANS,
  INITIAL_ACCOUNT_REQUEST_FORM,
} from "@features/account-request/data/accountRequest.data";
import { validateAccountRequestStep } from "@features/account-request/services/accountRequest.validation";
import { accountRequestService } from "@features/account-request/services/accountRequest.service";
import { ApiError } from "@shared/api/http";
import type {
  AdminContact,
  Agreements,
  CompanyInfo,
  FormErrors,
  SubscriptionPlanForm,
} from "@features/account-request/types/accountRequest.types";

export const useCompanyAccountRequestForm = () => {
  const { showToast } = useToast();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState(INITIAL_ACCOUNT_REQUEST_FORM);
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isValidatingAdminEmail, setIsValidatingAdminEmail] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submissionResult, setSubmissionResult] = useState<{ requestId: string; status: string } | null>(null);

  const setCompany = (field: keyof CompanyInfo, value: string) => {
    setFormData((current) => ({
      ...current,
      company: { ...current.company, [field]: value },
    }));
  };

  const setAdmin = (field: keyof AdminContact, value: string) => {
    setFormData((current) => ({
      ...current,
      admin: { ...current.admin, [field]: value },
    }));
  };

  const setSubscription = <K extends keyof SubscriptionPlanForm>(
    field: K,
    value: SubscriptionPlanForm[K],
  ) => {
    setFormData((current) => {
      if (field === "planId") {
        const selectedPlan = ACCOUNT_REQUEST_PLANS.find((plan) => plan.id === value);

        if (selectedPlan?.id === "free-trial") {
          return {
            ...current,
            subscription: {
              ...current.subscription,
              planId: value as SubscriptionPlanForm["planId"],
              billingCycle: "monthly",
            },
          };
        }
      }

      return {
        ...current,
        subscription: { ...current.subscription, [field]: value },
      };
    });
  };

  const setDocumentField = (
    field: "businessRegNumber" | "taxId",
    value: string,
  ) => {
    setFormData((current) => ({
      ...current,
      docs: { ...current.docs, [field]: value },
    }));
  };

  const setDocumentFile = (
    field: "businessPermit" | "certificateOfReg",
    file: File | null,
  ) => {
    setFormData((current) => ({
      ...current,
      docs: { ...current.docs, [field]: file },
    }));
  };

  const setAgreement = (field: keyof Agreements, value: boolean) => {
    setFormData((current) => ({
      ...current,
      agreements: { ...current.agreements, [field]: value },
    }));
  };

  const goNext = async () => {
    const nextErrors = validateAccountRequestStep(step, formData);
    setErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0 || step >= 5) {
      return;
    }

    if (step === 2) {
      setIsValidatingAdminEmail(true);

      try {
        const availability = await accountRequestService.checkPrimaryAdminEmailAvailability(formData.admin.email);
        if (!availability.isAvailable) {
          const emailError = availability.message ?? "The primary admin email already belongs to an existing account.";
          setErrors({ email: emailError });
          showToast({
            title: "Email already in use",
            description: emailError,
            tone: "error",
          });
          return;
        }
      } catch (error) {
        const description = error instanceof ApiError
          ? error.message
          : "We couldn't validate the primary admin email right now.";
        showToast({
          title: "Validation failed",
          description,
          tone: "error",
        });
        return;
      } finally {
        setIsValidatingAdminEmail(false);
      }
    }

    setStep((current) => current + 1);
  };

  const goBack = () => {
    setErrors({});
    setStep((current) => Math.max(1, current - 1));
  };

  const submit = async () => {
    const nextErrors = validateAccountRequestStep(5, formData);
    setErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) {
      return;
    }

    setIsSubmitting(true);

    try {
      const result = await accountRequestService.submit(formData);
      setSubmissionResult(result);
      setSubmitted(true);
      showToast({
        title: "Request submitted",
        description: "Your company account request is now pending review.",
        tone: "success",
      });
    } catch (error) {
      if (error instanceof ApiError && error.status === 409) {
        const emailError = error.message || "The primary admin email already belongs to an existing account.";
        setErrors((current) => ({ ...current, email: emailError }));
      }

      showToast({
        title: "Submission failed",
        description: error instanceof ApiError ? error.message : "We couldn't submit your request right now.",
        tone: "error",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const referenceNumber = useMemo(
    () => submissionResult?.requestId ?? `SS-${Date.now().toString(36).toUpperCase()}`,
    [submissionResult],
  );

  return {
    step,
    formData,
    errors,
    isSubmitting,
    isValidatingAdminEmail,
    submitted,
    submissionResult,
    referenceNumber,
    setCompany,
    setAdmin,
    setSubscription,
    setDocumentField,
    setDocumentFile,
    setAgreement,
    goNext,
    goBack,
    submit,
  };
};
