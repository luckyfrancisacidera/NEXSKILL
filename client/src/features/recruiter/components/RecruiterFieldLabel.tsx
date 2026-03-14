import type { ReactNode } from 'react';

export interface RecruiterFieldLabelProps {
  htmlFor: string;
  children: ReactNode;
}

/**
 * Feature-shared label used by recruiter form controls.
 */
export const RecruiterFieldLabel = ({ htmlFor, children }: RecruiterFieldLabelProps) => (
  <label htmlFor={htmlFor} className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
    {children}
  </label>
);

