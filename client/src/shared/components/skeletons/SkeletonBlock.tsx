import Skeleton from "react-loading-skeleton";
import { cn } from "@shared/utils/cn";

interface SkeletonBlockProps {
  className?: string;
}

export const SkeletonBlock = ({ className }: SkeletonBlockProps) => (
  <Skeleton
    className={cn("leading-none", className)}
    containerClassName={cn("block leading-none", className)}
  />
);
