import { Briefcase, Building2, Globe, MapPin } from "lucide-react";
import {
  COMPANY_SIZES,
  COUNTRIES,
  INDUSTRIES,
} from "@features/account-request/data/accountRequest.data";
import {
  FieldWrapper,
  SelectInput,
  TextareaInput,
  TextInput,
} from "@features/account-request/components/AccountRequestFormControls";
import { SectionTitle } from "@features/account-request/components/AccountRequestShared";
import type {
  CompanyInfo,
  FormErrors,
} from "@features/account-request/types/accountRequest.types";

export const CompanyInfoStep = ({
  data,
  errors,
  onChange,
}: {
  data: CompanyInfo;
  errors: FormErrors;
  onChange: (field: keyof CompanyInfo, value: string) => void;
}) => (
  <div className="space-y-5">
    <SectionTitle
      icon={<Building2 size={18} />}
      title="Company Information"
      subtitle="Tell us about the company that will be using SkillSense."
    />

    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      <FieldWrapper label="Company Name" error={errors.companyName} required>
        <TextInput
          placeholder="Acme Corporation"
          value={data.companyName}
          error={!!errors.companyName}
          icon={<Building2 size={15} />}
          onChange={(event) => onChange("companyName", event.target.value)}
        />
      </FieldWrapper>

      <FieldWrapper label="Business / Trade Name" error={errors.tradeName} required>
        <TextInput
          placeholder="Acme Corp"
          value={data.tradeName}
          error={!!errors.tradeName}
          icon={<Briefcase size={15} />}
          onChange={(event) => onChange("tradeName", event.target.value)}
        />
      </FieldWrapper>

      <FieldWrapper label="Industry" error={errors.industry} required>
        <SelectInput
          value={data.industry}
          error={!!errors.industry}
          placeholder="Select industry"
          onChange={(event) => onChange("industry", event.target.value)}
        >
          {INDUSTRIES.map((industry) => (
            <option key={industry} value={industry}>
              {industry}
            </option>
          ))}
        </SelectInput>
      </FieldWrapper>

      <FieldWrapper label="Company Size" error={errors.companySize} required>
        <SelectInput
          value={data.companySize}
          error={!!errors.companySize}
          placeholder="Select company size"
          onChange={(event) => onChange("companySize", event.target.value)}
        >
          {COMPANY_SIZES.map((size) => (
            <option key={size} value={size}>
              {size}
            </option>
          ))}
        </SelectInput>
      </FieldWrapper>

      <FieldWrapper
        label="Website URL"
        error={errors.website}
        required
        wrapperClassName="sm:col-span-2"
      >
        <TextInput
          placeholder="https://yourcompany.com"
          value={data.website}
          error={!!errors.website}
          icon={<Globe size={15} />}
          onChange={(event) => onChange("website", event.target.value)}
        />
      </FieldWrapper>
    </div>

    <FieldWrapper
      label="Company Description"
      error={errors.description}
      required
      hint="Briefly describe what your company does and your hiring goals (min. 30 characters)."
    >
      <TextareaInput
        rows={4}
        placeholder="Describe your company, what you do, and how you plan to use SkillSense..."
        value={data.description}
        error={!!errors.description}
        onChange={(event) => onChange("description", event.target.value)}
      />
    </FieldWrapper>

    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
      <FieldWrapper label="Country" error={errors.country} required>
        <SelectInput
          value={data.country}
          error={!!errors.country}
          placeholder="Select country"
          onChange={(event) => onChange("country", event.target.value)}
        >
          {COUNTRIES.map((country) => (
            <option key={country} value={country}>
              {country}
            </option>
          ))}
        </SelectInput>
      </FieldWrapper>

      <FieldWrapper label="City / Province" error={errors.city} required>
        <TextInput
          placeholder="Manila"
          value={data.city}
          error={!!errors.city}
          icon={<MapPin size={15} />}
          onChange={(event) => onChange("city", event.target.value)}
        />
      </FieldWrapper>

      <FieldWrapper label="Full Address" error={errors.address} required>
        <TextInput
          placeholder="123 Business Ave, Suite 400"
          value={data.address}
          error={!!errors.address}
          onChange={(event) => onChange("address", event.target.value)}
        />
      </FieldWrapper>
    </div>
  </div>
);
