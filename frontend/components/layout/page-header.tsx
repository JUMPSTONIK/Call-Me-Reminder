import { cn } from "@/lib/utils";

interface PageHeaderProps {
  title: string;
  description?: string;
  className?: string;
}

export function PageHeader({ title, description, className }: PageHeaderProps) {
  return (
    <div
      className={cn(
        "flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between",
        "animate-in fade-in-50 slide-in-from-top-4 duration-500",
        className,
      )}
    >
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-foreground bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text">
          {title}
        </h1>
        {description && (
          <p className="mt-1 text-sm sm:text-base text-muted-foreground animate-in fade-in-50 duration-500 delay-150">
            {description}
          </p>
        )}
      </div>
    </div>
  );
}
