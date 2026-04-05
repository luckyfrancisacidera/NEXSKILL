import { TableRowsSkeleton } from "@shared/components/feedback/skeletons/TableRowsSkeleton";

export const CandidateListSkeleton = () => (
  <TableRowsSkeleton
    columns={["56px", "minmax(240px, 1.3fr)", "minmax(180px, 1fr)", "minmax(120px, 0.8fr)", "minmax(110px, 0.6fr)", "96px"]}
    rowCount={6}
  />
);

