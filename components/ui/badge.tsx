import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { Slot } from "radix-ui"

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex w-fit shrink-0 items-center justify-center gap-1.5 overflow-hidden rounded-full border border-transparent px-2.5 py-0.5 text-xs font-medium tracking-wide whitespace-nowrap transition-all focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/40 aria-invalid:border-destructive aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 [&>svg]:pointer-events-none [&>svg]:size-3",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-primary-foreground [a&]:hover:bg-primary/90 shadow-xs",
        secondary:
          "bg-secondary text-secondary-foreground [a&]:hover:bg-secondary/90 shadow-xs",
        gold:
          "bg-gold-500/15 text-gold-700 border-gold-500/30 dark:bg-gold-500/20 dark:text-gold-300 dark:border-gold-500/40 [a&]:hover:bg-gold-500/25",
        navy:
          "bg-navy-900/10 text-navy-900 border-navy-900/20 dark:bg-navy-800 dark:text-ice-100 dark:border-navy-700/60 [a&]:hover:bg-navy-900/20",
        "gold-solid":
          "bg-gold-500 text-navy-950 font-semibold shadow-gold [a&]:hover:bg-gold-400",
        destructive:
          "bg-destructive/15 text-destructive border-destructive/25 dark:bg-destructive/20 dark:text-red-400 focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40 [a&]:hover:bg-destructive/25",
        outline:
          "border-border text-foreground [a&]:hover:bg-accent [a&]:hover:text-accent-foreground hover:border-gold-500/40",
        ghost: "[a&]:hover:bg-accent [a&]:hover:text-accent-foreground",
        link: "text-primary underline-offset-4 [a&]:hover:underline hover:text-gold-600 dark:hover:text-gold-400",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

function Badge({
  className,
  variant = "default",
  asChild = false,
  ...props
}: React.ComponentProps<"span"> &
  VariantProps<typeof badgeVariants> & { asChild?: boolean }) {
  const Comp = asChild ? Slot.Root : "span"

  return (
    <Comp
      data-slot="badge"
      data-variant={variant}
      className={cn(badgeVariants({ variant }), className)}
      {...props}
    />
  )
}

export { Badge, badgeVariants }
