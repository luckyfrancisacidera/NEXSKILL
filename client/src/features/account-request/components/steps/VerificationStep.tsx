import { FileText, Hash, ShieldCheck } from "lucide-react";
import {
  FieldWrapper,
  FileUploadField,
  TextInput,
} from "@features/account-request/components/AccountRequestFormControls";
import { SectionTitle } from "@features/account-request/components/AccountRequestShared";
import type {
  FormErrors,
  VerificationDocs,
} from "@features/account-request/types/accountRequest.types";

export const VerificationStep = ({
  data,
  errors,
  onChange,
  onFile,
}: {
  data: VerificationDocs;
  errors: FormErrors;
  onChange: (field: "businessRegNumber" | "taxId", value: string) => void;
  onFile: (field: "businessPermit" | "certificateOfReg", file: File | null) => void;
}) => (
  <div className="space-y-5">
    <SectionTitle
      icon={<FileText size={18} />}
      title="Verification Documents"
      subtitle="We need these to verify your company before activating your account."
    />

    <div className="flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4 dark:border-amber-900 dark:bg-amber-950/30">
      <ShieldCheck size={16} className="mt-0.5 flex-shrink-0 text-amber-600" />
      <p className="text-xs leading-relaxed text-amber-700 dark:text-amber-300">
        Your documents are encrypted and used solely for verification purposes. We follow strict data privacy standards.
      </p>
    </div>

    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      <FieldWrapper label="Business Registration Number" error={errors.businessRegNumber} required>
        <TextInput
          placeholder="SEC-2024-000000"
          value={data.businessRegNumber}
          error={!!errors.businessRegNumber}
          icon={<Hash size={15} />}
          onChange={(event) => onChange("businessRegNumber", event.target.value)}
        />
      </FieldWrapper>

      <FieldWrapper label="Tax ID / TIN" error={errors.taxId} required>
        <TextInput
          placeholder="000-000-000-000"
          value={data.taxId}
          error={!!errors.taxId}
          icon={<Hash size={15} />}
          onChange={(event) => onChange("taxId", event.target.value)}
        />
      </FieldWrapper>
    </div>

    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      <FileUploadField
        label="Business Permit"
        file={data.businessPermit}
        error={errors.businessPermit}
        onFile={(file) => onFile("businessPermit", file)}
        hint="Current barangay or city business permit"
      />
      <FileUploadField
        label="Certificate of Registration"
        file={data.certificateOfReg}
        error={errors.certificateOfReg}
        onFile={(file) => onFile("certificateOfReg", file)}
        hint="SEC, DTI, or CDA registration document"
      />
    </div>
  </div>
);
