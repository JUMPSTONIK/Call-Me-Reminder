import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function ReminderCardSkeleton() {
  return (
    <Card className="animate-in fade-in-50 duration-300">
      <CardContent className="p-4 sm:p-6">
        <div className="flex items-start gap-3 mb-3">
          <Skeleton className="w-10 h-10 rounded-lg animate-pulse" />
          <div className="flex-1">
            <Skeleton
              className="h-6 w-3/4 mb-2 animate-pulse"
              style={{ animationDelay: "75ms" }}
            />
            <Skeleton
              className="h-4 w-1/2 animate-pulse"
              style={{ animationDelay: "150ms" }}
            />
          </div>
          <Skeleton
            className="h-6 w-20 rounded-full animate-pulse"
            style={{ animationDelay: "225ms" }}
          />
        </div>

        <div className="ml-13 space-y-2 mb-4">
          <Skeleton
            className="h-4 w-2/3 animate-pulse"
            style={{ animationDelay: "300ms" }}
          />
          <Skeleton
            className="h-4 w-1/2 animate-pulse"
            style={{ animationDelay: "375ms" }}
          />
        </div>

        <div className="ml-13 p-3 bg-muted rounded-lg mb-4">
          <Skeleton
            className="h-3 w-full mb-2 animate-pulse"
            style={{ animationDelay: "450ms" }}
          />
          <Skeleton
            className="h-3 w-4/5 animate-pulse"
            style={{ animationDelay: "525ms" }}
          />
        </div>

        <div className="flex gap-2 ml-13">
          <Skeleton
            className="h-8 w-16 animate-pulse"
            style={{ animationDelay: "600ms" }}
          />
          <Skeleton
            className="h-8 w-20 animate-pulse"
            style={{ animationDelay: "675ms" }}
          />
        </div>
      </CardContent>
    </Card>
  );
}

export function ReminderListSkeleton() {
  return (
    <div className="space-y-4">
      {[1, 2, 3].map((i) => (
        <div
          key={i}
          className="animate-in fade-in-50 slide-in-from-bottom-4 duration-500"
          style={{ animationDelay: `${i * 150}ms` }}
        >
          <ReminderCardSkeleton />
        </div>
      ))}
    </div>
  );
}
