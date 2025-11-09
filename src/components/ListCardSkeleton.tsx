import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

const ListCardSkeleton = () => {
  return (
    <Card className="group glass border-border/50 transition-all duration-300 overflow-hidden rounded-xl sm:rounded-2xl">
      <div className="p-4 sm:p-5">
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex-1 min-w-0">
            <Skeleton className="h-6 w-3/4 mb-2" />
            <Skeleton className="h-4 w-1/2" />
          </div>
          <Skeleton className="h-6 w-1/4" />
        </div>

        <div className="grid grid-cols-2 gap-3 mb-3">
          <div className="glass rounded-lg p-2.5 border border-border/30">
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              <Skeleton className="h-4 w-4" />
              <Skeleton className="h-4 w-1/4" />
            </div>
            <Skeleton className="h-5 w-1/2 mt-1" />
            <Skeleton className="h-1.5 w-full mt-2" />
          </div>
          <div className="glass rounded-lg p-2.5 border border-border/30">
             <div className="flex items-center gap-2 text-muted-foreground mb-1">
              <Skeleton className="h-4 w-4" />
              <Skeleton className="h-4 w-1/4" />
            </div>
            <Skeleton className="h-5 w-1/2 mt-1" />
          </div>
        </div>

        <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-3">
          <Skeleton className="h-4 w-4" />
          <Skeleton className="h-4 w-1/3" />
        </div>

        <div className="flex gap-2 pt-3 border-t border-border/50">
            <Skeleton className="h-9 w-full" />
            <Skeleton className="h-9 w-full" />
        </div>
      </div>
    </Card>
  );
};

export default ListCardSkeleton;
