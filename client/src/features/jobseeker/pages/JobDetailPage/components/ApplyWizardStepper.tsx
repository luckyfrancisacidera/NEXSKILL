type Step = 1 | 2 | 3;

type ApplyWizardStepperProps = {
  step: Step;
};

export const ApplyWizardStepper = ({ step }: ApplyWizardStepperProps) => {
  const steps = ["Credentials", "Resume", "Verification"];
  const percentage = (step / 3) * 100;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between text-xs font-medium text-zinc-500">
        <span>Step {step} of 3</span>
        <span>{Math.round(percentage)}%</span>
      </div>

      <div className="h-2 overflow-hidden rounded-full bg-zinc-200">
        <div className="h-full rounded-full bg-zinc-900 transition-all" style={{ width: `${percentage}%` }} />
      </div>

      <div className="grid grid-cols-3 gap-2 text-xs sm:text-sm">
        {steps.map((label, index) => {
          const number = index + 1;
          const active = number === step;
          const done = number < step;

          return (
            <div
              key={label}
              className={`rounded-md border px-2 py-2 text-center ${
                active
                  ? "border-zinc-900 bg-zinc-900 text-white"
                  : done
                    ? "border-zinc-900 bg-zinc-100 text-zinc-900"
                    : "border-zinc-200 text-zinc-500"
              }`}
            >
              {label}
            </div>
          );
        })}
      </div>
    </div>
  );
};
