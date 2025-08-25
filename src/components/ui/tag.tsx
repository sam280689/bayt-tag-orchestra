import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { X } from "lucide-react"
import { cn } from "@/lib/utils"

const tagVariants = cva(
  "inline-flex items-center gap-1.5 px-2.5 py-1 text-sm font-medium rounded-md border transition-colors duration-fast focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default: "bg-tag text-tag-foreground border-border hover:bg-tag-hover",
        selected: "bg-tag-selected text-tag-selected-foreground border-tag-selected-foreground/20",
        team: "bg-tag-team text-tag-team-foreground border-tag-team-foreground/20",
        personal: "bg-tag-personal text-tag-personal-foreground border-tag-personal-foreground/20",
        success: "bg-success-light text-success border-success/20",
        warning: "bg-warning-light text-warning border-warning/20",
      },
      size: {
        sm: "px-2 py-0.5 text-xs",
        default: "px-2.5 py-1 text-sm",
        lg: "px-3 py-1.5 text-base",
      }
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface TagProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof tagVariants> {
  removable?: boolean
  onRemove?: () => void
  disabled?: boolean
}

const Tag = React.forwardRef<HTMLDivElement, TagProps>(
  ({ className, variant, size, removable = false, onRemove, disabled = false, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          tagVariants({ variant, size }),
          disabled && "opacity-50 cursor-not-allowed",
          className
        )}
        role="button"
        tabIndex={disabled ? -1 : 0}
        aria-disabled={disabled}
        {...props}
      >
        <span className="truncate">{children}</span>
        {removable && !disabled && (
          <button
            onClick={(e) => {
              e.stopPropagation()
              onRemove?.()
            }}
            className="ml-1 rounded-sm opacity-70 hover:opacity-100 focus:opacity-100 focus:outline-none focus:ring-1 focus:ring-ring min-w-[20px] min-h-[20px] flex items-center justify-center"
            aria-label={`Remove ${children} tag`}
            type="button"
          >
            <X className="h-3 w-3" />
          </button>
        )}
      </div>
    )
  }
)

Tag.displayName = "Tag"

export { Tag, tagVariants }