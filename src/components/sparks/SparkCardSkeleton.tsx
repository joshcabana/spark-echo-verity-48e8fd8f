import { Skeleton } from "@/components/ui/skeleton";

const SparkCardSkeleton = () => (
  <div className="flex items-center gap-3 rounded-2xl border border-border bg-card p-4">
    <Skeleton className="h-10 w-10 rounded-full shrink-0" />
    <div className="flex-1 space-y-2">
      <Skeleton className="h-4 w-28" />
      <Skeleton className="h-3 w-40" />
    </div>
    <Skeleton className="h-3 w-12" />
  </div>
);

export default SparkCardSkeleton;
