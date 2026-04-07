import { useMemo, useState } from "react";
import {
  ACCOUNT_REQUEST_PLANS,
  INITIAL_ACCOUNT_REQUEST_FORM,
} from "@features/account-request/data/accountRequest.data";
import { validateAccountRequestStep } from "@features/account-request/services/accountRequest.validation";
import type {
  AdminContact,
  Agreements,
  CompanyAccountRequestFormData,
  CompanyInfo,
  FormErrors,
  SubscriptionPlanForm,
} from "@features/account-request/types/accountRequest.types";

export const useCompanyAccountRequestForm = () => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<CompanyAccountRequestFormData>(
    INITIAL_ACCOUNT_REQUEST_FORM,
  );
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

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
              paymentMethod: "",
              paymentDetails: {},
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

  const goNext = () => {
    const nextErrors = validateAccountRequestStep(step, formData);
    setErrors(nextErrors);

    if (Object.keys(nextErrors).length === 0 && step < 5) {
      setStep((current) => current + 1);
    }
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
    await new Promise((resolve) => setTimeout(resolve, 2000));
    setIsSubmitting(false);
    setSubmitted(true);
  };

  const referenceNumber = useMemo(
    () => `SS-${Date.now().toString(36).toUpperCase()}`,
    [],
  );

  return {
    step,
    formData,
    errors,
    isSubmitting,
    submitted,
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
