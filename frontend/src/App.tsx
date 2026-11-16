import { useState } from 'react'
import { Calculator } from './components/Calculator'
import { FeedbackPanel } from './components/FeedbackPanel'
import { createDrafts, createDraft } from './experience'
import type { TemplateId } from './domain/templates'
import { templates } from './domain/templates'
import { createUsageRecorder } from './usage'
import type { EventName, UsageEvent } from './usage'
import './App.css'

function App() {
  const [selected, setSelected] = useState<TemplateId>('music')
  const [drafts, setDrafts] = useState(createDrafts)
  const [revision, setRevision] = useState(0)
  const [resetConfirm, setResetConfirm] = useState(false)
  const [selectionMessage, setSelectionMessage] = useState('')
  const [usage] = useState(createUsageRecorder)
  const [usageEnabled, setUsageEnabled] = useState(false)
  const [events, setEvents] = useState<UsageEvent[]>([])
  function track(name: EventName, segment = selected) {
    usage.record(name, segment)
    setEvents(usage.snapshot())
  }
  function choose(id: TemplateId) {
    if (id === selected) return
    setSelected(id)
    setResetConfirm(false)
    setSelectionMessage(`Modelo ${templates.find(template => template.id === id)!.name} selecionado. Seu rascunho nesta atividade está disponível.`)
    track('template_selected', id)
  }
  return <>
    <a className="skip-link" href="#calculator">Ir para a calculadora</a>
    <header className="topbar"><a href="#" className="brand" aria-label="Preciva início"><span className="brand-mark" aria-hidden="true">p<span>↗</span></span>preciva<span className="beta">BETA</span></a><a href="#feedback" className="header-feedback">Deixe sua opinião <span aria-hidden="true">↗</span></a></header>
    <main>
      <section className="intro" aria-labelledby="page-title"><div><span className="eyebrow">PRECIFICAÇÃO PARA AUTÔNOMOS</span><h1 id="page-title">Seu trabalho tem valor.<br /><span>Encontre o seu preço.</span></h1><p>Coloque seus custos e seu tempo na conta.<br />Entenda quanto cobrar e o que sobra para você.</p><div className="trust-row"><span>✓ Sem cadastro</span><span>✓ Cálculo transparente</span><span>✓ Seus dados ficam aqui</span></div></div><div className="intro-note"><span aria-hidden="true">↗</span><p><strong>Menos achismo.<br />Mais clareza.</strong>Do primeiro custo ao lucro, cada parte da conta tem uma explicação.</p></div></section>
      <section className="activity" aria-labelledby="activity-title"><div className="activity-heading"><div><span className="eyebrow">COMECE PELA SUA ATIVIDADE</span><h2 id="activity-title">Uma calculadora. O seu jeito de trabalhar.</h2><p>Escolha um modelo e adapte os itens à sua realidade.</p></div><span className="privacy-pill">◉ Cálculo no navegador</span></div>
        <div className="template-grid" role="group" aria-label="Modelo profissional">{templates.map(template => <button key={template.id} type="button" aria-pressed={selected === template.id} className={`template ${selected === template.id ? 'selected' : ''}`} onClick={() => choose(template.id)}><span className="template-icon" aria-hidden="true">{template.icon}</span><span>{template.name}</span><span className="selection-check" aria-hidden="true">{selected === template.id ? '✓' : ''}</span></button>)}</div>
        <p className="switch-note">Pode explorar: seus rascunhos ficam separados por atividade até você recarregar esta página. O modelo personalizado também pode ser totalmente editado.</p><p className="sr-only" role="status">{selectionMessage}</p>
      </section>
      <div id="calculator" tabIndex={-1} className="calculator"><div className="calculator-toolbar"><span className="eyebrow">MONTE SEU PREÇO EM 3 PASSOS</span><button type="button" className="text-button" id="reset-button" onClick={() => setResetConfirm(true)}>Reiniciar este modelo ↺</button></div>
        {resetConfirm && <div className="reset-confirmation" role="group" aria-labelledby="reset-title"><div><h2 id="reset-title">Reiniciar o modelo atual?</h2><p>Os campos desta atividade serão apagados. Os outros rascunhos serão mantidos.</p></div><div className="feedback-actions"><button type="button" className="secondary-button" onClick={() => { setResetConfirm(false); document.getElementById('reset-button')?.focus() }}>Manter rascunho</button><button type="button" className="danger-button" onClick={() => { setDrafts(current => ({ ...current, [selected]: createDraft(selected) })); setRevision(value => value + 1); setResetConfirm(false); track('calculation_reset'); document.getElementById('reset-button')?.focus() }}>Sim, reiniciar</button></div></div>}
        <Calculator key={`${selected}-${revision}`} templateId={selected} draft={drafts[selected]} onChange={draft => setDrafts(current => ({ ...current, [selected]: draft }))} onEdit={() => track('calculation_started')} onReview={valid => track(valid ? 'calculation_completed' : 'calculation_invalid')} />
      </div>
      <FeedbackPanel onPrepared={() => track('feedback_prepared')} onEmail={() => track('feedback_email_requested')} />
      <section className="privacy-section" aria-labelledby="privacy-title"><div><h2 id="privacy-title">Seus números ficam com você.</h2><p>Sem envio dos campos, cookies de rastreamento ou armazenamento persistente. Recarregar a página apaga rascunhos, comentários e contagens locais. O feedback só sai do navegador por uma ação sua.</p><p>Esta ferramenta estima preços; não presume tributos, pisos profissionais, descontos, juros ou parcelamento e não substitui orientação contábil.</p></div><div className="usage-choice"><label className="checkbox-label"><input type="checkbox" checked={usageEnabled} onChange={event => { setUsageEnabled(event.target.checked); usage.setEnabled(event.target.checked); setEvents([]) }} /><span>Permitir contagem de uso apenas nesta aba <small>Opcional. Sem valores financeiros ou texto livre. Nada é transmitido. Desmarcar apaga as contagens.</small></span></label><details><summary>O que é contado?</summary><p>Seleção do modelo, início de edição, conferência válida ou inválida, reinício e preparação do feedback. Não registramos nomes de itens, valores, comentários, identidade ou horário.</p><p><strong>{events.length} eventos locais</strong> nesta página. A contagem só começa depois da sua permissão e guarda no máximo os 200 eventos mais recentes.</p></details></div></section>
    </main>
    <footer><a className="brand" href="#">preciva<span className="brand-dot">.</span></a><span>Mais clareza no preço. Mais confiança no trabalho.</span><span>Feito para autônomos brasileiros.</span></footer>
  </>
}
export default App
