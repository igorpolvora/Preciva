import { useEffect } from 'react'
import type { Draft } from '../experience'
import type { Issue } from '../domain/pricing'
import { steps, stepIsComplete, visibleStep } from '../ux'
import type { Step } from '../ux'

export function StepNavigation({ active, onSelect, draft, issues }: { active: Step; onSelect: (step: Step) => void; draft: Draft; issues: Issue[] }) {
  useEffect(() => {
    let frame = 0
    const update = () => {
      cancelAnimationFrame(frame)
      frame = requestAnimationFrame(() => onSelect(visibleStep(steps.map(step => ({ id: step.id, top: document.getElementById(step.id)?.getBoundingClientRect().top ?? Infinity })))))
    }
    window.addEventListener('scroll', update, { passive: true })
    window.addEventListener('resize', update)
    return () => {
      cancelAnimationFrame(frame)
      window.removeEventListener('scroll', update)
      window.removeEventListener('resize', update)
    }
  }, [onSelect])
  return <nav className="step-nav" aria-label="Etapas da calculadora">
    {steps.map((step, i) => {
      const complete = stepIsComplete(draft, step.id, issues)
      const current = active === step.id
      return <a key={step.id} href={`#${step.id}`} aria-current={current ? 'step' : undefined} className={`${current ? 'active' : ''} ${complete ? 'complete' : ''}`} onClick={() => onSelect(step.id)}>
        <b aria-hidden="true">{complete ? '✓' : i + 1}</b><span className="step-label">{step.label}<small>{current ? 'Atual' : ''}{current && complete ? ' · ' : ''}{complete ? 'Concluída' : !current ? 'A revisar' : ''}</small></span>
      </a>
    })}
  </nav>
}
