import type { ReactNode } from 'react'
import { Card, FormField, Input } from './ui/primitives'

type FieldProps = {
  label: string
  id: string
  value: string
  onChange: (raw: string) => void
  error?: string
  hint?: string
  numeric?: boolean
  className?: string
  maxLength?: number
}

export function Field({ label, id, value, onChange, error, hint, numeric = false, className = '', maxLength }: FieldProps) {
  return (
    <FormField id={id} label={label} className={className} hint={hint} error={error}>
      {attributes => <Input
        {...attributes}
        inputMode={numeric ? 'decimal' : undefined}
        value={value}
        maxLength={maxLength}
        onChange={event => onChange(event.target.value)}
      />}
    </FormField>
  )
}

export function Section({ id, title, description, children }: { id: string; title: string; description: string; children: ReactNode }) {
  return (
    <Card className="form-section" id={id} tabIndex={-1} aria-labelledby={`${id}-title`}>
      <header className="section-heading">
        <h2 id={`${id}-title`}>{title}</h2>
        <p>{description}</p>
      </header>
      {children}
    </Card>
  )
}
