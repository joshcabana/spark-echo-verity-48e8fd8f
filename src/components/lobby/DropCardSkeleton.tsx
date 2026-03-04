import { Skeleton } from "@/components/ui/skeleton";

const DropCardSkeleton = () => (
  <div className="rounded-2xl border border-border bg-card p-5 space-y-4">
    <div className="flex items-center justify-between">
      <Skeleton className="h-5 w-32" />
      <Skeleton className="h-5 w-16 rounded-full" />
    </div>
    <Skeleton className="h-4 w-3/4" />
    <div className="flex gap-4">
      <Skeleton className="h-4 w-20" />
      <Skeleton className="h-4 w-24" />
      <Skeleton className="h-4 w-16" />
    </div>
    <Skeleton className="h-2 w-full rounded-full" />
    <Skeleton className="h-9 w-full rounded-lg" />
  </div>
);

export default DropCardSkeleton;
