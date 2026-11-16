import test from 'node:test'
import assert from 'node:assert/strict'
import { calculate } from '../src/domain/pricing.ts'
import { createDraft, editDraft } from '../src/experience.ts'
import { resultPresentation, confirmStep, stepIsComplete, stepIsValid, visibleStep } from '../src/ux.ts'

const issues = draft => { const result = calculate(draft.input); return result.ok ? [] : result.issues }

test('início orienta preenchimento; clicar em conferir não torna zero intencional', () => {
  const draft = createDraft('music')
  assert.equal(calculate(draft.input).price, 0)
  assert.equal(resultPresentation(calculate(draft.input)), 'initial')
  assert.equal(resultPresentation(calculate(draft.input), false), 'initial')
})
test('zero matematicamente válido exige confirmação; erros nunca são contornados', () => {
  const draft = createDraft('custom')
  assert.equal(resultPresentation(calculate(draft.input), true), 'ready')
  draft.input.margin = 100
  assert.equal(resultPresentation(calculate(draft.input), true), 'invalid')
})
test('preço positivo continua automático, sem exigir confirmação de zero ou etapas', () => {
  const draft = createDraft('design'); draft.input.labor.rate = 80
  assert.equal(resultPresentation(calculate(draft.input)), 'ready')
})
test('qualquer edição financeira ou descritiva solicita nova confirmação de zero', () => {
  const draft = { ...createDraft('custom'), zeroConfirmed: true }
  const edited = editDraft(draft, { ...draft.input, margin: 30 }, 'margin', '30')
  assert.equal(edited.zeroConfirmed, false)
  assert.equal(draft.zeroConfirmed, true)
})
test('etapas não nascem concluídas só porque valores padrão são válidos', () => {
  const draft = createDraft('music')
  for (const step of ['costs', 'work', 'rates']) assert.equal(stepIsComplete(draft, step, issues(draft)), false)
})
test('conclusão exige revisão explícita e invalida somente a etapa com dados diferentes', () => {
  let draft = createDraft('music')
  for (const step of ['costs', 'work', 'rates']) draft = confirmStep(draft, step, issues(draft))
  for (const step of ['costs', 'work', 'rates']) assert.equal(stepIsComplete(draft, step, issues(draft)), true)
  draft = editDraft(draft, { ...draft.input, labor: { ...draft.input.labor, rate: 90 } })
  assert.equal(stepIsComplete(draft, 'costs', issues(draft)), true)
  assert.equal(stepIsComplete(draft, 'work', issues(draft)), false)
  assert.equal(stepIsComplete(draft, 'rates', issues(draft)), true)
})
test('erros de campo ou total bloqueiam revisão sem esconder erros de outra etapa', () => {
  let draft = createDraft('music')
  draft.input.direct[0].name = ''
  assert.equal(stepIsValid('costs', issues(draft)), false)
  assert.equal(stepIsValid('work', issues(draft)), true)
  draft = confirmStep(draft, 'costs', issues(draft))
  assert.equal(stepIsComplete(draft, 'costs', issues(draft)), false)
  for (const step of ['costs', 'work', 'rates']) assert.equal(stepIsValid(step, [{ path: 'total', message: 'Limite excedido' }]), false)
})
test('reinício descarta revisões e confirmação de zero', () => {
  const reviewed = confirmStep({ ...createDraft('custom'), zeroConfirmed: true }, 'rates', [])
  assert.equal(stepIsComplete(reviewed, 'rates', []), true)
  const reset = createDraft('custom')
  assert.equal(stepIsComplete(reset, 'rates', []), false)
  assert.equal(reset.zeroConfirmed, undefined)
})
test('etapa visível usa o limite da navegação e mantém ordem das seções', () => {
  assert.equal(visibleStep([{ id: 'costs', top: 700 }, { id: 'work', top: 1500 }, { id: 'rates', top: 2000 }]), 'costs')
  assert.equal(visibleStep([{ id: 'costs', top: -900 }, { id: 'work', top: 120 }, { id: 'rates', top: 900 }]), 'work')
  assert.equal(visibleStep([{ id: 'costs', top: -1500 }, { id: 'work', top: -200 }, { id: 'rates', top: 140 }]), 'rates')
})
