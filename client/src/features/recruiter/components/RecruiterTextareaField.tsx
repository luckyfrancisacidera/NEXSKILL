import type { TextareaHTMLAttributes } from 'react';

import { RecruiterFieldLabel } from '@features/recruiter/components/RecruiterFieldLabel';
import { recruiterInputClassName } from '@features/recruiter/components/recruiterForm.shared';

export interface RecruiterTextareaFieldProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string;
}

/**
 * Feature-shared textarea used by recruiter forms.
 */
export const RecruiterTextareaField = ({ label, className, id, ...props }: RecruiterTextareaFieldProps) => {
  const fieldId = id ?? props.name;

  return (
    <div>
      <RecruiterFieldLabel htmlFor={fieldId ?? ''}>{label}</RecruiterFieldLabel>
      <textarea id={fieldId} className={`${recruiterInputClassName}${className ? ` ${className}` : ''}`} {...props} />
    </div>
  );
};
