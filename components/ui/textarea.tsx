import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const textareaVariants = cva(
  "placeholder:text-muted-foreground/75 selection:bg-gold-500/20 selection:text-navy-950 dark:selection:text-gold-300 flex field-sizing-content min-h-20 w-full rounded-md border text-base shadow-xs transition-all duration-200 outline-none focus-visible:border-ring focus-visible:ring-ring/30 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
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
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

function Textarea({
  className,
  variant = "default",
  ...props
}: React.ComponentProps<"textarea"> & VariantProps<typeof textareaVariants>) {
  return (
    <textarea
      data-slot="textarea"
      data-variant={variant}
      className={cn(textareaVariants({ variant }), "px-3 py-2", className)}
      {...props}
    />
  )
}

export { Textarea, textareaVariants }
