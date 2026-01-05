import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

export function ReminderCardSkeleton() {
  return (
    <Card>
      <CardContent className="p-6">
        {/* Header skeleton */}
        <div className="flex items-start gap-3 mb-3">
          <Skeleton className="w-10 h-10 rounded-lg" />
          <div className="flex-1">
            <Skeleton className="h-6 w-3/4 mb-2" />
            <Skeleton className="h-4 w-1/2" />
          </div>
          <Skeleton className="h-6 w-20 rounded-full" />
        </div>

        {/* Details skeleton */}
        <div className="ml-13 space-y-2 mb-4">
          <Skeleton className="h-4 w-2/3" />
          <Skeleton className="h-4 w-1/2" />
        </div>

        {/* Message skeleton */}
        <div className="ml-13 p-3 bg-muted rounded-lg mb-4">
          <Skeleton className="h-3 w-full mb-2" />
          <Skeleton className="h-3 w-4/5" />
        </div>

        {/* Actions skeleton */}
        <div className="flex gap-2 ml-13">
          <Skeleton className="h-8 w-16" />
          <Skeleton className="h-8 w-20" />
        </div>
      </CardContent>
    </Card>
  )
}

export function ReminderListSkeleton() {
  return (
    <div className="space-y-4">
      {[1, 2, 3].map((i) => (
        <ReminderCardSkeleton key={i} />
      ))}
    </div>
  )
}
