import { useEffect, useMemo, useState } from "react";
import type { FormEvent, ReactNode } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import {
  BadgeCheck,
  Building2,
  CreditCard,
  KeyRound,
  Loader2,
  Mail,
  ShieldCheck,
} from "lucide-react";
import {
  PaymentMethodSelector,
  type PaymentMethodOptionId,
} from "@features/account-request/components/steps/PaymentMethodSelector";
import { ACCOUNT_REQUEST_PLANS } from "@features/account-request/data/accountRequest.data";
import type { PaymentDetails } from "@features/account-request/types/accountRequest.types";
import { adminService } from "@features/admin/service/admin.service";
import type { CompanyInvitationViewDto } from "@features/admin/types/admin.type";
import { ApiError } from "@shared/api/http";
import { Card } from "@shared/components/data-display/Card";

const toInvitationPaymentMethod = (
  value: string | null | undefined,
): PaymentMethodOptionId | "" => {
  if (
    value === "gcash" ||
    value === "maya" ||
    value === "card" ||
    value === "bank-transfer" ||
    value === "paypal"
  ) {
    return value;
  }

  return "";
};

const DetailSection = ({
  icon,
  title,
  children,
}: {
  icon: ReactNode;
  title: string;
  children: ReactNode;
}) => (
  <section className="rounded-2xl border border-zinc-200/80 bg-zinc-50/80 p-5 dark:border-zinc-800/80 dark:bg-zinc-950/40">
    <div className="mb-4 flex items-center gap-2.5">
      <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white text-zinc-500 shadow-sm dark:bg-zinc-900 dark:text-zinc-300">
        {icon}
      </div>
      <h2 className="text-sm font-semibold uppercase tracking-[0.16em] text-zinc-900 dark:text-zinc-100">
        {title}
      </h2>
    </div>
    <div className="space-y-3">{children}</div>
  </section>
);

const DetailRow = ({ label, value }: { label: string; value?: string | null }) => (
  <div className="flex flex-col gap-1 border-b border-zinc-200/70 pb-3 last:border-b-0 last:pb-0 dark:border-zinc-800/80 sm:flex-row sm:gap-4">
    <span className="text-xs font-semibold uppercase tracking-[0.16em] text-zinc-400 dark:text-zinc-500 sm:w-48 sm:flex-shrink-0">
      {label}
    </span>
    <span className="text-sm font-medium text-zinc-700 dark:text-zinc-200">
      {value?.trim() ? value : "Not provided"}
    </span>
  </div>
);

