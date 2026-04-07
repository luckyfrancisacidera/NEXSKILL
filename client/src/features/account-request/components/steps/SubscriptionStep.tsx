import { AlertCircle, Check, CreditCard, Sparkles } from "lucide-react";
import type { CSSProperties } from "react";
import { ACCOUNT_REQUEST_PLANS } from "@features/account-request/data/accountRequest.data";
import { SectionTitle } from "@features/account-request/components/AccountRequestShared";
import type {
  FormErrors,
  SubscriptionPlanForm,
} from "@features/account-request/types/accountRequest.types";
import { PaymentMethodSelector } from "./PaymentMethodSelector";

export const SubscriptionStep = ({
  data,
  errors,
  onChange,
}: {
  data: SubscriptionPlanForm;
  errors: FormErrors;
  onChange: <K extends keyof SubscriptionPlanForm>(
    field: K,
    value: SubscriptionPlanForm[K],
  ) => void;
}) => {
  const selectedPlan =
    ACCOUNT_REQUEST_PLANS.find((plan) => plan.id === data.planId) ?? ACCOUNT_REQUEST_PLANS[0];
  const isFreeTrial = selectedPlan.id === "free-trial";

  const handlePlanSelect = (planId: string) => {
    onChange("planId", planId);

    if (planId === "free-trial") {
      onChange("billingCycle", "monthly");
      onChange("paymentMethod", "");
      onChange("paymentDetails", {});
    }
  };

  return (
    <div className="space-y-6">
      <SectionTitle
        icon={<CreditCard size={18} />}
        title="Subscription Plan"
        subtitle="Choose the plan that best fits your hiring volume and team size."
      />

      <div className="space-y-3">
        <div className="flex flex-wrap items-center justify-center gap-3 text-center">
          <span className={`text-sm font-medium ${data.billingCycle === "monthly" || isFreeTrial ? "text-zinc-800 dark:text-zinc-100" : "text-zinc-400 dark:text-zinc-500"}`}>
            Monthly
          </span>
          <button
            type="button"
            disabled={!selectedPlan.supportsAnnual}
            onClick={() => onChange("billingCycle", data.billingCycle === "monthly" ? "annual" : "monthly")}
            className={`relative flex h-6 w-12 flex-shrink-0 rounded-full transition-all ${
              selectedPlan.supportsAnnual
                ? "bg-zinc-800 dark:bg-zinc-100"
                : "cursor-not-allowed bg-zinc-200 opacity-60 dark:bg-zinc-800"
            }`}
            aria-label={selectedPlan.supportsAnnual ? "Toggle annual billing" : "Annual billing unavailable for free trial"}
          >
            <span
              className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow-sm transition-all duration-300 dark:bg-zinc-900 ${
                data.billingCycle === "annual" && selectedPlan.supportsAnnual ? "left-6" : "left-0.5"
              }`}
            />
          </button>
          <span className={`text-sm font-medium ${data.billingCycle === "annual" && selectedPlan.supportsAnnual ? "text-zinc-800 dark:text-zinc-100" : "text-zinc-400 dark:text-zinc-500"}`}>
            Annual{" "}
            <span className={`text-xs font-semibold ${selectedPlan.supportsAnnual ? "text-emerald-600" : "text-zinc-400 dark:text-zinc-500"}`}>
              {selectedPlan.supportsAnnual ? "(Save 10%)" : "(Not available for trial)"}
            </span>
          </span>
        </div>

        {isFreeTrial ? (
          <div className="mx-auto max-w-2xl rounded-2xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-center dark:border-white/10 dark:bg-zinc-900">
            <p className="text-sm text-zinc-500 dark:text-zinc-300">
              Free Trial stays fixed at <span className="font-semibold text-zinc-800 dark:text-zinc-100">14 days</span> and does not support annual billing.
            </p>
          </div>
        ) : null}
      </div>

      {errors.planId ? (
        <div className="flex items-center gap-1.5 px-1">
          <AlertCircle size={13} className="text-red-500" />
          <p className="text-xs text-red-500">{errors.planId}</p>
        </div>
      ) : null}

      <div
        className="grid grid-cols-1 gap-4 pb-1 md:grid-cols-2"
        style={{ WebkitOverflowScrolling: "touch" } as CSSProperties}
      >
        {ACCOUNT_REQUEST_PLANS.map((plan) => {
          const selected = data.planId === plan.id;
          const price = data.billingCycle === "annual" && plan.supportsAnnual ? plan.priceAnnual : plan.price;
          const period = plan.supportsAnnual ? plan.period : "/14 days";

          return (
            <button
              key={plan.id}
              type="button"
              onClick={() => handlePlanSelect(plan.id)}
              className={`relative w-full min-w-0 rounded-2xl border-2 p-5 text-left transition-all duration-200 ${
                selected
                  ? "border-zinc-800 bg-zinc-800 text-white shadow-xl shadow-zinc-200 dark:border-zinc-100 dark:bg-zinc-100 dark:text-zinc-900 dark:shadow-none"
                  : "border-zinc-200 bg-white hover:border-zinc-400 hover:shadow-md dark:border-white/10 dark:bg-zinc-950 dark:hover:border-zinc-500"
              }`}
            >
              {plan.badge ? (
                <span
                  className={`absolute -top-3 left-1/2 -translate-x-1/2 rounded-full px-3 py-1 text-xs font-semibold ${
                    selected ? "bg-white text-zinc-800 dark:bg-zinc-900 dark:text-zinc-100" : "bg-zinc-800 text-white dark:bg-zinc-100 dark:text-zinc-900"
                  }`}
                >
                  {plan.badge}
                </span>
              ) : null}

              <div className="mb-4">
                <p className={`mb-1 text-xs font-semibold uppercase tracking-widest ${selected ? "text-zinc-400 dark:text-zinc-500" : "text-zinc-400 dark:text-zinc-500"}`}>
                  {plan.name}
                </p>
                <div className="flex flex-wrap items-baseline gap-1">
                  <span className={`font-display text-3xl font-semibold ${selected ? "text-white dark:text-zinc-900" : "text-zinc-800 dark:text-zinc-100"}`}>
                    {price}
                  </span>
                  <span className={`text-sm ${selected ? "text-zinc-400 dark:text-zinc-600" : "text-zinc-400 dark:text-zinc-500"}`}>
                    {period}
                  </span>
                </div>
                <p className={`mt-1.5 text-xs leading-relaxed ${selected ? "text-zinc-300 dark:text-zinc-700" : "text-zinc-400 dark:text-zinc-500"}`}>
                  {plan.tagline}
                </p>
              </div>

              <ul className="space-y-2.5">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-2.5">
                    <span
                      className={`mt-0.5 flex h-4 w-4 flex-shrink-0 items-center justify-center rounded-full ${
                        selected ? "bg-zinc-600 dark:bg-zinc-800" : "bg-zinc-100 dark:bg-white/10"
                      }`}
                    >
                      <Check size={10} className={selected ? "text-white dark:text-zinc-100" : "text-zinc-600 dark:text-zinc-300"} strokeWidth={3} />
                    </span>
                    <span className={`text-xs leading-relaxed ${selected ? "text-zinc-200 dark:text-zinc-800" : "text-zinc-500 dark:text-zinc-400"}`}>
                      {feature}
                    </span>
                  </li>
                ))}
              </ul>

              {selected ? (
                <div className="absolute right-4 top-4 flex h-5 w-5 items-center justify-center rounded-full bg-white dark:bg-zinc-900">
                  <Check size={11} className="text-zinc-800 dark:text-zinc-100" strokeWidth={3} />
                </div>
              ) : null}
            </button>
          );
        })}
      </div>

      {isFreeTrial ? (
        <div className="rounded-3xl border border-zinc-200 bg-zinc-50 p-5 dark:border-white/10 dark:bg-zinc-900">
          <div className="flex items-start gap-3">
            <span className="mt-0.5 flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-2xl border border-zinc-200 bg-white text-zinc-700 dark:border-white/10 dark:bg-zinc-950 dark:text-zinc-100">
              <Sparkles size={18} />
            </span>
            <div className="space-y-2">
              <p className="text-sm font-semibold text-zinc-800 dark:text-zinc-100">No payment details required</p>
              <p className="text-sm leading-relaxed text-zinc-500 dark:text-zinc-300">
                Your 14-day free trial starts after your account request is approved and your invitation is accepted.
              </p>
              <p className="text-sm leading-relaxed text-zinc-500 dark:text-zinc-400">
                Explore SkillSense before committing to a paid plan. You can upgrade later inside the platform.
              </p>
            </div>
          </div>
        </div>
      ) : (
        <PaymentMethodSelector
          value={data.paymentMethod}
          error={errors.paymentMethod}
          details={data.paymentDetails ?? {}}
          onMethodChange={(v) => onChange("paymentMethod", v)}
          onDetailsChange={(d) => onChange("paymentDetails", d)}
        />
      )}
    </div>
  );
};
