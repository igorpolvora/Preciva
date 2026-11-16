import { useId } from 'react'
import type { ReactNode } from 'react'

export function Field({ label, id, value, onChange, error, hint, numeric = false, className = '', maxLength }: {
  label: string; id: string; value: string; onChange: (raw: string) => void; error?: string; hint: string; numeric?: boolean; className?: string; maxLength?: number
}) {
  const helpId = useId()
  const errorId = useId()
  return <div className={`field ${className}`}>
    <label htmlFor={id}>{label}</label>
    <input id={id} type="text" inputMode={numeric ? 'decimal' : undefined} value={value} maxLength={maxLength}
      aria-invalid={!!error} aria-describedby={`${helpId}${error ? ` ${errorId}` : ''}`} onChange={event => onChange(event.target.value)} />
    <small id={helpId}>{hint}</small>
    {error && <small className="field-error" id={errorId}>Atenção: {error}</small>}
  </div>
}
export function Section({ id, number, title, description, children }: { id: string; number: string; title: string; description: string; children: ReactNode }) {
  return <section className="form-section" id={id} tabIndex={-1} aria-labelledby={`${id}-title`}>
    <header className="section-heading"><span className="step-number" aria-hidden="true">{number}</span><div><h2 id={`${id}-title`}>{title}</h2><p>{description}</p></div></header>
    {children}
  </section>
}


