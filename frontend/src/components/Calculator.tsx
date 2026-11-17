import { useLayoutEffect, useRef, useState } from 'react'
import type { FocusEvent, FormEvent } from 'react'
import { calculate } from '../domain/pricing'
import type { Cost, Fee, FeeBase, IndirectCost, PricingInput } from '../domain/pricing'
import type { Draft } from '../experience'
import { editDraft, parseDecimal, feeBases, money } from '../experience'
import { Field, Section } from './Fields'
import { Check, Plus, X } from 'lucide-react'
import { Button, FormField, Select } from './ui/primitives'
import { InteractiveHoverButton } from '@/components/ui/interactive-hover-button'
import { ResultPanel } from './ResultPanel'
import { StepNavigation } from './StepNavigation'
import { confirmStep, resultPresentation, stepIsComplete, stepIsValid, steps } from '../ux'
import type { Step } from '../ux'

type Props = {
  draft: Draft
  onChange: (draft: Draft) => void
  onEdit: () => void
  onReview: (valid: boolean) => void
}

export function Calculator({ draft, onChange, onEdit, onReview }: Props) {
  const [attempted, setAttempted] = useState(false)
  const [activeStep, setActiveStep] = useState<Step>('costs')
  const pendingFocus = useRef<string | null>(null)
  const input = draft.input
  const result = calculate(input)
  const issues = result.ok ? [] : result.issues
  const presentation = resultPresentation(result, draft.zeroConfirmed)
  const resultSummary = result.ok && presentation === 'ready'
    ? money(result.price)
    : result.ok ? 'Aguardando valores' : 'Revise os campos'

  useLayoutEffect(() => {
    if (pendingFocus.current) {
      document.getElementById(pendingFocus.current)?.focus()
      pendingFocus.current = null
    }
  }, [input])

  function handleFocus(event: FocusEvent<HTMLFormElement>) {
    const id = event.target.closest('.form-section')?.id
    const step = steps.find(item => item.id === id)
    if (step) setActiveStep(step.id)

    const target = event.target
    const scrollMargin = Number.parseFloat(getComputedStyle(target).scrollMarginTop)
    if (target.getBoundingClientRect().top < scrollMargin) {
      target.scrollIntoView({ block: 'start' })
    }
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setAttempted(true)
    onReview(presentation === 'ready')
    document.getElementById('result')?.focus()
  }

  function reviewButton(step: Step) {
    const complete = stepIsComplete(draft, step, issues)
    const valid = stepIsValid(step, issues)
    return (
      <div className="step-review">
        <Button
          disabled={!valid}
          onClick={() => onChange(confirmStep(draft, step, issues))}
        >
          {complete && <Check size={16} aria-hidden="true" />}
          {complete ? 'Etapa concluída' : 'Marcar etapa como revisada'}
        </Button>
        {!valid && <small>Revise os campos e os avisos no resultado.</small>}
      </div>
    )
  }

  const error = (path: string) => issues.find(issue => issue.path === path)?.message

  function change(next: PricingInput, rawKey?: string, raw?: string) {
    onChange(editDraft(draft, next, rawKey, raw))
    setAttempted(false)
    onEdit()
  }

  function numeric(label: string, value: number, path: string, rawKey: string, hint: string | undefined, apply: (value: number) => PricingInput) {
    return (
      <Field
        key={rawKey}
        label={label}
        id={path}
        value={draft.raw[rawKey] ?? (Number.isFinite(value) ? String(value).replace('.', ',') : '')}
        numeric
        error={error(path)}
        hint={hint}
        onChange={raw => change(apply(parseDecimal(raw)), rawKey, raw)}
      />
    )
  }

  const updateCost = (group: 'direct' | 'indirect', index: number, patch: Partial<IndirectCost>): PricingInput => ({
    ...input, [group]: input[group].map((cost, i) => i === index ? { ...cost, ...patch } : cost),
  })
  const updateFee = (index: number, patch: Partial<Fee>): PricingInput => ({
    ...input, fees: input.fees.map((fee, i) => i === index ? { ...fee, ...patch } : fee),
  })
  const updateLabor = (patch: Partial<PricingInput['labor']>): PricingInput => ({
    ...input, labor: { ...input.labor, ...patch },
  })

  function addCost(group: 'direct' | 'indirect') {
    const cost: Cost = { id: crypto.randomUUID(), name: 'Novo custo', quantity: 1, unitPrice: 0 }
    pendingFocus.current = `${group}.${input[group].length}.name`
    change(group === 'direct'
      ? { ...input, direct: [...input.direct, cost] }
      : { ...input, indirect: [...input.indirect, { ...cost, allocation: 'Parcela por trabalho' }] })
  }

  const { mode, quantity, rate } = input.labor
  const rateLabels = { hour: 'Valor por hora (R$)', quantity: 'Valor por unidade (R$)', fixed: 'Remuneração total (R$)' }

  return (
    <div className="workspace">
      <div className="editor">
        <StepNavigation active={activeStep} onSelect={setActiveStep} draft={draft} issues={issues} resultSummary={resultSummary} />
        <form noValidate onFocusCapture={handleFocus} onSubmit={handleSubmit}>
          <Section id="costs" title="Custos do trabalho" description="Inclua gastos deste trabalho e a parcela que ele usa dos custos do seu negócio.">
            {(['direct', 'indirect'] as const).map(group => (
              <div className="cost-group" key={group}>
                <h3>{group === 'direct' ? 'Custos diretos' : 'Despesas indiretas'}</h3>
                <p className="help-text">
                  {group === 'direct'
                    ? 'Materiais, transporte ou equipe usados neste trabalho.'
                    : 'Rateie despesas do negócio. Exemplo: R$ 600 por mês em 10 trabalhos dão R$ 60 por trabalho.'}
                </p>
                {!input[group].length && <p className="empty-state">Nenhum item nesta categoria.</p>}
                {input[group].map((cost, index) => {
                  const path = `${group}.${index}`
                  return (
                    <fieldset className="line-item" key={cost.id}>
                      <legend>{group === 'direct' ? 'Custo direto' : 'Despesa indireta'} {index + 1}</legend>
                      <div className="cost-row">
                        <Field
                          className="name-field"
                          label="Descrição"
                          id={`${path}.name`}
                          value={cost.name}
                          maxLength={120}
                          error={error(`${path}.name`)}
                          onChange={name => change(updateCost(group, index, { name }))}
                        />
                        {numeric('Quantidade', cost.quantity, `${path}.quantity`, `${group}-${cost.id}-quantity`, undefined, quantity => updateCost(group, index, { quantity }))}
                        {numeric('Valor unitário (R$)', cost.unitPrice, `${path}.unitPrice`, `${group}-${cost.id}-price`, undefined, unitPrice => updateCost(group, index, { unitPrice }))}
                      </div>
                      {'allocation' in cost && (
                        <Field
                          label="Critério de rateio"
                          id={`${path}.allocation`}
                          value={cost.allocation}
                          maxLength={120}
                          error={error(`${path}.allocation`)}
                          hint="Descreva como chegou à parcela deste trabalho."
                          onChange={allocation => change(updateCost(group, index, { allocation }))}
                        />
                      )}
                      <Button
                        variant="remove"
                        onClick={() => {
                          pendingFocus.current = `add-${group}`
                          change({ ...input, [group]: input[group].filter((_, i) => i !== index) })
                        }}
                        aria-label={`Remover ${group === 'direct' ? 'custo direto' : 'despesa indireta'} ${index + 1}: ${cost.name}`}
                      >
                        <X size={16} aria-hidden="true" /> Remover item
                      </Button>
                    </fieldset>
                  )
                })}
                <Button variant="add" id={`add-${group}`} onClick={() => addCost(group)}>
                  <Plus size={16} aria-hidden="true" /> Adicionar {group === 'direct' ? 'custo direto' : 'despesa indireta'}
                </Button>
              </div>
            ))}
            {reviewButton('costs')}
          </Section>

          <Section id="work" title="Sua remuneração" description="Inclua o tempo de preparação, execução, revisões e deslocamento.">
            <FormField id="labor.mode" label="Como você cobra seu trabalho?">
              {attributes => <Select {...attributes} value={mode} onChange={event => change(updateLabor({ mode: event.target.value as PricingInput['labor']['mode'] }))}>
                <option value="hour">Por hora</option>
                <option value="quantity">Por unidade de trabalho</option>
                <option value="fixed">Valor fixo pelo trabalho</option>
              </Select>}
            </FormField>
            <div className="two-columns">
              {mode !== 'fixed' && numeric(
                mode === 'hour' ? 'Horas totais' : 'Unidades de trabalho',
                quantity, 'labor.quantity', 'labor-quantity',
                mode === 'hour' ? 'Use 2,5 para duas horas e meia.' : 'Exemplo: 3 atendimentos.',
                quantity => updateLabor({ quantity }),
              )}
              {numeric(rateLabels[mode], rate, 'labor.rate', 'labor-rate', undefined, rate => updateLabor({ rate }))}
            </div>
            {reviewButton('work')}
          </Section>

          <Section id="rates" title="Taxas e margem de lucro" description="Inclua cobranças da venda e defina o lucro além da sua remuneração.">
            <h3>Taxas e tributos</h3>
            <p className="help-text">Adicione taxas de cartão, comissões ou tributos aplicáveis ao trabalho.</p>
            {!input.fees.length && <p className="empty-state">Nenhuma taxa incluída.</p>}
            {input.fees.map((fee, index) => {
              const path = `fees.${index}`
              return (
                <fieldset className="line-item" key={fee.id}>
                  <legend>Taxa {index + 1}</legend>
                  <Field
                    label="Descrição da taxa"
                    id={`${path}.name`}
                    value={fee.name}
                    maxLength={120}
                    error={error(`${path}.name`)}
                    onChange={name => change(updateFee(index, { name }))}
                  />
                  <div className="two-columns">
                    {numeric('Percentual (%)', fee.percent, `${path}.percent`, `fee-${fee.id}-percent`, 'Use 0 se a taxa for apenas fixa.', percent => updateFee(index, { percent }))}
                    {numeric('Valor fixo (R$)', fee.fixed, `${path}.fixed`, `fee-${fee.id}-fixed`, 'Cobrado uma vez por trabalho.', fixed => updateFee(index, { fixed }))}
                  </div>
                  <FormField id={`${path}.base`} label="Sobre qual valor incide o percentual?" hint="O valor fixo é somado à taxa percentual.">
                    {attributes => <Select
                      {...attributes}
                      value={fee.base}
                      onChange={event => change(updateFee(index, { base: event.target.value as FeeBase }))}
                    >
                      {Object.entries(feeBases).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
                    </Select>}
                  </FormField>
                  <Button
                    variant="remove"
                    onClick={() => {
                      pendingFocus.current = 'add-fee'
                      change({ ...input, fees: input.fees.filter((_, i) => i !== index) })
                    }}
                  >
                    <X size={16} aria-hidden="true" /> Remover taxa {index + 1}
                  </Button>
                </fieldset>
              )
            })}
            <Button
              variant="add"
              id="add-fee"
              onClick={() => {
                pendingFocus.current = `fees.${input.fees.length}.name`
                change({ ...input, fees: [...input.fees, { id: crypto.randomUUID(), name: 'Nova taxa', percent: 0, fixed: 0, base: 'sale' }] })
              }}
            >
              <Plus size={16} aria-hidden="true" /> Adicionar taxa
            </Button>
            <div className="margin-block">
              <h3>Lucro desejado</h3>
              {numeric('Margem desejada (%)', input.margin, 'margin', 'margin', 'Parte da receita que sobra depois dos custos, da remuneração e das taxas.', margin => ({ ...input, margin }))}
              <div className="explanation">
                <strong>Margem é calculada sobre o preço de venda.</strong>
                <p>Um custo de R$ 100 com margem de 20% gera um preço de R$ 125. Use a margem que faz sentido para o seu trabalho.</p>
              </div>
            </div>
            {reviewButton('rates')}
          </Section>

          <div className="review-action">
            {result.ok && result.price === 0 && (
              <label className="checkbox-label zero-choice">
                <input
                  type="checkbox"
                  checked={draft.zeroConfirmed ?? false}
                  onChange={event => {
                    onChange({ ...draft, zeroConfirmed: event.target.checked })
                    setAttempted(false)
                    onEdit()
                  }}
                />
                <span>
                  Quero simular um trabalho com preço zero
                  <small>Confirme quando os custos, a remuneração e as taxas fixas forem intencionalmente zero.</small>
                </span>
              </label>
            )}
            <InteractiveHoverButton type="submit" text="Conferir meu preço" className="w-full border-primary" />
            {attempted && presentation === 'initial' && <p className="field-error" role="status">Preencha os custos e a remuneração ou confirme a simulação de preço zero.</p>}
            {attempted && presentation === 'invalid' && <p className="field-error" role="status">Confira os avisos no resultado e junto aos campos.</p>}
          </div>
        </form>
      </div>
      <ResultPanel input={input} attempted={attempted} zeroConfirmed={draft.zeroConfirmed} />
    </div>
  )
}
