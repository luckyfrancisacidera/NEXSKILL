import { TableRowsSkeleton } from "@shared/components/feedback/skeletons/TableRowsSkeleton";

export const ApplicationListSkeleton = () => (
  <TableRowsSkeleton
    columns={["minmax(220px, 1.3fr)", "minmax(140px, 0.8fr)", "minmax(120px, 0.7fr)", "minmax(220px, 0.9fr)"]}
    rowCount={6}
  />
);

