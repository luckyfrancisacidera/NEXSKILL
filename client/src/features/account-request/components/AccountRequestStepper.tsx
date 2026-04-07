import { Check } from "lucide-react";
import { ACCOUNT_REQUEST_STEPS } from "@features/account-request/data/accountRequest.data";

export const AccountRequestStepper = ({ current }: { current: number }) => (
  <div className="account-request-scrollbar-hidden w-full overflow-x-auto pb-2">
    <div className="mx-auto flex min-w-max items-start px-1 sm:px-2 md:min-w-0 md:justify-center">
      {ACCOUNT_REQUEST_STEPS.map((step, index) => {
        const done = current > step.id;
        const active = current === step.id;
        const Icon = step.icon;
        const isLast = index === ACCOUNT_REQUEST_STEPS.length - 1;

        return (
          <div key={step.id} className="flex items-start">
            <div className="flex min-w-[72px] flex-col items-center sm:min-w-[88px]">
              <div
                className={`flex h-10 w-10 items-center justify-center rounded-full border-2 transition-all duration-300 ${
                  done || active
                    ? "border-zinc-800 bg-zinc-800 text-white dark:border-zinc-100 dark:bg-zinc-100 dark:text-zinc-900"
                    : "border-zinc-200 bg-white text-zinc-400 dark:border-white/10 dark:bg-zinc-950 dark:text-zinc-500"
                }`}
              >
                {done ? <Check size={17} strokeWidth={2.5} /> : <Icon size={17} />}
              </div>
              <span
                className={`mt-2 max-w-[64px] text-center text-[11px] font-medium leading-tight sm:max-w-[72px] sm:text-xs ${
                  active
                    ? "text-zinc-800 dark:text-zinc-100"
                    : done
                      ? "text-zinc-500 dark:text-zinc-300"
                      : "text-zinc-400 dark:text-zinc-500"
                }`}
              >
                {step.label}
              </span>
            </div>

            {!isLast ? (
              <div className="flex min-w-5 flex-1 items-center pt-5 sm:min-w-8">
                <div
                  className={`h-0.5 w-full transition-all duration-500 ${
                    current > step.id
                      ? "bg-zinc-800 dark:bg-zinc-100"
                      : "bg-zinc-200 dark:bg-white/10"
                  }`}
                />
              </div>
            ) : null}
          </div>
        );
      })}
    </div>
  </div>
);
