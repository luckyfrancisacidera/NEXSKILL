import {
  Check,
  User,
  CreditCard,
  Calendar,
  Lock,
  Phone,
  Hash,
  Mail,
  Building2,
  AlertCircle,
} from "lucide-react";
import type {
  PaymentDetails,
  CardDetails,
  WalletDetails,
  BankDetails,
  PaypalDetails,
} from "@features/account-request/types/accountRequest.types";

// ─── Custom SVG icons ────────────────────────────────────────────────────────

const CardIcon = () => (
  <svg
    width="22"
    height="22"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.75"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <rect x="2" y="5" width="20" height="14" rx="3" />
    <line x1="2" y1="10" x2="22" y2="10" />
    <line x1="6" y1="15" x2="10" y2="15" />
    <circle cx="17" cy="15" r="1.5" fill="currentColor" stroke="none" />
  </svg>
);

const GCashIcon = () => (
  <svg
    width="22"
    height="22"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.75"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <rect x="7" y="2" width="10" height="20" rx="3" />
    <line x1="7" y1="6" x2="17" y2="6" />
    <line x1="7" y1="18" x2="17" y2="18" />
    <circle cx="12" cy="20.5" r="0.75" fill="currentColor" stroke="none" />
    <path d="M10 11h2.5M12.5 11v2.5H10" />
  </svg>
);

const MayaIcon = () => (
  <svg
    width="22"
    height="22"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.75"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <rect x="7" y="2" width="10" height="20" rx="3" />
    <line x1="7" y1="6" x2="17" y2="6" />
    <line x1="7" y1="18" x2="17" y2="18" />
    <circle cx="12" cy="20.5" r="0.75" fill="currentColor" stroke="none" />
    <path d="M10.5 12.5l1.5-2 1.5 2-1.5 1.5z" fill="currentColor" stroke="none" />
  </svg>
);

const BankIcon = () => (
  <svg
    width="22"
    height="22"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.75"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <polygon points="12 3 21 8 3 8" />
    <line x1="5" y1="8" x2="5" y2="17" />
    <line x1="9" y1="8" x2="9" y2="17" />
    <line x1="15" y1="8" x2="15" y2="17" />
    <line x1="19" y1="8" x2="19" y2="17" />
    <line x1="3" y1="17" x2="21" y2="17" />
    <line x1="2" y1="20" x2="22" y2="20" />
  </svg>
);

const PayPalIcon = () => (
  <svg
    width="22"
    height="22"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.75"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M7 4h7a4 4 0 0 1 0 8H8l-2 8H4L7 4z" />
    <path d="M11 4h2a5 5 0 0 1 5 4c0 3-2 4-4 4" />
  </svg>
);

// ─── Payment methods config ──────────────────────────────────────────────────

const PAYMENT_METHOD_OPTIONS = [
  { id: "card", label: "Credit / Debit Card", Icon: CardIcon },
  { id: "gcash", label: "GCash", Icon: GCashIcon },
  { id: "maya", label: "Maya", Icon: MayaIcon },
  { id: "bank-transfer", label: "Bank Transfer", Icon: BankIcon },
  { id: "paypal", label: "PayPal", Icon: PayPalIcon },
] as const;

export type PaymentMethodOptionId = typeof PAYMENT_METHOD_OPTIONS[number]["id"];

// ─── Shared field primitives ────────────────────────────────────────────────

interface FieldProps {
  label: string;
  placeholder: string;
  value: string;
  onChange: (v: string) => void;
  required?: boolean;
  icon?: React.ReactNode;
}

const Field = ({ label, placeholder, value, onChange, required, icon }: FieldProps) => (
  <div className="flex flex-col gap-1.5">
    <label className="flex items-center gap-1 text-xs font-medium text-zinc-500 dark:text-zinc-400">
      {label}
      {required && <span className="text-red-400 text-[10px]">*</span>}
    </label>

    <div className="relative">
      {icon ? (
        <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 dark:text-zinc-500">
          {icon}
        </span>
      ) : null}

      <input
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`
          h-10 w-full rounded-xl border border-zinc-200 bg-white text-sm text-zinc-800
          outline-none transition-all duration-150 placeholder:text-zinc-400
          focus:border-zinc-900 focus:ring-1 focus:ring-zinc-900
          dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100
          dark:placeholder:text-zinc-600 dark:focus:border-zinc-300 dark:focus:ring-zinc-300
          ${icon ? "pl-9 pr-3" : "px-3"}
        `}
      />
    </div>
  </div>
);

