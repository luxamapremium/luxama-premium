import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { Slot } from "radix-ui"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex shrink-0 items-center justify-center gap-2 rounded-md text-sm font-medium whitespace-nowrap transition-all duration-200 outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/40 disabled:pointer-events-none disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4 active:scale-[0.98]",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-primary-foreground shadow-luxury-sm hover:bg-navy-800 hover:shadow-luxury dark:bg-gold-500 dark:text-navy-950 dark:hover:bg-gold-400 dark:shadow-gold",
        gold:
          "bg-gold-500 text-navy-950 font-semibold shadow-gold hover:bg-gold-400 hover:shadow-gold-lg",
        "gold-outline":
          "border border-gold-500/50 text-gold-600 hover:bg-gold-500/10 hover:border-gold-500 dark:text-gold-400 dark:border-gold-500/40 dark:hover:bg-gold-500/15 shadow-xs",
        navy:
          "bg-navy-900 text-ice-50 hover:bg-navy-800 shadow-luxury-sm hover:shadow-luxury dark:bg-navy-800 dark:text-ice-50 dark:hover:bg-navy-700",
        destructive:
          "bg-destructive text-destructive-foreground shadow-xs hover:bg-destructive/90 focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40",
        outline:
          "border border-border bg-card/60 shadow-xs hover:bg-accent hover:text-accent-foreground hover:border-gold-500/40 dark:bg-card/40 dark:border-border dark:hover:bg-accent/60",
        secondary:
          "bg-secondary text-secondary-foreground shadow-xs hover:bg-secondary/85",
        ghost:
          "hover:bg-accent hover:text-accent-foreground dark:hover:bg-accent/60",
        link: "text-primary underline-offset-4 hover:underline hover:text-gold-600 dark:hover:text-gold-400",
        glass:
          "backdrop-blur-md bg-white/10 dark:bg-navy-950/40 border border-white/20 dark:border-gold-500/20 text-foreground hover:bg-white/20 dark:hover:bg-navy-900/60 shadow-luxury-sm",
      },
      size: {
        default: "h-9 px-4 py-2 has-[>svg]:px-3",
        xs: "h-6 gap-1 rounded-md px-2 text-xs has-[>svg]:px-1.5 [&_svg:not([class*='size-'])]:size-3",
        sm: "h-8 gap-1.5 rounded-md px-3 has-[>svg]:px-2.5",
        lg: "h-10 rounded-md px-6 font-medium tracking-wide has-[>svg]:px-4",
        xl: "h-12 rounded-lg px-8 text-base font-medium tracking-wide has-[>svg]:px-5",
        icon: "size-9",
        "icon-xs": "size-6 rounded-md [&_svg:not([class*='size-'])]:size-3",
        "icon-sm": "size-8",
        "icon-lg": "size-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

function Button({
  className,
  variant = "default",
  size = "default",
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean
  }) {
  const Comp = asChild ? Slot.Root : "button"

  return (
    <Comp
      data-slot="button"
      data-variant={variant}
      data-size={size}
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }
