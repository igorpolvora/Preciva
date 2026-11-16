import test from 'node:test'
import assert from 'node:assert/strict'
import { calculate, validate, RULE_VERSION } from '../src/domain/pricing.ts'
import { createInput, templates } from '../src/domain/templates.ts'

const scenario = () => ({ direct: [{ id: '1', name: 'Material', quantity: 1, unitPrice: 100 }], indirect: [], labor: { mode: 'hour', quantity: 2, rate: 50 }, fees: [], margin: 20 })
const valid = input => { const result = calculate(input); assert.equal(result.ok, true, JSON.stringify(result)); return result }

test('margem é sobre receita, com remuneração separada do lucro', () => {
  const r = valid(scenario())
  assert.equal(r.price, 250); assert.equal(r.labor, 100); assert.equal(r.profit, 50); assert.equal(r.actualMargin, 20)
  assert.equal(r.ruleVersion, RULE_VERSION)
})
test('taxa percentual sobre venda e valor fixo entram na fórmula', () => {
  const input = scenario(); input.fees = [{ id: 'f', name: 'Cartão', percent: 5, fixed: 10, base: 'sale' }]
  const r = valid(input)
  assert.equal(r.price, 280); assert.equal(r.fees, 24); assert.equal(r.profit, 56)
})
test('bases diferentes e despesas indiretas não geram incidência em cascata', () => {
  const input = scenario(); input.indirect = [{ id: 'i', name: 'Aluguel', quantity: 1, unitPrice: 50, allocation: '1/20 do mês' }]
  input.fees = [ ['direct', 10], ['labor', 5], ['subtotal', 2] ].map(([base, percent]) => ({ id: base, name: base, base, percent, fixed: 1 }))
  const r = valid(input)
  assert.equal(r.subtotal, 250); assert.equal(r.baseFees, 20); assert.equal(r.fixed, 3); assert.equal(r.price, 341.25)
  assert.deepEqual(r.feeAmounts, [11, 6, 6]); assert.equal(r.profit, 68.25)
})
for (const mode of ['hour', 'quantity', 'fixed']) test(`remuneração por ${mode}`, () => {
  const input = scenario(); input.labor.mode = mode; input.labor.quantity = 3
  assert.equal(valid(input).labor, mode === 'fixed' ? 50 : 150)
})
test('quantidades fracionadas, meio centavo e preço arredondado para cima', () => {
  const input = scenario(); input.direct[0] = { id: 'x', name: 'Ingrediente', quantity: 0.125, unitPrice: 1 }; input.labor.rate = 0
  const r = valid(input); assert.equal(r.direct, 0.13); assert.equal(r.price, 0.17); assert.equal(r.profit, 0.04)
})
test('valores zero e listas vazias são válidos', () => {
  const input = scenario(); input.direct = []; input.labor.rate = 0; input.margin = 0
  const r = valid(input); assert.equal(r.price, 0); assert.equal(r.actualMargin, 0)
})
test('valor fixo ignora uma quantidade anterior inválida', () => {
  const input = scenario(); input.labor.mode = 'fixed'; input.labor.quantity = NaN
  assert.equal(valid(input).labor, 50)
})
test('soma múltiplas taxas sobre a venda antes de validar o denominador', () => {
  const input = scenario(); input.margin = 20
  input.fees = [40, 40].map((percent, i) => ({ id: String(i), name: 'Comissão', percent, fixed: 0, base: 'sale' }))
  assert.equal(calculate(input).ok, false)
})
for (const margin of [99, 100]) test(`bloqueia margem + taxas >= 100 (${margin})`, () => {
  const input = scenario(); input.margin = margin; input.fees = [{ id: 'f', name: 'Taxa', percent: 1, fixed: 0, base: 'sale' }]
  assert.equal(calculate(input).ok, false)
})
for (const value of [-1, NaN, Infinity, -Infinity, 10_000_001, 1.001, 0.000000001]) test(`rejeita valor monetário inválido: ${value}`, () => {
  const input = scenario(); input.direct[0].unitPrice = value
  assert.ok(validate(input).some(issue => issue.path === 'direct.0.unitPrice'))
})
test('valida nomes, critérios, quantidades, margem, taxas e modalidades', () => {
  const input = scenario(); input.direct[0].name = ' '; input.direct[0].quantity = 0.0001
  input.indirect = [{ id: 'i', name: 'Custo', quantity: -1, unitPrice: 0, allocation: '' }]
  input.labor = { mode: 'invalid', quantity: NaN, rate: -10 }; input.margin = -1
  input.fees = [{ id: 'f', name: '', percent: 101, fixed: -1, base: 'invalid' }]
  assert.equal(calculate(input).ok, false)
  assert.deepEqual(validate(input).map(issue => issue.path), ['direct.0.name', 'direct.0.quantity', 'indirect.0.quantity', 'indirect.0.allocation', 'labor.mode', 'labor.quantity', 'labor.rate', 'margin', 'fees.0.name', 'fees.0.percent', 'fees.0.fixed', 'fees.0.base'])
})
test('taxas sobre outras bases podem exceder 100% junto da margem', () => {
  const input = scenario(); input.margin = 80; input.fees = [{ id: 'f', name: 'Adicional', percent: 50, fixed: 0, base: 'direct' }]
  assert.equal(valid(input).price, 1250)
})
test('bloqueia total excessivo e divisão quase nula permanece finita', () => {
  const input = scenario(); input.direct[0].quantity = 1_000_000; input.direct[0].unitPrice = 10_000_000
  assert.equal(calculate(input).ok, false)
  const near = scenario(); near.margin = 99.99; assert.equal(valid(near).price, 2_000_000)
})
for (const template of templates) test(`modelo ${template.id} é válido, editável e isolado`, () => {
  const input = createInput(template.id); const other = createInput(template.id)
  assert.equal(valid(input).price, 0); assert.equal(input.fees.length, 0)
  input.direct[0].name = 'Personalizado'; input.direct[0].unitPrice = 50; input.labor.rate = 100
  assert.equal(valid(input).price, 187.5); assert.notEqual(other.direct[0].name, 'Personalizado')
})
test('conservação de centavos e determinismo em cenários variados', () => {
  for (let i = 1; i <= 100; i++) {
    const input = scenario(); input.direct[0].unitPrice = i * 1.13; input.direct[0].unitPrice = Math.round(input.direct[0].unitPrice * 100) / 100
    input.margin = i % 40; input.fees = [{ id: 'f', name: 'Taxa', percent: 3.49, fixed: 0.3, base: 'sale' }]
    const r = valid(input)
    assert.equal(Math.round(r.price * 100), Math.round(r.direct * 100) + Math.round(r.indirect * 100) + Math.round(r.labor * 100) + Math.round(r.fees * 100) + Math.round(r.profit * 100))
    assert.deepEqual(calculate(input), r)
  }
})