// ─── Method-specific field panels ───────────────────────────────────────────

const CardFields = ({
  values,
  onChange,
}: {
  values: Partial<CardDetails>;
  onChange: (patch: Partial<CardDetails>) => void;
}) => (
  <div className="grid gap-3">
    <Field
      label="Cardholder Name"
      placeholder="Full name on card"
      value={values.cardName ?? ""}
      onChange={(v) => onChange({ ...values, cardName: v })}
      required
      icon={<User size={13} />}
    />

    <Field
      label="Card Number"
      placeholder="1234 5678 9012 3456"
      value={values.cardNumber ?? ""}
      onChange={(v) => onChange({ ...values, cardNumber: v })}
      required
      icon={<CreditCard size={13} />}
    />

    <div className="grid grid-cols-2 gap-3">
      <Field
        label="Expiry Date"
        placeholder="MM / YY"
        value={values.cardExpiry ?? ""}
        onChange={(v) => onChange({ ...values, cardExpiry: v })}
        required
        icon={<Calendar size={13} />}
      />

      <Field
        label="CVV"
        placeholder="123"
        value={values.cardCvv ?? ""}
        onChange={(v) => onChange({ ...values, cardCvv: v })}
        required
        icon={<Lock size={13} />}
      />
    </div>
  </div>
);

const WalletFields = ({
  values,
  onChange,
}: {
  values: Partial<WalletDetails>;
  onChange: (patch: Partial<WalletDetails>) => void;
}) => (
  <div className="grid gap-3">
    <Field
      label="Mobile Number"
      placeholder="+63 9XX XXX XXXX"
      value={values.phone ?? ""}
      onChange={(v) => onChange({ ...values, phone: v })}
      required
      icon={<Phone size={13} />}
    />

    <Field
      label="Account Name"
      placeholder="Registered name"
      value={values.accountName ?? ""}
      onChange={(v) => onChange({ ...values, accountName: v })}
      required
      icon={<User size={13} />}
    />
  </div>
);

const BankFields = ({
  values,
  onChange,
}: {
  values: Partial<BankDetails>;
  onChange: (patch: Partial<BankDetails>) => void;
}) => (
  <div className="grid gap-3">
    <Field
      label="Account Name"
      placeholder="Name on account"
      value={values.accountName ?? ""}
      onChange={(v) => onChange({ ...values, accountName: v })}
      required
      icon={<User size={13} />}
    />

    <div className="grid grid-cols-2 gap-3">
      <Field
        label="Bank Name"
        placeholder="e.g. BDO, BPI"
        value={values.bankName ?? ""}
        onChange={(v) => onChange({ ...values, bankName: v })}
        required
        icon={<Building2 size={13} />}
      />

      <Field
        label="Account Number"
        placeholder="Account number"
        value={values.accountNumber ?? ""}
        onChange={(v) => onChange({ ...values, accountNumber: v })}
        required
        icon={<Hash size={13} />}
      />
    </div>

    <Field
      label="Reference Number"
      placeholder="Transaction reference (optional)"
      value={values.referenceNumber ?? ""}
      onChange={(v) => onChange({ ...values, referenceNumber: v })}
      icon={<Hash size={13} />}
    />
  </div>
);

const PaypalFields = ({
  values,
  onChange,
}: {
  values: Partial<PaypalDetails>;
  onChange: (patch: Partial<PaypalDetails>) => void;
}) => (
  <div className="grid gap-3">
    <Field
      label="PayPal Email"
      placeholder="you@example.com"
      value={values.email ?? ""}
      onChange={(v) => onChange({ ...values, email: v })}
      required
      icon={<Mail size={13} />}
    />
  </div>
);

