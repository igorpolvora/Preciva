import test from 'node:test'
import assert from 'node:assert/strict'
import { calculate } from '../src/domain/pricing.ts'
import { createInput } from '../src/domain/templates.ts'

const cost = (name, quantity, unitPrice) => ({ id: name, name, quantity, unitPrice })
const indirect = (name, value, allocation) => ({ ...cost(name, 1, value), allocation })
const fee = (name, percent, fixed = 0) => ({ id: name, name, percent, fixed, base: 'sale' })

const cases = [
  {
    name: 'cantor de eventos', template: 'music',
    direct: [cost('Transporte', 1, 150), cost('Equipamento', 1, 300), cost('Equipe', 1, 250)],
    indirect: [indirect('Manutenção', 100, 'R$ 1.000 mensais / 10 eventos')],
    labor: { mode: 'hour', quantity: 6, rate: 100 },
    fees: [fee('Comissão', 10), fee('Taxa sobre receita', 5, 25)], margin: 20,
    expected: { direct: 700, indirect: 100, labor: 600, subtotal: 1400, price: 2192.31, fees: 353.85, profit: 438.46 },
  },
  {
    name: 'designer', template: 'design',
    direct: [cost('Imagens', 1, 60), cost('Impressão', 1, 40)],
    indirect: [indirect('Software e estrutura', 120, 'R$ 600 mensais / 5 projetos')],
    labor: { mode: 'hour', quantity: 12, rate: 80 },
    fees: [fee('Taxa sobre receita', 6, 10)], margin: 30,
    expected: { direct: 100, indirect: 120, labor: 960, subtotal: 1180, price: 1859.38, fees: 121.56, profit: 557.82 },
  },
  {
    name: 'confeiteiro (lote de 20 unidades)', template: 'food',
    direct: [cost('Ingrediente A (kg)', 2, 40), cost('Chocolate (kg)', 1.5, 30), cost('Embalagens', 20, 0.75)],
    indirect: [indirect('Gás e energia', 25, 'Consumo estimado para este lote')],
    labor: { mode: 'hour', quantity: 4, rate: 35 },
    fees: [fee('Cartão', 5, 2)], margin: 25,
    expected: { direct: 140, indirect: 25, labor: 140, subtotal: 305, price: 438.58, fees: 23.93, profit: 109.65 },
  },
]
for (const { name, template, expected, ...values } of cases) test(`homologação financeira: ${name}`, () => {
  const input = { ...createInput(template), ...values }
  const result = calculate(input)
  assert.equal(result.ok, true)
  for (const [key, value] of Object.entries(expected)) assert.equal(result[key], value, key)
  assert.ok(Math.abs(result.actualMargin - input.margin) < 0.01)
})

test('margem de 20% difere de markup de 20%', () => {
  const input = createInput('custom'); input.direct = [cost('Material', 1, 100)]
  const result = calculate(input)
  assert.equal(result.ok, true); assert.equal(result.price, 125); assert.equal(result.profit, 25)
  assert.notEqual(result.price, 120)
})

test('não recomenda preço com prejuízo decorrente de arredondamentos por taxa', () => {
  const input = createInput('custom'); input.direct = [cost('Material', 1, 0.01)]
  input.margin = 0; input.fees = [fee('Taxa A', 25), fee('Taxa B', 25)]
  const result = calculate(input)
  assert.equal(result.ok, false)
  assert.ok(result.issues.some(issue => issue.path === 'total' && issue.message.includes('arredondamento')))
})