export const CompanyInvitationPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token") ?? "";

  const [invitation, setInvitation] = useState<CompanyInvitationViewDto | null>(null);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [selectedPlanId, setSelectedPlanId] = useState("");
  const [selectedBillingCycle, setSelectedBillingCycle] = useState<"monthly" | "annual">("monthly");
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<PaymentMethodOptionId | "">("");
  const [paymentDetails, setPaymentDetails] = useState<PaymentDetails>({});

  useEffect(() => {
    if (!token) {
      setErrorMessage("Invitation token is missing.");
      setIsLoading(false);
      return;
    }

    let isMounted = true;
    setIsLoading(true);
    setErrorMessage("");

    adminService
      .getInvitation(token)
      .then((result) => {
        if (isMounted) {
          setInvitation(result);
          setSelectedPlanId("");
          setSelectedBillingCycle("monthly");
          setSelectedPaymentMethod(toInvitationPaymentMethod(result.mockPaymentMethod));
        }
      })
      .catch((error) => {
        if (isMounted) {
          setErrorMessage(
            error instanceof ApiError ? error.message : "Invitation could not be loaded.",
          );
        }
      })
      .finally(() => {
        if (isMounted) {
          setIsLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [token]);

  const selectedPlan =
    ACCOUNT_REQUEST_PLANS.find((plan) => plan.id === selectedPlanId) ?? null;

  const isFreeTrial = selectedPlan?.id === "free-trial";

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!token || !invitation || invitation.isExpired || invitation.isAccepted) {
      return;
    }

    if (!password || !confirmPassword) {
      setErrorMessage("Enter and confirm your password to activate the account.");
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage("Password confirmation does not match.");
      return;
    }

    if (!selectedPlanId) {
      setErrorMessage("Select a subscription plan to continue.");
      return;
    }

    const resolvedPlan = ACCOUNT_REQUEST_PLANS.find((plan) => plan.id === selectedPlanId);
    if (!resolvedPlan) {
      setErrorMessage("Select a valid subscription plan to continue.");
      return;
    }

    const resolvedBillingCycle =
      resolvedPlan.id === "free-trial" ? "monthly" : selectedBillingCycle;

    if (resolvedPlan.id !== "free-trial" && !resolvedBillingCycle) {
      setErrorMessage("Select a billing cycle to continue.");
      return;
    }

    if (!selectedPaymentMethod) {
      setErrorMessage("Select a payment method to continue.");
      return;
    }

    setIsSubmitting(true);
    setErrorMessage("");

    try {
      await adminService.acceptInvitation(token, {
        password,
        confirmPassword,
        planId: resolvedPlan.id,
        billingCycle: resolvedPlan.id === "free-trial" ? undefined : resolvedBillingCycle,
        paymentMethod: selectedPaymentMethod,
        paymentDetails,
      });

      navigate("/company-invitation/success", { replace: true });
    } catch (error) {
      setErrorMessage(
        error instanceof ApiError
          ? error.message
          : "We couldn't activate this invitation right now.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const statusMessage = useMemo(() => {
    if (errorMessage) {
      return { tone: "error", text: errorMessage };
    }

    if (invitation?.isExpired) {
      return { tone: "warning", text: "This invitation has expired." };
    }

    if (invitation?.isAccepted) {
      return {
        tone: "success",
        text: "This invitation has already been accepted. You can proceed to login.",
      };
    }

    return null;
  }, [errorMessage, invitation]);

  const statusClasses =
    statusMessage?.tone === "error"
      ? "border-red-200 bg-red-50 text-red-700 dark:border-red-900/70 dark:bg-red-950/30 dark:text-red-300"
      : statusMessage?.tone === "warning"
        ? "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-900/70 dark:bg-amber-950/30 dark:text-amber-300"
        : "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900/70 dark:bg-emerald-950/30 dark:text-emerald-300";

  return (
    <div className="font-inter min-h-screen bg-[radial-gradient(circle_at_top,_rgba(244,244,245,0.95),_rgba(250,250,250,1)_42%,_rgba(228,228,231,0.72)_100%)] px-4 py-10 text-zinc-900 dark:bg-[radial-gradient(circle_at_top,_rgba(39,39,42,0.32),_rgba(9,9,11,1)_42%,_rgba(9,9,11,1)_100%)] dark:text-zinc-100 sm:px-6 lg:px-8">
      <div className="mx-auto flex w-full max-w-4xl flex-col gap-6">
        <div className="max-w-3xl space-y-4">
          <div className="inline-flex items-center gap-2 rounded-full border border-zinc-200/80 bg-white/85 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.24em] text-zinc-500 shadow-sm backdrop-blur dark:border-zinc-800/80 dark:bg-zinc-900/70 dark:text-zinc-400">
            <ShieldCheck size={14} />
            Company Admin Invitation
          </div>

          <div className="space-y-3">
            <h1 className="text-3xl font-semibold tracking-tight text-zinc-950 dark:text-white sm:text-4xl">
              Accept Invitation
            </h1>
            <p className="max-w-2xl text-sm leading-6 text-zinc-600 dark:text-zinc-300 sm:text-base">
              Review the approved company details, complete your billing setup, and create
              your password to activate your SkillSense ATS company admin account.
            </p>
          </div>
        </div>

        <Card className="overflow-hidden border-zinc-200/80 bg-white/90 shadow-xl shadow-zinc-200/40 backdrop-blur dark:border-zinc-800/80 dark:bg-zinc-900/80 dark:shadow-black/30">
          <div className="space-y-6 p-6 sm:p-8">
            <div className="flex flex-col gap-4 border-b border-zinc-200/80 pb-6 dark:border-zinc-800/80 sm:flex-row sm:items-start sm:justify-between">
              <div className="space-y-2">
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-zinc-400 dark:text-zinc-500">
                  Invitation Summary
                </p>
                <h2 className="text-2xl font-semibold text-zinc-950 dark:text-zinc-50">
                  {invitation?.companyName ?? "Loading invitation"}
                </h2>
                <p className="text-sm text-zinc-500 dark:text-zinc-400">
                  {invitation
                    ? invitation.role
                    : "We are verifying your invitation and loading the approved request details."}
                </p>
              </div>

              {invitation ? (
                <div className="inline-flex items-center gap-2 rounded-full border border-zinc-200/80 bg-zinc-50 px-3 py-1.5 text-xs font-semibold text-zinc-600 dark:border-zinc-800 dark:bg-zinc-950/70 dark:text-zinc-300">
                  <BadgeCheck size={14} />
                  Expires {new Date(invitation.expiresAtUtc).toLocaleDateString()}
                </div>
              ) : null}
            </div>

            {statusMessage ? (
              <div className={`rounded-2xl border px-4 py-3 text-sm font-medium ${statusClasses}`}>
                {statusMessage.text}
              </div>
            ) : null}

            {isLoading ? (
              <div className="flex min-h-72 flex-col items-center justify-center gap-3 rounded-3xl border border-dashed border-zinc-200/80 bg-zinc-50/70 px-6 text-center dark:border-zinc-800/80 dark:bg-zinc-950/40">
                <Loader2 className="h-6 w-6 animate-spin text-zinc-400" />
                <div className="space-y-1">
                  <p className="text-sm font-semibold text-zinc-700 dark:text-zinc-200">
                    Loading invitation details
                  </p>
                  <p className="text-sm text-zinc-500 dark:text-zinc-400">
                    Please wait while we confirm your approved account information.
                  </p>
                </div>
              </div>
            ) : invitation ? (
              <form className="space-y-6" onSubmit={submit}>
                <DetailSection icon={<Building2 size={18} />} title="Confirmation Details">
                  <div className="space-y-4">
                    <div className="space-y-3">
                      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-zinc-400 dark:text-zinc-500">
                        Company Information
                      </p>
                      <DetailRow label="Company Name" value={invitation.companyName} />
                      <DetailRow label="Business Name" value={invitation.businessName} />
                      <DetailRow label="Industry" value={invitation.industry} />
                      <DetailRow label="Company Size" value={invitation.companySize} />
                      <DetailRow label="Full Address" value={invitation.fullAddress} />
                    </div>

                    <div className="space-y-3 pt-2">
                      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-zinc-400 dark:text-zinc-500">
                        Primary Admin
                      </p>
                      <DetailRow label="Full Name" value={invitation.primaryAdminFullName} />
                      <DetailRow label="Email" value={invitation.primaryAdminEmail} />
                    </div>

                    {invitation.reviewNotes?.trim() ? (
                      <div className="space-y-3 pt-2">
                        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-zinc-400 dark:text-zinc-500">
                          Review Notes
                        </p>
                        <div className="rounded-2xl border border-zinc-200/80 bg-white/80 px-4 py-3 text-sm leading-6 text-zinc-600 dark:border-zinc-800/80 dark:bg-zinc-900/70 dark:text-zinc-300">
                          {invitation.reviewNotes}
                        </div>
                      </div>
                    ) : null}
                  </div>
                </DetailSection>

                <DetailSection icon={<CreditCard size={18} />} title="Billing Setup">
                  <div className="space-y-4">
                    <div className="space-y-1">
                      <p className="text-sm font-semibold text-zinc-800 dark:text-zinc-100">
                        Select Plan
                      </p>
                      <p className="text-sm leading-6 text-zinc-500 dark:text-zinc-400">
                        Choose the plan you want this company subscription to start with.
                        This is mock demo setup only and does not charge a real payment method.
                      </p>
                    </div>

                    <div className="grid grid-cols-1 gap-3">
                      {ACCOUNT_REQUEST_PLANS.map((plan) => {
                        const selected = selectedPlanId === plan.id;

                        return (
                          <button
                            key={plan.id}
                            type="button"
                            onClick={() => {
                              setSelectedPlanId(plan.id);
                              if (!plan.supportsAnnual) {
                                setSelectedBillingCycle("monthly");
                              }
                            }}
                            className={`rounded-2xl border p-4 text-left transition-all ${
                              selected
                                ? "border-zinc-900 bg-zinc-950 text-white shadow-lg shadow-zinc-200/60 dark:border-zinc-100 dark:bg-zinc-100 dark:text-zinc-900 dark:shadow-none"
                                : "border-zinc-200 bg-white hover:border-zinc-400 hover:shadow-sm dark:border-zinc-800 dark:bg-zinc-950 dark:hover:border-zinc-600"
                            }`}
                          >
                            <div className="flex items-start justify-between gap-3">
                              <div className="space-y-1">
                                <div className="flex flex-wrap items-center gap-2">
                                  <p className="text-sm font-semibold">{plan.name}</p>
                                  {plan.badge ? (
                                    <span
                                      className={`rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] ${
                                        selected
                                          ? "bg-white/10 text-white dark:bg-zinc-900 dark:text-zinc-100"
                                          : "bg-zinc-100 text-zinc-600 dark:bg-zinc-900 dark:text-zinc-300"
                                      }`}
                                    >
                                      {plan.badge}
                                    </span>
                                  ) : null}
                                </div>

                                <p
                                  className={`text-xs ${
                                    selected
                                      ? "text-zinc-300 dark:text-zinc-600"
                                      : "text-zinc-500 dark:text-zinc-400"
                                  }`}
                                >
                                  {plan.description}
                                </p>
                              </div>

                              <div className="text-right">
                                <p className="text-lg font-semibold">{plan.price}</p>
                                <p
                                  className={`text-xs ${
                                    selected
                                      ? "text-zinc-300 dark:text-zinc-600"
                                      : "text-zinc-500 dark:text-zinc-400"
                                  }`}
                                >
                                  {plan.period}
                                </p>
                              </div>
                            </div>
                          </button>
                        );
                      })}
                    </div>

                    <div className="space-y-3 rounded-2xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-950">
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                          <p className="text-sm font-semibold text-zinc-800 dark:text-zinc-100">
                            Billing Cycle
                          </p>
                          <p className="text-xs text-zinc-500 dark:text-zinc-400">
                            {isFreeTrial
                              ? "Free trial stays on a fixed 14-day mock setup."
                              : "Choose monthly or annual mock billing for this subscription."}
                          </p>
                        </div>

                        <div className="inline-flex rounded-full border border-zinc-200 bg-zinc-50 p-1 dark:border-zinc-800 dark:bg-zinc-900">
                          {(["monthly", "annual"] as const).map((cycle) => {
                            const disabled =
                              cycle === "annual" && !!selectedPlan && !selectedPlan.supportsAnnual;
                            const selected = selectedBillingCycle === cycle;

                            return (
                              <button
                                key={cycle}
                                type="button"
                                disabled={disabled}
                                onClick={() => setSelectedBillingCycle(cycle)}
                                className={`rounded-full px-3 py-1.5 text-xs font-semibold capitalize transition ${
                                  selected
                                    ? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900"
                                    : "text-zinc-500 dark:text-zinc-400"
                                } ${disabled ? "cursor-not-allowed opacity-50" : ""}`}
                              >
                                {cycle}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    </div>

                    <PaymentMethodSelector
                      value={selectedPaymentMethod}
                      error={
                        !selectedPaymentMethod &&
                        errorMessage.toLowerCase().includes("payment method")
                          ? errorMessage
                          : undefined
                      }
                      details={paymentDetails}
                      onMethodChange={setSelectedPaymentMethod}
                      onDetailsChange={setPaymentDetails}
                    />
                  </div>
                </DetailSection>

                <DetailSection icon={<KeyRound size={18} />} title="Password Setup">
                  <div className="space-y-4">
                    <div className="rounded-2xl border border-zinc-200/80 bg-white/85 p-4 dark:border-zinc-800/80 dark:bg-zinc-900/45">
                      <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-zinc-400 dark:text-zinc-500">
                        <Mail size={14} />
                        Invite Email
                      </div>
                      <p className="text-sm font-medium text-zinc-700 dark:text-zinc-200">
                        {invitation.email ?? invitation.primaryAdminEmail ?? "Loading..."}
                      </p>
                    </div>

                    <label className="block space-y-2">
                      <span className="text-sm font-medium text-zinc-700 dark:text-zinc-200">
                        Set Password
                      </span>
                      <div className="relative">
                        <KeyRound className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
                        <input
                          value={password}
                          onChange={(event) => setPassword(event.target.value)}
                          type="password"
                          autoComplete="new-password"
                          placeholder="Create your password"
                          className="w-full rounded-2xl border border-zinc-200 bg-white px-11 py-3 text-sm text-zinc-900 outline-none transition focus:border-zinc-400 focus:ring-4 focus:ring-zinc-200/70 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100 dark:focus:border-zinc-500 dark:focus:ring-zinc-800/80"
                        />
                      </div>
                    </label>

                    <label className="block space-y-2">
                      <span className="text-sm font-medium text-zinc-700 dark:text-zinc-200">
                        Confirm Password
                      </span>
                      <div className="relative">
                        <KeyRound className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
                        <input
                          value={confirmPassword}
                          onChange={(event) => setConfirmPassword(event.target.value)}
                          type="password"
                          autoComplete="new-password"
                          placeholder="Confirm your password"
                          className="w-full rounded-2xl border border-zinc-200 bg-white px-11 py-3 text-sm text-zinc-900 outline-none transition focus:border-zinc-400 focus:ring-4 focus:ring-zinc-200/70 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100 dark:focus:border-zinc-500 dark:focus:ring-zinc-800/80"
                        />
                      </div>
                    </label>
                  </div>
                </DetailSection>

                <button
                  type="submit"
                  disabled={
                    !token ||
                    !invitation ||
                    isLoading ||
                    isSubmitting ||
                    invitation.isExpired ||
                    invitation.isAccepted
                  }
                  className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-zinc-950 px-4 py-3 text-sm font-semibold text-white transition hover:bg-zinc-800 disabled:cursor-not-allowed disabled:bg-zinc-300 disabled:text-zinc-500 dark:bg-zinc-100 dark:text-zinc-950 dark:hover:bg-zinc-200 dark:disabled:bg-zinc-800 dark:disabled:text-zinc-500"
                >
                  {isSubmitting ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <ShieldCheck className="h-4 w-4" />
                  )}
                  {isSubmitting ? "Activating Account..." : "Activate Account"}
                </button>

                <div className="rounded-2xl border border-zinc-200/80 bg-zinc-50/85 px-4 py-3 text-sm leading-6 text-zinc-500 dark:border-zinc-800/80 dark:bg-zinc-950/45 dark:text-zinc-400">
                  Your company admin account will be ready immediately after activation. The plan,
                  billing cycle, and payment method chosen here are stored as mock subscription setup
                  data for demo use only.
                </div>
              </form>
            ) : (
              <div className="rounded-3xl border border-dashed border-zinc-200/80 bg-zinc-50/70 px-6 py-10 text-center text-sm text-zinc-500 dark:border-zinc-800/80 dark:bg-zinc-950/40 dark:text-zinc-400">
                Invitation details are unavailable for this token.
              </div>
            )}

            {invitation?.isAccepted || invitation?.isExpired ? (
              <Link
                to="/login"
                className="inline-flex w-full items-center justify-center rounded-2xl border border-zinc-300 px-4 py-3 text-sm font-semibold text-zinc-700 transition hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-200 dark:hover:bg-zinc-800/70"
              >
                Proceed to Login
              </Link>
            ) : null}
          </div>
        </Card>
      </div>
    </div>
  );
};

export default CompanyInvitationPage;