import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const alertVariants = cva(
  "relative w-full rounded-xl border px-4 py-3.5 text-sm grid has-[>svg]:grid-cols-[calc(var(--spacing)*4)_1fr] grid-cols-[0_1fr] has-[>svg]:gap-x-3 gap-y-1 items-start [&>svg]:size-4 [&>svg]:translate-y-0.5 [&>svg]:text-current transition-all",
  {
    variants: {
      variant: {
        default: "bg-card text-card-foreground border-border/80 shadow-luxury-sm",
        destructive:
          "text-destructive bg-destructive/5 border-destructive/30 [&>svg]:text-destructive *:data-[slot=alert-description]:text-destructive/90",
        gold: "text-gold-700 dark:text-gold-300 bg-gold-500/10 border-gold-500/30 [&>svg]:text-gold-600 dark:[&>svg]:text-gold-400 shadow-luxury-sm",
        navy: "text-ice-50 bg-navy-900 border-navy-700 [&>svg]:text-gold-400 shadow-luxury",
        success:
          "text-emerald-700 dark:text-emerald-400 bg-emerald-500/10 border-emerald-500/30 [&>svg]:text-emerald-600 dark:[&>svg]:text-emerald-400",
        info: "text-navy-900 dark:text-ice-100 bg-ice-100/80 dark:bg-navy-800/80 border-border/80 [&>svg]:text-navy-700 dark:[&>svg]:text-gold-400",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

function Alert({
  className,
  variant,
  ...props
}: React.ComponentProps<"div"> & VariantProps<typeof alertVariants>) {
  return (
    <div
      data-slot="alert"
      role="alert"
      className={cn(alertVariants({ variant }), className)}
      {...props}
    />
  )
}

function AlertTitle({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="alert-title"
      className={cn(
        "col-start-2 line-clamp-1 min-h-4 font-serif font-bold text-base tracking-tight text-navy-900 dark:text-ice-50",
        className
      )}
      {...props}
    />
  )
}

function AlertDescription({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="alert-description"
      className={cn(
        "text-muted-foreground col-start-2 grid justify-items-start gap-1 text-sm [&_p]:leading-relaxed",
        className
      )}
      {...props}
    />
  )
}

export { Alert, AlertTitle, AlertDescription }
