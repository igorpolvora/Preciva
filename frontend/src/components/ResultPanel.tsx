import type { PricingInput } from '../domain/pricing'
import { calculate } from '../domain/pricing'
import { fieldLabel } from '../form'
import { decimal, fraction, money, feeBases } from '../experience'
import { resultPresentation } from '../ux'



export function ResultPanel({ input, attempted, zeroConfirmed = false }: { input: PricingInput; attempted: boolean; zeroConfirmed?: boolean }) {
  const result = calculate(input)
  const presentation = resultPresentation(result, zeroConfirmed)
  const breakdown: [string, number][] = result.ok ? [['Custos diretos', result.direct], ['Despesas indiretas', result.indirect], ['Sua remuneração', result.labor], ['Taxas e tributos', result.fees], ['Lucro projetado', result.profit]] : []
  return <aside className="result-column" aria-label="Preço e composição">
    <section className="result-card" id="result" tabIndex={-1} aria-labelledby="result-title">
      <span className="eyebrow">SEU TRABALHO, COM VALOR</span><h2 id="result-title">{presentation === 'initial' ? 'Seu preço começa aqui' : 'Preço calculado'}</h2>
      <div className="price-announcement" role="status" aria-live="polite" aria-atomic="true">
        {presentation === 'initial' ? <p className="pending-price">Vamos montar seu preço? Preencha os custos e o valor do seu trabalho para começar.</p> : result.ok ? <><p className="price">{money(result.price)}</p><p>pelo trabalho ou lote completo</p></> : <p className="pending-price">Preço indisponível. Revise os campos indicados.</p>}
      </div>
      {result.ok && presentation === 'ready' ? <>
        {result.price === 0 && <p className="result-note">Simulação de preço zero confirmada por você. Confira se todas as premissas representam este trabalho.</p>}
        {attempted && <p className="result-confirmation">✓ Cálculo válido. Confira as premissas abaixo.</p>}
        <dl className="breakdown">{breakdown.map(([label, value], i) => <div key={label} className={i === 4 ? 'profit' : ''}><dt><span className={`composition-dot tone-${i}`} aria-hidden="true" />{label}</dt><dd>{money(value)}</dd></div>)}</dl>
        <div className="margin-summary"><span>Margem desejada <strong>{decimal(input.margin, 2)}%</strong></span><span>Margem efetiva <strong>{decimal(result.actualMargin, 4)}%</strong></span></div>
        <p className="result-note">Sua remuneração já está incluída. O lucro é o que sobra além dela. Arredondamentos podem alterar a margem efetiva.</p>
        <details className="memory"><summary>Entenda a conta, passo a passo</summary>
          <h3>Premissas informadas</h3>
          <ul>{input.direct.map(cost => <li key={cost.id}>Direto — {cost.name}: {decimal(cost.quantity)} × {money(cost.unitPrice)}.</li>)}
            {input.indirect.map(cost => <li key={cost.id}>Indireto — {cost.name}: {decimal(cost.quantity)} × {money(cost.unitPrice)}. Rateio: {cost.allocation}.</li>)}</ul>
          <p>Trabalho: {input.labor.mode === 'fixed' ? `valor fixo de ${money(input.labor.rate)}` : `${decimal(input.labor.quantity)} ${input.labor.mode === 'hour' ? 'hora(s)' : 'unidade(s)'} × ${money(input.labor.rate)}`}.</p>
          <p>Base = diretos + indiretos + remuneração = {money(result.subtotal)}.</p>
          <p>Taxas fixas: {money(result.fixed)}. Taxas sobre outras bases: {money(result.baseFees)}.</p>
          <p>Preço = {money(result.cost)} ÷ (1 − {fraction(input.margin)} − {fraction(result.salePercent)}) = {money(result.price)}.</p>
          {input.fees.map((fee, i) => <p key={fee.id}>{fee.name}: {decimal(fee.percent, 2)}% sobre {feeBases[fee.base].toLowerCase()} + {money(fee.fixed)} fixos = {money(result.feeAmounts[i])}.</p>)}
          <p>Lucro = preço − diretos − indiretos − remuneração − taxas = {money(result.profit)}.</p>
          <p>Itens e taxas são arredondados individualmente ao centavo, com meio centavo para cima; o preço é arredondado para cima. Taxas não incidem em cascata.</p>
          <p>Versão das regras: {result.ruleVersion}.</p>
        </details>
      </> : !result.ok ? <div className="validation"><h3>O que precisa de atenção</h3><ul>{result.issues.map((issue, i) => <li key={`${issue.path}-${i}`}><strong>{fieldLabel(input, issue.path)}: </strong>{issue.path === 'total' ? issue.message : <a href={`#${issue.path}`} onClick={event => { event.preventDefault(); document.getElementById(issue.path)?.focus() }}>{issue.message}</a>}</li>)}</ul></div> : <p className="result-note">Os modelos começam sem valores de referência. Se o trabalho for intencionalmente gratuito, confirme a opção de preço zero ao final do formulário.</p>}
    </section>
    <div className="guidance"><span aria-hidden="true">↗</span><p><strong>Um ponto de partida consciente.</strong> Confira seus custos e as regras da sua atividade. Esta estimativa não substitui orientação contábil.</p></div>
  </aside>
}



