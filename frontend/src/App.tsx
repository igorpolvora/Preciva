import { useEffect, useRef, useState } from 'react'
import { Calculator } from './components/Calculator'
import { FeedbackPanel } from './components/FeedbackPanel'
import { Briefcase, Check, ChefHat, Music4, PenTool, SlidersHorizontal, Sparkles, Wrench } from 'lucide-react'
import { ThemeSelector } from './components/ThemeSelector'
import type { LucideIcon } from 'lucide-react'
import { createDraft, createDrafts } from './experience'
import { templates } from './domain/templates'
import type { TemplateId } from './domain/templates'
import { createUsageRecorder } from './usage'
import { ArrowUp, ArrowUpRight, RotateCcw } from 'lucide-react'
import { Button, Card } from './components/ui/primitives'
import type { EventName, UsageEvent } from './usage'
import './App.css'

const activityIcons = {
  music: Music4,
  design: PenTool,
  beauty: Sparkles,
  food: ChefHat,
  professional: Briefcase,
  technical: Wrench,
  custom: SlidersHorizontal,
} satisfies Record<TemplateId, LucideIcon>

function App() {
  const [selected, setSelected] = useState<TemplateId>('music')
  const [drafts, setDrafts] = useState(createDrafts)
  const [revision, setRevision] = useState(0)
  const [resetConfirm, setResetConfirm] = useState(false)
  const [selectionMessage, setSelectionMessage] = useState('')
  const [usage] = useState(createUsageRecorder)
  const [usageEnabled, setUsageEnabled] = useState(false)
  const [events, setEvents] = useState<UsageEvent[]>([])
  const resetButton = useRef<HTMLButtonElement>(null)
  const keepButton = useRef<HTMLButtonElement>(null)
  const template = templates.find(item => item.id === selected)!

  useEffect(() => {
    if (resetConfirm) keepButton.current?.focus()
  }, [resetConfirm])

  function track(name: EventName, segment = selected) {
    usage.record(name, segment)
    setEvents(usage.snapshot())
  }

  function choose(id: TemplateId) {
    if (id === selected) return
    setSelected(id)
    setResetConfirm(false)
    setSelectionMessage(`Modelo ${templates.find(item => item.id === id)!.name} selecionado.`)
    track('template_selected', id)
  }

  function closeReset() {
    setResetConfirm(false)
    resetButton.current?.focus()
  }

  function resetDraft() {
    setDrafts(current => ({ ...current, [selected]: createDraft(selected) }))
    setRevision(value => value + 1)
    track('calculation_reset')
    closeReset()
  }

  return <>
    <a className="skip-link" href="#calculator">Ir para a calculadora</a>
    <header className="topbar">
      <div className="shell topbar-content">
        <a href="#" className="brand" aria-label="Preciva início">
          <span className="brand-mark" aria-hidden="true">p<span>↗</span></span>
          preciva
        </a>
        <ThemeSelector />
        <nav className="header-links" aria-label="Navegação principal">
          <a href="#activity">Calculadora</a>
          <a href="#feedback">Feedback <ArrowUpRight size={14} aria-hidden="true" /></a>
        </nav>
      </div>
    </header>
    <main className="shell">
      <section className="intro" aria-labelledby="page-title">
        <div>
          <h1 id="page-title">Quanto cobrar pelo<br className="intro-break" /> seu trabalho?</h1>
          <p>Monte um preço que cubra seus custos, remunere seu tempo e inclua o lucro que você quer ter.</p>
        </div>
        <p className="intro-privacy"><Check size={16} aria-hidden="true" /> Cálculo no seu navegador, sem cadastro</p>
      </section>

      <Card className="activity" id="activity" tabIndex={-1} aria-labelledby="activity-title">
        <div className="activity-heading">
          <h2 id="activity-title">Escolha sua atividade</h2>
          <p>Cada modelo mantém um rascunho nesta aba.</p>
        </div>
        <div className="template-grid" role="group" aria-label="Modelo profissional">
          {templates.map(item => {
            const Icon = activityIcons[item.id]
            const isSelected = selected === item.id
            return (
              <button
                key={item.id}
                type="button"
                aria-pressed={isSelected}
                className="template"
                onClick={() => choose(item.id)}
              >
                <Icon className="template-icon" size={22} strokeWidth={1.75} aria-hidden="true" />
                <span>{item.name}</span>
                {isSelected && <Check className="selection-check" size={14} strokeWidth={2.25} aria-hidden="true" />}
              </button>
            )
          })}
        </div>
        <p className="sr-only" role="status">{selectionMessage}</p>
      </Card>

      <section id="calculator" tabIndex={-1} className="calculator" aria-labelledby="model-title">
        <div className="calculator-toolbar">
          <div className="model-heading">
            <h2 id="model-title">{template.name}</h2>
            <p>{template.description}</p>
          </div>
          <Button
            variant="text"
            className="reset-button"
            id="reset-button"
            ref={resetButton}
            aria-expanded={resetConfirm}
            aria-controls={resetConfirm ? 'reset-confirmation' : undefined}
            onClick={() => setResetConfirm(true)}
          >
            <RotateCcw size={16} aria-hidden="true" /> Reiniciar modelo
          </Button>
        </div>
        {resetConfirm && (
          <div className="reset-confirmation" id="reset-confirmation" role="group" aria-labelledby="reset-title">
            <h3 id="reset-title">Reiniciar o modelo atual?</h3>
            <p>Os campos desta atividade serão apagados. Os outros rascunhos serão mantidos.</p>
            <div className="feedback-actions">
              <Button ref={keepButton} onClick={closeReset}>Manter rascunho</Button>
              <Button variant="danger" onClick={resetDraft}>Sim, reiniciar</Button>
            </div>
          </div>
        )}
        <Calculator
          key={`${selected}-${revision}`}
          draft={drafts[selected]}
          onChange={draft => setDrafts(current => ({ ...current, [selected]: draft }))}
          onEdit={() => track('calculation_started')}
          onReview={valid => track(valid ? 'calculation_completed' : 'calculation_invalid')}
        />
      </section>

      <FeedbackPanel onPrepared={() => track('feedback_prepared')} onEmail={() => track('feedback_email_requested')} />

      <section className="privacy-section" aria-labelledby="privacy-title">
        <div>
          <h2 id="privacy-title">Privacidade do cálculo</h2>
          <p>Seus valores ficam nesta aba. Ao recarregar, rascunhos, comentários e contagens locais são apagados.</p>
          <p>O Preciva estima preços sem aplicar automaticamente tributos, pisos profissionais, descontos, juros ou parcelamento. Confira as regras da sua atividade.</p>
        </div>
        <div className="usage-choice">
          <label className="checkbox-label">
            <input
              type="checkbox"
              checked={usageEnabled}
              onChange={event => {
                setUsageEnabled(event.target.checked)
                usage.setEnabled(event.target.checked)
                setEvents([])
              }}
            />
            <span>
              Permitir contagem de uso apenas nesta aba
              <small>Opcional. Desmarcar apaga a contagem.</small>
            </span>
          </label>
          <details>
            <summary>O que é contado?</summary>
            <p>Seleção do modelo, edição, conferência, reinício e preparação do feedback. Os eventos não incluem valores, comentários, identidade ou horário e ficam no navegador.</p>
            <p><strong>{events.length} eventos locais</strong> de até 200 registros recentes.</p>
          </details>
        </div>
      </section>
    </main>
    <footer className="footer">
      <div className="shell footer-content">
        <a className="brand" href="#">preciva<span className="brand-dot">.</span></a>
        <a href="#activity">Voltar à calculadora <ArrowUp size={15} aria-hidden="true" /></a>
      </div>
    </footer>
  </>
}

export default App
