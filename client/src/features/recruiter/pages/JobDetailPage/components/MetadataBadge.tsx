import type { ReactNode } from 'react';

export interface MetadataBadgeProps {
  children: ReactNode;
  className?: string;
}

/**
 * Shared pill styling used for compact metadata in the page header.
 */
export const MetadataBadge = ({ children, className = '' }: MetadataBadgeProps) => (
  <span className={`rounded-lg border border-zinc-200 bg-zinc-100 px-3 py-1 text-sm text-zinc-700 ${className}`.trim()}>
    {children}
  </span>
);
