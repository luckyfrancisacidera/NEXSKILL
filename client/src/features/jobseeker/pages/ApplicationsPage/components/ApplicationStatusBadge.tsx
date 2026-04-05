import { StatusBadge } from "@shared/components/data-display/StatusBadge";

type ApplicationStatusBadgeProps = {
  status: string;
};

export const ApplicationStatusBadge = ({
  status,
}: ApplicationStatusBadgeProps) => (
  <StatusBadge status={status} className="min-w-24 justify-center" />
);

