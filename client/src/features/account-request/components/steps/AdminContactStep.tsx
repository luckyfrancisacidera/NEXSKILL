import { useState } from "react";
import { Briefcase, Eye, EyeOff, Mail, Phone, User } from "lucide-react";
import {
  FieldWrapper,
  TextInput,
} from "@features/account-request/components/AccountRequestFormControls";
import { SectionTitle } from "@features/account-request/components/AccountRequestShared";
import type {
  AdminContact,
  FormErrors,
} from "@features/account-request/types/accountRequest.types";

export const AdminContactStep = ({
  data,
  errors,
  onChange,
}: {
  data: AdminContact;
  errors: FormErrors;
  onChange: (field: keyof AdminContact, value: string) => void;
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const strength = (() => {
    if (!data.password) return 0;
    let score = 0;
    if (data.password.length >= 8) score++;
    if (/[A-Z]/.test(data.password)) score++;
    if (/[0-9]/.test(data.password)) score++;
    if (/[^A-Za-z0-9]/.test(data.password)) score++;
    return score;
  })();

  const strengthLabel = ["", "Weak", "Fair", "Good", "Strong"][strength];
  const strengthColor = ["", "bg-red-400", "bg-amber-400", "bg-lime-400", "bg-emerald-500"][strength];

  return (
    <div className="space-y-5">
      <SectionTitle
        icon={<User size={18} />}
        title="Admin Contact"
        subtitle="This person will be the primary administrator for the SkillSense account."
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <FieldWrapper label="Full Name" error={errors.fullName} required>
          <TextInput
            placeholder="Maria Santos"
            value={data.fullName}
            error={!!errors.fullName}
            icon={<User size={15} />}
            onChange={(event) => onChange("fullName", event.target.value)}
          />
        </FieldWrapper>

        <FieldWrapper label="Position / Role" error={errors.position} required>
          <TextInput
            placeholder="HR Manager"
            value={data.position}
            error={!!errors.position}
            icon={<Briefcase size={15} />}
            onChange={(event) => onChange("position", event.target.value)}
          />
        </FieldWrapper>

        <FieldWrapper label="Work Email" error={errors.email} required>
          <TextInput
            type="email"
            placeholder="admin@company.com"
            value={data.email}
            error={!!errors.email}
            icon={<Mail size={15} />}
            onChange={(event) => onChange("email", event.target.value)}
          />
        </FieldWrapper>

        <FieldWrapper label="Phone Number" error={errors.phone} required>
          <TextInput
            type="tel"
            placeholder="+63 912 345 6789"
            value={data.phone}
            error={!!errors.phone}
            icon={<Phone size={15} />}
            onChange={(event) => onChange("phone", event.target.value)}
          />
        </FieldWrapper>

        <FieldWrapper label="Password" error={errors.password} required>
          <TextInput
            type={showPassword ? "text" : "password"}
            placeholder="Min. 8 characters"
            value={data.password}
            error={!!errors.password}
            onChange={(event) => onChange("password", event.target.value)}
            rightEl={
              <button
                type="button"
                onClick={() => setShowPassword((value) => !value)}
                className="text-zinc-400 transition-colors hover:text-zinc-600 dark:hover:text-zinc-100"
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            }
          />
          {data.password ? (
            <div className="mt-1.5 space-y-1">
              <div className="flex gap-1">
                {[1, 2, 3, 4].map((index) => (
                  <div
                    key={index}
                    className={`h-1 flex-1 rounded-full transition-all duration-300 ${
                      index <= strength ? strengthColor : "bg-zinc-200 dark:bg-white/10"
                    }`}
                  />
                ))}
              </div>
              <p className="text-xs text-zinc-400 dark:text-zinc-500">
                Password strength: <span className="font-medium text-zinc-600 dark:text-zinc-200">{strengthLabel}</span>
              </p>
            </div>
          ) : null}
        </FieldWrapper>

        <FieldWrapper label="Confirm Password" error={errors.confirmPassword} required>
          <TextInput
            type={showConfirmPassword ? "text" : "password"}
            placeholder="Re-enter your password"
            value={data.confirmPassword}
            error={!!errors.confirmPassword}
            onChange={(event) => onChange("confirmPassword", event.target.value)}
            rightEl={
              <button
                type="button"
                onClick={() => setShowConfirmPassword((value) => !value)}
                className="text-zinc-400 transition-colors hover:text-zinc-600 dark:hover:text-zinc-100"
              >
                {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            }
          />
        </FieldWrapper>
      </div>
    </div>
  );
};
