import type { ReactNode } from 'react';

export interface RecruiterLabeledFieldProps {
  label: string;
  children: ReactNode;
}

/**
 * Feature-shared labeled field shell for simple recruiter forms.
 */
export const RecruiterLabeledField = ({ label, children }: RecruiterLabeledFieldProps) => (
  <label className="text-sm">
    {label}
    <div className="mt-1">{children}</div>
  </label>
);

