import { cn } from "@/lib/utils"

function Skeleton({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="skeleton"
      className={cn("bg-muted/70 dark:bg-navy-800/70 animate-pulse rounded-lg", className)}
      {...props}
    />
  )
}

export { Skeleton }
