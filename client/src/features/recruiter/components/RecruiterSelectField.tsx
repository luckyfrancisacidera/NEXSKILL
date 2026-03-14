import type { ReactNode, SelectHTMLAttributes } from 'react';

import { RecruiterFieldLabel } from '@features/recruiter/components/RecruiterFieldLabel';
import { recruiterInputClassName } from '@features/recruiter/components/recruiterForm.shared';

export interface RecruiterSelectFieldProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label: string;
  children: ReactNode;
}

/**
 * Feature-shared select wrapper for recruiter forms.
 */
export const RecruiterSelectField = ({ label, className, id, children, ...props }: RecruiterSelectFieldProps) => {
  const fieldId = id ?? props.name;

  return (
    <div>
      <RecruiterFieldLabel htmlFor={fieldId ?? ''}>{label}</RecruiterFieldLabel>
      <select id={fieldId} className={`${recruiterInputClassName}${className ? ` ${className}` : ''}`} style={{ colorScheme: 'light dark' }} {...props}>
        {children}
      </select>
    </div>
  );
};
