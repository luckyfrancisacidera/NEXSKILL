import type { PropsWithChildren } from 'react';
import { Navigate } from 'react-router-dom';
import { useSession } from '@app/providers/session-store';
import type { Role } from '@shared/types';

interface RouteGuardProps extends PropsWithChildren {
  allowedRoles: Role[];
}

export const RouteGuard = ({ allowedRoles, children }: RouteGuardProps) => {
  const {
    state: { role },
  } = useSession();

  if (!allowedRoles.includes(role)) {
    return <Navigate to="/not-authorized" replace />;
  }

  return <>{children}</>;
};
