export const RULE_VERSION = '1.0.1'
export type Cost = { id: string; name: string; quantity: number; unitPrice: number }
export type IndirectCost = Cost & { allocation: string }
export type FeeBase = 'sale' | 'direct' | 'labor' | 'subtotal'
export type Fee = { id: string; name: string; percent: number; base: FeeBase; fixed: number }
export type PricingInput = {
  direct: Cost[]; indirect: IndirectCost[]
  labor: { mode: 'hour' | 'quantity' | 'fixed'; quantity: number; rate: number }
  fees: Fee[]; margin: number
}
export type Issue = { path: string; message: string }
export function validate(input: PricingInput): Issue[] {
  const issues: Issue[] = []
  const number = (value: number, path: string, max = 10_000_000, digits = 2) => {
    if (!Number.isFinite(value) || value < 0 || value > max || Math.round(value * 10 ** digits) / 10 ** digits !== value)
      issues.push({ path, message: `Informe um número de 0 a ${max.toLocaleString('pt-BR')}, com até ${digits} casas decimais.` })
  }
  const name = (value: string, path: string) => {
    if (!value.trim() || value.length > 120) issues.push({ path, message: 'Informe uma descrição de 1 a 120 caracteres.' })
  }
  for (const group of ['direct', 'indirect'] as const) {
    input[group].forEach((cost, i) => {
      name(cost.name, `${group}.${i}.name`)
      number(cost.quantity, `${group}.${i}.quantity`, 1_000_000, 3)
      number(cost.unitPrice, `${group}.${i}.unitPrice`)
      if (group === 'indirect') name((cost as IndirectCost).allocation, `${group}.${i}.allocation`)
    })
  }
  if (!['hour', 'quantity', 'fixed'].includes(input.labor.mode)) issues.push({ path: 'labor.mode', message: 'Escolha uma modalidade válida.' })
  if (input.labor.mode !== 'fixed') number(input.labor.quantity, 'labor.quantity', 1_000_000, 3)
  number(input.labor.rate, 'labor.rate')
  number(input.margin, 'margin', 100)
  input.fees.forEach((fee, i) => {
    name(fee.name, `fees.${i}.name`)
    number(fee.percent, `fees.${i}.percent`, 100)
    number(fee.fixed, `fees.${i}.fixed`)
    if (!['sale', 'direct', 'labor', 'subtotal'].includes(fee.base)) issues.push({ path: `fees.${i}.base`, message: 'Escolha uma base válida.' })
  })
  const salePercent = input.fees.filter(f => f.base === 'sale').reduce((sum, f) => sum + f.percent, 0)
  if (Math.round((salePercent + input.margin) * 100) >= 10000) issues.push({ path: 'margin', message: 'A margem mais as taxas sobre a venda deve ser menor que 100%.' })
  return issues
}
const cents = (value: number) => BigInt(Math.round(value * 100))
const rounded = (numerator: bigint, denominator: bigint) => (numerator + denominator / 2n) / denominator
const lineTotal = (cost: Cost) => rounded(cents(cost.unitPrice) * BigInt(Math.round(cost.quantity * 1000)), 1000n)
const sum = (items: bigint[]) => items.reduce((total, value) => total + value, 0n)
export function calculate(input: PricingInput) {
  const issues = validate(input)
  if (issues.length) return { ok: false as const, issues }
  const direct = sum(input.direct.map(lineTotal))
  const indirect = sum(input.indirect.map(lineTotal))
  const labor = lineTotal({ id: 'labor', name: 'Trabalho', quantity: input.labor.mode === 'fixed' ? 1 : input.labor.quantity, unitPrice: input.labor.rate })
  const subtotal = direct + indirect + labor
  const fixed = sum(input.fees.map(f => cents(f.fixed)))
  const bases = { direct, labor, subtotal }
  const baseFees = input.fees.map(f => f.base === 'sale' ? 0n : rounded(bases[f.base] * BigInt(Math.round(f.percent * 100)), 10000n))
  const cost = subtotal + fixed + sum(baseFees)
  const saleBps = input.fees.filter(f => f.base === 'sale').reduce((s, f) => s + Math.round(f.percent * 100), 0)
  const denominator = BigInt(10000 - Math.round(input.margin * 100) - saleBps)
  // Selling price rounded upwards; every monetary operation uses integer cents.
  const price = (cost * 10000n + denominator - 1n) / denominator
  const feeAmounts = input.fees.map((f, i) => cents(f.fixed) + (f.base === 'sale' ? rounded(price * BigInt(Math.round(f.percent * 100)), 10000n) : baseFees[i]))
  const fees = sum(feeAmounts)
  const profit = price - subtotal - fees
  if ([direct, indirect, labor, cost, price, fees].some(v => v > 1_000_000_000_000n))
    return { ok: false as const, issues: [{ path: 'total', message: 'O total excede o limite de R$ 10 bilhões. Reduza os valores ou as quantidades.' }] }
  const money = (value: bigint) => Number(value) / 100
  // Preserve the formula, but do not recommend a loss due to per-fee rounding.
  if (profit < 0n)
    return { ok: false as const, issues: [{ path: 'total', message: 'O arredondamento individual das taxas gera prejuízo neste valor. Revise os custos e as taxas; este preço não será recomendado.' }] }
  return { ok: true as const, ruleVersion: RULE_VERSION, direct: money(direct), indirect: money(indirect), labor: money(labor), subtotal: money(subtotal), cost: money(cost), fixed: money(fixed), baseFees: money(sum(baseFees)), salePercent: saleBps / 100, fees: money(fees), feeAmounts: feeAmounts.map(money), price: money(price), profit: money(profit), actualMargin: price === 0n ? 0 : Number(profit) / Number(price) * 100 }
}

