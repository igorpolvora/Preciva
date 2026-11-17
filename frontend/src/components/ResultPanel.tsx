import { calculate } from '../domain/pricing'
import type { PricingInput } from '../domain/pricing'
import { decimal, feeBases, fraction, money } from '../experience'
import { fieldLabel } from '../form'
import { resultPresentation } from '../ux'
import { ArrowUpRight, Check } from 'lucide-react'
import { Card } from './ui/primitives'

type CalculatedPrice = Extract<ReturnType<typeof calculate>, { ok: true }>

function PriceBreakdown({ result }: { result: CalculatedPrice }) {
  const items = [
    { label: 'Custos diretos', amount: result.direct, tone: 'tone-0' },
    { label: 'Despesas indiretas', amount: result.indirect, tone: 'tone-1' },
    { label: 'Sua remuneração', amount: result.labor, tone: 'tone-2' },
    { label: 'Taxas e tributos', amount: result.fees, tone: 'tone-3' },
    { label: 'Lucro projetado', amount: result.profit, tone: 'tone-4', highlight: true },
  ]

  return (
    <>
      {result.price > 0 && (
        <div className="composition-bar" aria-hidden="true">
          {items.filter(item => item.amount > 0).map(item => (
            <span key={item.tone} className={`composition-segment ${item.tone}`} style={{ flexGrow: (item.amount / result.price) * 100 }} />
          ))}
        </div>
      )}
      <dl className="breakdown">
        {items.map(item => (
          <div key={item.label} className={item.highlight ? 'profit' : undefined}>
            <dt><span className={`composition-dot ${item.tone}`} aria-hidden="true" />{item.label}</dt>
            <dd>{money(item.amount)}</dd>
          </div>
        ))}
      </dl>
    </>
  )
}

function CalculationMemory({ input, result }: { input: PricingInput; result: CalculatedPrice }) {
  const { labor } = input
  const payment = labor.mode === 'fixed'
    ? `valor fixo de ${money(labor.rate)}`
    : `${decimal(labor.quantity)} ${labor.mode === 'hour' ? 'hora(s)' : 'unidade(s)'} × ${money(labor.rate)}`

  return (
    <details className="memory">
      <summary>Entenda a conta, passo a passo</summary>
      <h3>Premissas informadas</h3>
      <ul>
        {input.direct.map(cost => (
          <li key={cost.id}>Custo direto · {cost.name} · {decimal(cost.quantity)} × {money(cost.unitPrice)}</li>
        ))}
        {input.indirect.map(cost => (
          <li key={cost.id}>Despesa indireta · {cost.name} · {decimal(cost.quantity)} × {money(cost.unitPrice)}. Critério de rateio · {cost.allocation}.</li>
        ))}
      </ul>
      <p>Remuneração por {payment}.</p>
      <p>Base = diretos + indiretos + remuneração = {money(result.subtotal)}.</p>
      <p>Taxas fixas de {money(result.fixed)} e taxas sobre outras bases de {money(result.baseFees)}.</p>
      <p>Preço = {money(result.cost)} ÷ (1 − {fraction(input.margin)} − {fraction(result.salePercent)}) = {money(result.price)}.</p>
      {input.fees.map((fee, index) => (
        <p key={fee.id}>{fee.name} · {decimal(fee.percent, 2)}% sobre {feeBases[fee.base].toLowerCase()} + {money(fee.fixed)} fixos = {money(result.feeAmounts[index])}.</p>
      ))}
      <p>Lucro = preço − diretos − indiretos − remuneração − taxas = {money(result.profit)}.</p>
      <p>Itens e taxas são arredondados individualmente ao centavo, com meio centavo para cima. O preço é arredondado para cima. Taxas não incidem em cascata.</p>
      <p>Versão das regras {result.ruleVersion}.</p>
    </details>
  )
}

export function ResultPanel({ input, attempted, zeroConfirmed = false }: {
  input: PricingInput
  attempted: boolean
  zeroConfirmed?: boolean
}) {
  const result = calculate(input)
  const presentation = resultPresentation(result, zeroConfirmed)
  const ready = result.ok && presentation === 'ready'

  return (
    <aside className="result-column" aria-label="Preço e composição">
      <Card className="result-card" id="result" tabIndex={-1} aria-labelledby="result-title">
        <h2 id="result-title">{presentation === 'initial' ? 'Seu preço começa aqui' : 'Resultado do cálculo'}</h2>
        <div className="price-announcement" role="status" aria-live="polite" aria-atomic="true">
          {presentation === 'initial' && (
            <p className="pending-price">Informe os seus custos ou a sua remuneração para estimar um preço.</p>
          )}
          {!result.ok && <p className="pending-price">Preço indisponível. Revise os campos indicados.</p>}
          {ready && (
            <>
              <p className="price">{money(result.price)}</p>
              <p>Total pelo trabalho ou lote completo</p>
            </>
          )}
        </div>
        {presentation === 'initial' && (
          <>
            <a className="result-start" href="#costs">Preencher custos <ArrowUpRight size={16} aria-hidden="true" /></a>
            <p className="result-note">Para simular um serviço gratuito, confirme a opção de preço zero ao final do formulário.</p>
          </>
        )}
        {ready && (
          <>
            {result.price === 0 && <p className="result-note">Simulação de preço zero confirmada. Confira se as premissas representam este serviço.</p>}
            {attempted && <p className="result-confirmation"><Check size={16} aria-hidden="true" /> Cálculo válido</p>}
            <PriceBreakdown result={result} />
            <div className="margin-summary">
              <span>Margem desejada <strong>{decimal(input.margin, 2)}%</strong></span>
              <span>Margem efetiva <strong>{decimal(result.actualMargin, 4)}%</strong></span>
            </div>
            <p className="result-note">O lucro é o que sobra depois dos custos, das taxas e da sua remuneração. O arredondamento pode afetar a margem efetiva.</p>
            <CalculationMemory input={input} result={result} />
          </>
        )}
        {!result.ok && (
          <div className="validation">
            <h3>O que precisa de atenção</h3>
            <ul>
              {result.issues.map((issue, index) => (
                <li key={`${issue.path}-${index}`}>
                  <strong>{fieldLabel(input, issue.path)}</strong>{' '}
                  {issue.path === 'total'
                    ? issue.message
                    : (
                      <a href={`#${issue.path}`} onClick={event => {
                        const field = document.getElementById(issue.path)
                        if (!field) return
                        event.preventDefault()
                        field.focus()
                      }}>
                        {issue.message}
                      </a>
                    )}
                </li>
              ))}
            </ul>
          </div>
        )}
      </Card>
      <div className="guidance"><p>Revise os custos e as regras da sua atividade antes de fechar o preço.</p></div>
    </aside>
  )
}
