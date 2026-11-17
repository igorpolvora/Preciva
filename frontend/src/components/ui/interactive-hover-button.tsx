import { forwardRef } from 'react'
import type { ButtonHTMLAttributes } from 'react'
import { ArrowRight } from 'lucide-react'
import { cn } from '@/lib/utils'

interface InteractiveHoverButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  text?: string
}

const InteractiveHoverButton = forwardRef<HTMLButtonElement, InteractiveHoverButtonProps>(
  ({ text = 'Button', type = 'button', className, ...props }, ref) => (
    <button
      {...props}
      ref={ref}
      type={type}
      className={cn(
        'group relative isolate inline-grid min-h-11 min-w-32 items-center overflow-hidden rounded-full border border-solid border-border bg-background px-4 py-2 text-center text-sm font-semibold text-foreground disabled:cursor-not-allowed',
        className,
      )}
    >
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10 origin-left scale-x-0 rounded-full bg-primary transition-transform duration-300 group-enabled:group-hover:scale-x-100 group-focus-visible:scale-x-100 motion-reduce:transition-none"
      />
      <span className="relative flex items-center justify-center gap-2 transition-colors duration-300 group-enabled:group-hover:text-primary-foreground group-focus-visible:text-primary-foreground motion-reduce:transition-none">
        <span
          aria-hidden="true"
          className="size-2 shrink-0 rounded-full bg-primary transition-colors duration-300 group-enabled:group-hover:bg-primary-foreground group-focus-visible:bg-primary-foreground motion-reduce:transition-none"
        />
        {text}
        <ArrowRight
          aria-hidden="true"
          className="size-4 shrink-0 transition-transform duration-300 group-enabled:group-hover:translate-x-0.5 group-focus-visible:translate-x-0.5 motion-reduce:transition-none"
        />
      </span>
    </button>
  ),
)

InteractiveHoverButton.displayName = 'InteractiveHoverButton'

export { InteractiveHoverButton }
