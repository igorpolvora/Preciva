import { useEffect, useRef } from 'react'
import type { Draft } from '../experience'
import { ArrowDown, Check } from 'lucide-react'
import { Badge } from './ui/Badge'
import type { Issue } from '../domain/pricing'
import { steps, stepIsComplete, visibleStep } from '../ux'
import type { Step } from '../ux'
import './StepNavigation.css'

type Props = {
  active: Step
  onSelect: (step: Step) => void
  draft: Draft
  issues: Issue[]
  resultSummary?: string
}

export function StepNavigation({ active, onSelect, draft, issues, resultSummary }: Props) {
  const navRef = useRef<HTMLElement>(null)

  useEffect(() => {
    const nav = navRef.current
    const editor = nav?.parentElement
    if (!nav || !editor) return

    let frame = 0
    const update = () => {
      const bounds = nav.getBoundingClientRect()
      const stickyTop = Number.parseFloat(getComputedStyle(nav).top) || 0
      const offset = bounds.height + stickyTop + 16
      editor.style.setProperty('--jump-offset', `${offset}px`)

      const positions = steps.map(({ id }) => ({
        id,
        top: document.getElementById(id)?.getBoundingClientRect().top ?? Infinity,
      }))
      onSelect(visibleStep(positions, offset))
    }
    const scheduleUpdate = () => {
      cancelAnimationFrame(frame)
      frame = requestAnimationFrame(update)
    }

    const observer = new ResizeObserver(scheduleUpdate)
    observer.observe(nav)
    scheduleUpdate()
    window.addEventListener('scroll', scheduleUpdate, { passive: true })
    window.addEventListener('resize', scheduleUpdate)
    return () => {
      observer.disconnect()
      cancelAnimationFrame(frame)
      window.removeEventListener('scroll', scheduleUpdate)
      window.removeEventListener('resize', scheduleUpdate)
      editor.style.removeProperty('--jump-offset')
    }
  }, [onSelect])

  return (
    <nav ref={navRef} className="step-nav" aria-label="Etapas da calculadora">
      <ol className="step-track" role="list">
        {steps.map((step, index) => {
          const complete = stepIsComplete(draft, step.id, issues)
          const current = active === step.id
          return (
            <li key={step.id}>
              <a
                href={`#${step.id}`}
                aria-current={current ? 'step' : undefined}
                className="step-link"
                onClick={() => onSelect(step.id)}
              >
                <Badge className="step-marker" tone={current ? 'solid' : complete ? 'accent' : 'neutral'} aria-hidden="true">
                  {complete ? <Check size={14} strokeWidth={2.5} /> : index + 1}
                </Badge>
                <span className="step-label">
                  {step.label}
                  <small>{complete ? 'Concluída' : current ? 'Em edição' : 'A revisar'}</small>
                </span>
              </a>
            </li>
          )
        })}
      </ol>
      {resultSummary && (
        <div className="mobile-result">
          <a className="mobile-result-link" href="#result">
            <span>
              <span className="mobile-result-label">Preço estimado</span>
              <strong className="mobile-result-value">{resultSummary}</strong>
            </span>
            <span className="mobile-result-action">Ver resultado <ArrowDown size={14} aria-hidden="true" /></span>
          </a>
        </div>
      )}
    </nav>
  )
}
