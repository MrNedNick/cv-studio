import type { InputHTMLAttributes, ReactNode } from 'react'
import { cn } from '../../lib/cn'

export interface SwitchProps extends Omit<
  InputHTMLAttributes<HTMLInputElement>,
  'type' | 'size'
> {
  label?: ReactNode
}

/**
 * Renders as a real checkbox input (keyboard and screen-reader behaviour for
 * free) with `role="switch"` and track/thumb styling on top of it. The thumb
 * position is driven by `peer-checked`, not layout, so toggling never
 * reflows.
 */
export function Switch({
  className,
  label,
  id,
  disabled,
  ...rest
}: SwitchProps) {
  return (
    <label
      htmlFor={id}
      className={cn(
        'inline-flex cursor-pointer items-center gap-2 text-sm text-text',
        disabled && 'cursor-not-allowed opacity-50',
      )}
    >
      <span className="relative inline-flex h-6 w-10 shrink-0 items-center">
        <input
          id={id}
          type="checkbox"
          role="switch"
          disabled={disabled}
          className={cn('peer sr-only', className)}
          {...rest}
        />
        <span
          aria-hidden="true"
          className={cn(
            'absolute inset-0 rounded-full bg-border transition-colors duration-150',
            'peer-checked:bg-accent',
            'peer-focus-visible:ring-2 peer-focus-visible:ring-accent/50 peer-focus-visible:outline-none',
          )}
        />
        <span
          aria-hidden="true"
          className={cn(
            'relative size-4 translate-x-1 rounded-full bg-white shadow-sm transition-transform duration-150',
            'peer-checked:translate-x-5',
          )}
        />
      </span>
      {label}
    </label>
  )
}