// ─── Details panel wrapper ───────────────────────────────────────────────────

const PaymentDetailsPanel = ({
  method,
  details,
  onDetailsChange,
}: {
  method: PaymentMethodOptionId;
  details: PaymentDetails;
  onDetailsChange: (patch: PaymentDetails) => void;
}) => {
  const label = PAYMENT_METHOD_OPTIONS.find((m) => m.id === method)?.label;

  return (
    <div className="mt-4 animate-in rounded-2xl border border-zinc-200 bg-zinc-50 p-5 fade-in slide-in-from-bottom-1 duration-200 dark:border-zinc-800 dark:bg-zinc-900">
      <p className="mb-4 text-[11px] font-semibold uppercase tracking-widest text-zinc-400 dark:text-zinc-500">
        {label} details
      </p>

      {method === "card" ? (
        <CardFields
          values={details.card ?? {}}
          onChange={(v) => onDetailsChange({ ...details, card: v })}
        />
      ) : null}

      {method === "gcash" || method === "maya" ? (
        <WalletFields
          values={details[method] ?? {}}
          onChange={(v) => onDetailsChange({ ...details, [method]: v })}
        />
      ) : null}

      {method === "bank-transfer" ? (
        <BankFields
          values={details.bank ?? {}}
          onChange={(v) => onDetailsChange({ ...details, bank: v })}
        />
      ) : null}

      {method === "paypal" ? (
        <PaypalFields
          values={details.paypal ?? {}}
          onChange={(v) => onDetailsChange({ ...details, paypal: v })}
        />
      ) : null}
    </div>
  );
};

// ─── Main selector ───────────────────────────────────────────────────────────

export const PaymentMethodSelector = ({
  value,
  error,
  details,
  onMethodChange,
  onDetailsChange,
}: {
  value: PaymentMethodOptionId | "";
  error?: string;
  details: PaymentDetails;
  onMethodChange: (method: PaymentMethodOptionId) => void;
  onDetailsChange: (details: PaymentDetails) => void;
}) => (
  <div>
    <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-zinc-400 dark:text-zinc-500">
      Payment Method <span className="text-red-400">*</span>
    </p>

    <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-5">
      {PAYMENT_METHOD_OPTIONS.map(({ id, label, Icon }) => {
        const selected = value === id;

        return (
          <button
            key={id}
            type="button"
            onClick={() => onMethodChange(id)}
            className={`
              relative flex flex-col items-center gap-2 rounded-2xl border px-3 py-3.5
              text-center transition-all duration-150
              ${
                selected
                  ? "border-zinc-900 bg-white ring-1 ring-zinc-900 shadow-md shadow-zinc-100 dark:border-zinc-100 dark:bg-zinc-950 dark:ring-zinc-100 dark:shadow-none"
                  : "border-zinc-200 bg-white hover:border-zinc-400 hover:shadow-sm dark:border-zinc-800 dark:bg-zinc-950 dark:hover:border-zinc-600"
              }
            `}
          >
            {selected ? (
              <span className="absolute right-2.5 top-2.5 flex h-4 w-4 items-center justify-center rounded-full bg-zinc-900 dark:bg-zinc-100">
                <Check size={9} className="text-white dark:text-zinc-900" strokeWidth={3} />
              </span>
            ) : null}

            <span className={selected ? "text-zinc-800 dark:text-zinc-100" : "text-zinc-400 dark:text-zinc-500"}>
              <Icon />
            </span>

            <span
              className={`text-[11px] font-medium leading-tight ${
                selected ? "text-zinc-800 dark:text-zinc-100" : "text-zinc-500 dark:text-zinc-400"
              }`}
            >
              {label}
            </span>
          </button>
        );
      })}
    </div>

    {error ? (
      <div className="mt-2 flex items-center gap-1.5 px-0.5">
        <AlertCircle size={13} className="flex-shrink-0 text-red-500" />
        <p className="text-xs text-red-500">{error}</p>
      </div>
    ) : null}

    {value ? (
      <PaymentDetailsPanel
        method={value}
        details={details}
        onDetailsChange={onDetailsChange}
      />
    ) : null}
  </div>
);