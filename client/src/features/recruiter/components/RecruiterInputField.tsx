import type { ComponentType, InputHTMLAttributes } from 'react';

import { RecruiterFieldLabel } from '@features/recruiter/components/RecruiterFieldLabel';
import { recruiterInputClassName } from '@features/recruiter/components/recruiterForm.shared';

export interface RecruiterInputFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  icon?: ComponentType<{ className?: string }>;
}

/**
 * Feature-shared recruiter text input with optional icon support.
 */
export const RecruiterInputField = ({ label, icon: Icon, className, id, ...props }: RecruiterInputFieldProps) => {
  const fieldId = id ?? props.name;

  return (
    <div>
      <RecruiterFieldLabel htmlFor={fieldId ?? ''}>{label}</RecruiterFieldLabel>
      <div className="relative mt-1">
        {Icon ? <Icon className="pointer-events-none absolute left-3 top-3 h-4 w-4 text-zinc-400 dark:text-zinc-600" /> : null}
        <input
          id={fieldId}
          className={`${recruiterInputClassName}${Icon ? ' pl-10' : ''}${className ? ` ${className}` : ''}`}
          {...props}
        />
      </div>
    </div>
  );
};
