import type { TextareaHTMLAttributes } from 'react'
import { cn } from '../../lib/cn'

export interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  /** Grows with content via CSS `field-sizing`, up to a max height, instead of scrolling internally. */
  autoGrow?: boolean
  /** Shows a live character count against `maxLength`. */
  showCount?: boolean
}

/** Multi-line input. Pair it with `Field` for label, hint and error text. */
export function Textarea({
  className,
  autoGrow = false,
  showCount = false,
  maxLength,
  value,
  onChange,
  ...rest
}: TextareaProps) {
  const length = typeof value === 'string' ? value.length : 0

  return (
    <div className="w-full">
      <textarea
        value={value}
        onChange={onChange}
        maxLength={maxLength}
        className={cn(
          'min-h-20 w-full rounded-md border border-border bg-surface px-3 py-2 text-sm text-text',
          'placeholder:text-text-muted transition-colors duration-150',
          'hover:border-accent/50 focus:border-accent',
          'aria-[invalid=true]:border-danger',
          'disabled:cursor-not-allowed disabled:opacity-50',
          autoGrow && 'max-h-64 resize-none [field-sizing:content]',
          className,
        )}
        {...rest}
      />
      {showCount && maxLength && (
        <p
          className="mt-1 text-right text-xs text-text-muted"
          aria-hidden="true"
        >
          {length}/{maxLength}
        </p>
      )}
    </div>
  )
}
