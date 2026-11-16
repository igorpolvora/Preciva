import { useLayoutEffect, useRef, useState } from 'react'
import { calculate } from '../domain/pricing'
import type { Cost, Fee, FeeBase, IndirectCost, PricingInput } from '../domain/pricing'
import type { TemplateId } from '../domain/templates'
import { templates } from '../domain/templates'
import type { Draft } from '../experience'
import { editDraft, parseDecimal, feeBases } from '../experience'
import { Field, Section } from './Fields'
import { ResultPanel } from './ResultPanel'
import { StepNavigation } from './StepNavigation'
import { confirmStep, resultPresentation, stepIsComplete, stepIsValid, steps } from '../ux'
import type { Step } from '../ux'

type Props = { templateId: TemplateId; draft: Draft; onChange: (draft: Draft) => void; onEdit: () => void; onReview: (valid: boolean) => void }
export function Calculator({ templateId, draft, onChange, onEdit, onReview }: Props) {
  const [attempted, setAttempted] = useState(false)
  const [activeStep, setActiveStep] = useState<Step>('costs')
  const input = draft.input
  const pendingFocus = useRef<string | null>(null)
  useLayoutEffect(() => {
    if (pendingFocus.current) {
      document.getElementById(pendingFocus.current)?.focus()
      pendingFocus.current = null
    }
  }, [input])
  const result = calculate(input)
  const issues = result.ok ? [] : result.issues
  function reviewButton(step: Step) {
    const complete = stepIsComplete(draft, step, issues)
    return <div className="step-review"><button type="button" className="secondary-button" disabled={!stepIsValid(step, issues)} onClick={() => onChange(confirmStep(draft, step, issues))}>{complete ? '✓ Etapa concluída' : 'Marcar etapa como revisada'}</button><small>{complete ? 'Dados válidos e revisão confirmada.' : 'Confira os dados desta etapa. Corrija eventuais erros antes de concluir.'}</small></div>
  }
  const template = templates.find(item => item.id === templateId)!
  const error = (path: string) => result.ok ? undefined : result.issues.find(issue => issue.path === path)?.message
  function change(next: PricingInput, rawKey?: string, raw?: string) {
    onChange(editDraft(draft, next, rawKey, raw))
    setAttempted(false)
    onEdit()
  }
  function numeric(label: string, value: number, path: string, rawKey: string, hint: string, apply: (value: number) => PricingInput) {
    return <Field key={rawKey} label={label} id={path} value={draft.raw[rawKey] ?? (Number.isFinite(value) ? String(value).replace('.', ',') : '')}
      numeric error={error(path)} hint={hint} onChange={raw => change(apply(parseDecimal(raw)), rawKey, raw)} />
  }
  const updateCost = (group: 'direct' | 'indirect', index: number, patch: Partial<IndirectCost>): PricingInput => ({ ...input, [group]: input[group].map((cost, i) => i === index ? { ...cost, ...patch } : cost) })
  const updateFee = (index: number, patch: Partial<Fee>): PricingInput => ({ ...input, fees: input.fees.map((fee, i) => i === index ? { ...fee, ...patch } : fee) })
  function addCost(group: 'direct' | 'indirect') {
    const cost: Cost = { id: crypto.randomUUID(), name: 'Novo custo', quantity: 1, unitPrice: 0 }
    pendingFocus.current = `${group}.${input[group].length}.name`
    change(group === 'direct' ? { ...input, direct: [...input.direct, cost] } : { ...input, indirect: [...input.indirect, { ...cost, allocation: 'Parcela por trabalho' }] })
  }
  return <>
    <div className="model-heading"><div><span className="eyebrow">MODELO ATUAL</span><h2>{template.name}</h2><p>{template.description}</p></div><a className="result-jump" href="#result">Ver preço e composição ↓</a></div>
    <StepNavigation active={activeStep} onSelect={setActiveStep} draft={draft} issues={issues} />
    <div className="workspace">
      <form className="editor" noValidate onFocusCapture={event => { const id = (event.target as HTMLElement).closest('.form-section')?.id; if (steps.some(step => step.id === id)) setActiveStep(id as Step) }} onSubmit={event => {
        event.preventDefault()
        const valid = resultPresentation(result, draft.zeroConfirmed) === 'ready'
        setAttempted(true)
        onReview(valid)
        document.getElementById('result')?.focus()
      }}>
        <Section id="costs" number="01" title="O que você gasta?" description="Separe os gastos deste trabalho da parcela das despesas do seu negócio.">
          {(['direct', 'indirect'] as const).map(group => <div className="cost-group" key={group}>
            <h3>{group === 'direct' ? 'Custos diretos' : 'Despesas indiretas'}</h3>
            <p className="help-text">{group === 'direct' ? 'Materiais, insumos, transporte ou equipe usados neste trabalho.' : 'Uma parte do aluguel, software ou energia. Exemplo: R$ 600 por mês ÷ 10 trabalhos = R$ 60 para cada trabalho.'}</p>
            {!input[group].length && <p className="empty-state">Nenhum item. Se houver gastos nesta categoria, adicione abaixo.</p>}
            {input[group].map((cost, i) => <fieldset className="line-item" key={cost.id}><legend>{group === 'direct' ? 'Custo direto' : 'Despesa indireta'} {i + 1}</legend>
              <div className="cost-row">
                <Field className="name-field" label="Descrição" id={`${group}.${i}.name`} value={cost.name} maxLength={120} error={error(`${group}.${i}.name`)} hint="Dê um nome que ajude você a reconhecer este gasto." onChange={name => change(updateCost(group, i, { name }))} />
                {numeric('Quantidade', cost.quantity, `${group}.${i}.quantity`, `${group}-${cost.id}-quantity`, 'Unidades usadas; até 3 casas decimais.', quantity => updateCost(group, i, { quantity }))}
                {numeric('Valor unitário (R$)', cost.unitPrice, `${group}.${i}.unitPrice`, `${group}-${cost.id}-price`, 'Custo de uma unidade; até 2 casas decimais.', unitPrice => updateCost(group, i, { unitPrice }))}
              </div>
              {'allocation' in cost && <Field label="Como você calculou esta parcela?" id={`${group}.${i}.allocation`} value={cost.allocation} maxLength={120} error={error(`${group}.${i}.allocation`)} hint="Informe o critério de rateio. Digite acima apenas a parcela deste trabalho, não a despesa mensal inteira." onChange={allocation => change(updateCost(group, i, { allocation }))} />}
              <button className="remove-button" type="button" onClick={() => { pendingFocus.current = `add-${group}`; change({ ...input, [group]: input[group].filter((_, index) => i !== index) }) }} aria-label={`Remover ${group === 'direct' ? 'custo direto' : 'despesa indireta'} ${i + 1}: ${cost.name}`}>× Remover item</button>
            </fieldset>)}
            <button className="add-button" id={`add-${group}`} type="button" onClick={() => addCost(group)}>＋ Adicionar {group === 'direct' ? 'custo direto' : 'despesa indireta'}</button>
          </div>)}
          {reviewButton('costs')}
        </Section>
        <Section id="work" number="02" title="Quanto vale seu trabalho?" description="Inclua preparação, execução, revisões e deslocamento. Sua remuneração vem antes do lucro.">
          <div className="field"><label htmlFor="labor.mode">Como você quer se remunerar?</label><select id="labor.mode" value={input.labor.mode} aria-describedby="labor-mode-help" onChange={event => change({ ...input, labor: { ...input.labor, mode: event.target.value as PricingInput['labor']['mode'] } })}><option value="hour">Por hora de trabalho</option><option value="quantity">Por quantidade de trabalho</option><option value="fixed">Um valor fixo pelo trabalho</option></select><small id="labor-mode-help">A modalidade altera somente o cálculo da sua remuneração.</small></div>
          <div className="two-columns">
            {input.labor.mode !== 'fixed' && numeric(input.labor.mode === 'hour' ? 'Horas totais' : 'Unidades de trabalho', input.labor.quantity, 'labor.quantity', 'labor-quantity', input.labor.mode === 'hour' ? 'Exemplo: 2,5 para duas horas e meia.' : 'Exemplo: 3 atendimentos. Não é a quantidade de produtos do lote.', quantity => ({ ...input, labor: { ...input.labor, quantity } }))}
            {numeric(input.labor.mode === 'fixed' ? 'Remuneração total (R$)' : input.labor.mode === 'hour' ? 'Valor por hora (R$)' : 'Valor por unidade (R$)', input.labor.rate, 'labor.rate', 'labor-rate', input.labor.mode === 'fixed' ? 'Quanto você quer receber por todo o seu trabalho.' : 'Quanto você quer receber por cada hora ou unidade de trabalho.', rate => ({ ...input, labor: { ...input.labor, rate } }))}
          </div>
          {reviewButton('work')}
        </Section>
        <Section id="rates" number="03" title="Taxas e margem de lucro" description="Agora inclua as cobranças da venda e o lucro que deseja além da sua remuneração.">
          <h3>Taxas e tributos</h3><p className="help-text">Exemplos: cartão, comissão ou tributo aplicável. Nenhuma alíquota é preenchida automaticamente.</p>
          {!input.fees.length && <p className="empty-state">Nenhuma taxa incluída. Se você paga taxas nesta venda, adicione cada uma.</p>}
          {input.fees.map((fee, i) => <fieldset className="line-item" key={fee.id}><legend>Taxa {i + 1}</legend>
            <Field label="Descrição da taxa" id={`fees.${i}.name`} value={fee.name} maxLength={120} hint="Exemplo: taxa do cartão ou comissão." error={error(`fees.${i}.name`)} onChange={name => change(updateFee(i, { name }))} />
            <div className="two-columns">
              {numeric('Percentual (%)', fee.percent, `fees.${i}.percent`, `fee-${fee.id}-percent`, 'Digite 5 para uma taxa de 5%; use 0 se a taxa for só fixa.', percent => updateFee(i, { percent }))}
              {numeric('Valor fixo (R$)', fee.fixed, `fees.${i}.fixed`, `fee-${fee.id}-fixed`, 'Cobrado uma vez por trabalho; use 0 se não houver.', fixed => updateFee(i, { fixed }))}
            </div>
            <div className="field"><label htmlFor={`fees.${i}.base`}>Sobre qual valor incide o percentual?</label><select id={`fees.${i}.base`} value={fee.base} aria-describedby={`fee-base-help-${fee.id}`} onChange={event => change(updateFee(i, { base: event.target.value as FeeBase }))}>{Object.entries(feeBases).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select><small id={`fee-base-help-${fee.id}`}>Na venda, incide sobre o preço final. Nas outras opções, sobre os custos indicados, antes das taxas e do lucro. O valor fixo é sempre adicional.</small></div>
            <button className="remove-button" type="button" onClick={() => { pendingFocus.current = 'add-fee'; change({ ...input, fees: input.fees.filter((_, index) => index !== i) }) }}>× Remover taxa {i + 1}</button>
          </fieldset>)}
          <button className="add-button" id="add-fee" type="button" onClick={() => { pendingFocus.current = `fees.${input.fees.length}.name`; change({ ...input, fees: [...input.fees, { id: crypto.randomUUID(), name: 'Nova taxa', percent: 0, fixed: 0, base: 'sale' }] }) }}>＋ Adicionar taxa</button>
          <div className="margin-block"><h3>O que deve sobrar como lucro?</h3>
            {numeric('Margem desejada (%)', input.margin, 'margin', 'margin', 'Parte da receita que sobra depois dos custos, do seu trabalho e das taxas. Até 2 casas decimais.', margin => ({ ...input, margin }))}
            <div className="explanation"><strong>Margem não é markup.</strong><p>Com custo de R$ 100 e margem de 20%, o preço é R$ 125. Acrescentar 20% ao custo daria R$ 120, com margem menor. Os 20% iniciais são apenas um exemplo editável.</p></div>
          </div>
          {reviewButton('rates')}
        </Section>
        <div className="review-action">{result.ok && result.price === 0 && <label className="checkbox-label zero-choice"><input type="checkbox" checked={draft.zeroConfirmed ?? false} onChange={event => { onChange({ ...draft, zeroConfirmed: event.target.checked }); setAttempted(false); onEdit() }} /><span>Quero simular um trabalho com preço zero<small>Confirme somente se os custos, a remuneração e as taxas fixas deste trabalho forem intencionalmente zero.</small></span></label>}<p>Pronto para conferir? O resultado usa somente o que você informou.</p><button className="primary-button" type="submit">Conferir meu preço <span aria-hidden="true">↗</span></button>
          {attempted && result.ok && result.price === 0 && !draft.zeroConfirmed && <p className="field-error" role="status">Preencha os custos e a remuneração ou confirme a simulação intencional de preço zero acima.</p>}
          {attempted && !result.ok && <p className="field-error" role="status">Há campos para revisar. Consulte as mensagens no resultado e junto aos campos.</p>}
        </div>
      </form>
      <ResultPanel input={input} attempted={attempted} zeroConfirmed={draft.zeroConfirmed} />
    </div>
  </>
}



