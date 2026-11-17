import { createElement } from 'react'
import type { ComponentProps, ComponentPropsWithoutRef, ReactNode } from 'react'
import { ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'

type ButtonVariant = 'primary' | 'secondary' | 'text' | 'add' | 'remove' | 'danger'

export function Button({ variant = 'secondary', type = 'button', className, ...props }:
  ComponentProps<'button'> & { variant?: ButtonVariant }) {
  return <button type={type} className={cn('button', `${variant}-button`, className)} {...props} />
}

export function Input({ className, type = 'text', ...props }: ComponentProps<'input'>) {
  return <input type={type} className={cn('control', className)} {...props} />
}

/** The native element handles keyboard interaction and the mobile option picker. */
export function Select({ className, ...props }: Omit<ComponentProps<'select'>, 'multiple' | 'size'>) {
  return <span className="select-control">
    <select className={cn('control', className)} {...props} />
    <ChevronDown className="select-chevron" size={16} aria-hidden="true" />
  </span>
}

export function Card<T extends 'section' | 'form' = 'section'>({ as, className, ...props }:
  { as?: T } & ComponentPropsWithoutRef<T>) {
  return createElement(as ?? 'section', { ...props, className: cn('card', className) })
}

type FieldAttributes = { id: string; 'aria-invalid'?: boolean; 'aria-describedby'?: string }

type FormFieldProps = {
  id: string
  label: ReactNode
  hint?: ReactNode
  error?: string
  announceError?: boolean
  describedBy?: string
  className?: string
  children: (attributes: FieldAttributes) => ReactNode
}

export function FormField({ id, label, hint, error, announceError, describedBy, className, children }: FormFieldProps) {
  const errorId = `${id}-error`
  const hintId = `${id}-hint`
  const description = [error && errorId, hint && hintId, describedBy].filter(Boolean).join(' ') || undefined
  return <div className={cn('field', className)}>
    <label htmlFor={id}>{label}</label>
    {children({ id, 'aria-invalid': error ? true : undefined, 'aria-describedby': description })}
    {error && <small className="field-error" id={errorId} role={announceError ? 'alert' : undefined}>{error}</small>}
    {hint && <small id={hintId}>{hint}</small>}
  </div>
}
