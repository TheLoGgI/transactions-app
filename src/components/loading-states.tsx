import { Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader } from "./ui/card";
import { Skeleton } from "./ui/skeleton";

interface LoadingStateProps {
  title?: string;
  description?: string;
  height?: string;
  showSkeleton?: boolean;
}

export function LoadingState({ 
  title = "Loading...", 
  description, 
  height = "h-[400px]",
  showSkeleton = false 
}: LoadingStateProps) {
  if (showSkeleton) {
    return (
      <Card>
        <CardHeader className="space-y-2">
          <Skeleton className="h-6 w-1/3" />
          <Skeleton className="h-4 w-2/3" />
        </CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-8 w-full" />
          <Skeleton className="h-8 w-full" />
          <Skeleton className="h-8 w-full" />
          <Skeleton className="h-8 w-full" />
          <Skeleton className="h-8 w-full" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent>
        <div className={`flex ${height} items-center justify-center`}>
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <div className="text-center space-y-1">
              <p className="text-sm font-medium">{title}</p>
              {description && (
                <p className="text-xs text-muted-foreground">{description}</p>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

interface EmptyStateProps {
  title?: string;
  description?: string;
  height?: string;
}

export function EmptyState({ 
  title = "No data available", 
  description = "No data found for the selected period",
  height = "h-[300px]"
}: EmptyStateProps) {
  return (
    <div className={`flex ${height} items-center justify-center`}>
      <div className="text-center space-y-2">
        <p className="text-sm font-medium text-muted-foreground">{title}</p>
        <p className="text-xs text-muted-foreground">{description}</p>
      </div>
    </div>
  );
}
