import type { ComponentProps } from 'react'
import './Badge.css'

type BadgeProps = ComponentProps<'span'> & {
  tone?: 'neutral' | 'accent' | 'solid'
}

export function Badge({ tone = 'neutral', className = '', ...props }: BadgeProps) {
  return <span {...props} className={`badge badge--${tone} ${className}`.trim()} />
}
