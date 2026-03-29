import { JobCardSkeleton } from "@shared/components/skeletons/JobCardSkeleton";

interface JobListSkeletonProps {
  count?: number;
}

export const JobListSkeleton = ({ count = 6 }: JobListSkeletonProps) => (
  <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
    {Array.from({ length: count }, (_, index) => (
      <JobCardSkeleton key={`job-card-skeleton-${index}`} />
    ))}
  </div>
);
