import * as React from "react"
import { cn } from "@/lib/utils"

const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<"input">>(
  ({ className, type, ...props }, ref) => (
    <input
      type={type}
      className={cn(
        "flex h-11 w-full rounded-md border-2 border-border bg-card px-3 py-2 text-sm font-bold text-foreground shadow-[2px_2px_0_rgb(var(--shadow))] outline-none transition placeholder:text-muted-foreground focus-visible:ring-0 disabled:cursor-not-allowed disabled:opacity-50",
        className,
      )}
      ref={ref}
      {...props}
    />
  ),
)
Input.displayName = "Input"
export { Input }
