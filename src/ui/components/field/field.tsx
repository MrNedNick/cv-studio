import { useId, type ReactElement, cloneElement } from 'react'
import { cn } from '../../lib/cn'

export interface FieldProps {
  label?: string
  hint?: string
  /** Replaces the hint and marks the control invalid. */
  error?: string
  required?: boolean
  className?: string
  /** A single form control — it gets id, aria-invalid and aria-describedby. */
  children: ReactElement<{
    id?: string
    'aria-invalid'?: boolean
    'aria-describedby'?: string
    required?: boolean
  }>
}

/**
 * Wires label, hint and error text to a control so screen readers announce
 * them. The control itself stays unaware of any of it.
 */
export function Field({
  label,
  hint,
  error,
  required = false,
  className,
  children,
}: FieldProps) {
  const id = useId()
  const messageId = `${id}-message`
  const message = error ?? hint

  return (
    <div className={cn('flex w-full flex-col gap-1.5', className)}>
      {label && (
        <label
          htmlFor={id}
          className="flex items-center gap-1 text-xs font-semibold text-text-muted"
        >
          {label}
          {required && (
            <span aria-hidden="true" className="text-danger">
              *
            </span>
          )}
        </label>
      )}

      {cloneElement(children, {
        id,
        required,
        'aria-invalid': error ? true : undefined,
        'aria-describedby': message ? messageId : undefined,
      })}

      {message && (
        <p
          id={messageId}
          role={error ? 'alert' : undefined}
          className={cn('text-xs', error ? 'text-danger' : 'text-text-muted')}
        >
          {message}
        </p>
      )}
    </div>
  )
}
