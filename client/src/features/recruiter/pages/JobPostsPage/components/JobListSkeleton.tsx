import { TableRowsSkeleton } from "@shared/components/feedback/skeletons/TableRowsSkeleton";

export const JobListSkeleton = () => (
  <TableRowsSkeleton
    columns={["minmax(240px, 1.4fr)", "minmax(140px, 0.8fr)", "minmax(140px, 0.8fr)", "minmax(120px, 0.7fr)", "minmax(120px, 0.7fr)", "236px"]}
    rowCount={6}
  />
);

