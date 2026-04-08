import { Briefcase, Mail, Phone, User } from "lucide-react";
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
  return (
    <div className="space-y-5">
      <SectionTitle
        icon={<User size={18} />}
        title="Admin Contact"
        subtitle="This person will be the primary administrator for the SkillSense account. They will set their password after approval from the invitation email."
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
      </div>
    </div>
  );
};
