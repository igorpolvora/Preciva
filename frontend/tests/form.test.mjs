import test from 'node:test'
import assert from 'node:assert/strict'
import { fieldLabel } from '../src/form.ts'
import { createInput } from '../src/domain/templates.ts'

test('erros identificam categoria, linha, descrição e campo', () => {
  const input = createInput('music')
  assert.equal(fieldLabel(input, 'direct.0.unitPrice'), 'Custo direto 1 (Transporte) — Valor unitário')
  assert.equal(fieldLabel(input, 'indirect.0.allocation'), 'Despesa indireta 1 (Manutenção de equipamentos) — Critério de rateio')
  input.direct[0].name = ' '
  assert.equal(fieldLabel(input, 'direct.0.name'), 'Custo direto 1 — Descrição')
  input.fees = [{ id: 'f', name: 'Cartão', percent: 5, base: 'sale', fixed: 0 }]
  assert.equal(fieldLabel(input, 'fees.0.percent'), 'Taxa 1 (Cartão) — Percentual')
})
test('erros gerais e de remuneração têm nomes compreensíveis', () => {
  const input = createInput('custom')
  assert.equal(fieldLabel(input, 'margin'), 'Margem desejada')
  assert.equal(fieldLabel(input, 'labor.rate'), 'Valor da remuneração')
  assert.equal(fieldLabel(input, 'total'), 'Resultado do cálculo')
})
