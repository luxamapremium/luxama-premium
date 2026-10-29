import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const inputVariants = cva(
  "file:text-foreground placeholder:text-muted-foreground/75 selection:bg-gold-500/20 selection:text-navy-950 dark:selection:text-gold-300 w-full min-w-0 rounded-md border text-base shadow-xs transition-all duration-200 outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm focus-visible:border-ring focus-visible:ring-ring/30 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
  {
    variants: {
      variant: {
        default:
          "border-input bg-card/60 hover:bg-card focus:bg-card dark:bg-navy-900/40 dark:hover:bg-navy-900/60 dark:focus:bg-navy-900/90 hover:border-gold-500/40",
        filled:
          "border-transparent bg-muted/70 hover:bg-muted focus:bg-card dark:bg-navy-800/60 dark:hover:bg-navy-800 dark:focus:bg-navy-900 hover:border-border",
        gold:
          "border-gold-500/40 bg-card/70 hover:border-gold-500 focus-visible:ring-gold-500/25",
      },
      size: {
        default: "h-9 px-3 py-1",
        sm: "h-8 px-2.5 py-1 text-xs",
        lg: "h-11 px-4 py-2 text-base",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

function Input({
  className,
  type,
  variant = "default",
  size = "default",
  ...props
}: Omit<React.ComponentProps<"input">, "size"> &
  VariantProps<typeof inputVariants>) {
  return (
    <input
      type={type}
      data-slot="input"
      data-variant={variant}
      data-size={size}
      className={cn(inputVariants({ variant, size }), className)}
      {...props}
    />
  )
}

export { Input, inputVariants }
