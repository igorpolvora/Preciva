import test from 'node:test'
import assert from 'node:assert/strict'
import { createDrafts, createDraft, editDraft, parseDecimal } from '../src/experience.ts'
import { calculate } from '../src/domain/pricing.ts'

test('entrada decimal aceita vírgula e ponto sem transformar milhar em valor errado', () => {
  assert.equal(parseDecimal('1250,50'), 1250.5)
  assert.equal(parseDecimal('1250.50'), 1250.5)
  assert.equal(parseDecimal('0'), 0)
  for (const raw of ['', ' ', '-1', '1.250,50', '1,250.50', '1e3', 'Infinity', '2,']) assert.ok(Number.isNaN(parseDecimal(raw)), raw)
})
test('entrada com precisão excessiva continua bloqueada pelo motor preservado', () => {
  const draft = createDraft('custom')
  draft.input.direct[0].unitPrice = parseDecimal('1,001')
  assert.equal(calculate(draft.input).ok, false)
})
test('rascunhos por atividade mantêm dados e texto inválido sem contaminar outros modelos', () => {
  const drafts = createDrafts()
  const original = drafts.music
  const input = { ...original.input, margin: parseDecimal('2,') }
  drafts.music = editDraft(original, input, 'margin', '2,')
  assert.equal(drafts.music.raw.margin, '2,')
  assert.ok(Number.isNaN(drafts.music.input.margin))
  assert.equal(drafts.design.input.margin, 20)
  assert.equal(original.input.margin, 20)
  assert.deepEqual(original.raw, {})
  drafts.design = editDraft(drafts.design, { ...drafts.design.input, margin: 35 }, 'margin', '35')
  assert.equal(drafts.music.raw.margin, '2,')
  drafts.music = createDraft('music')
  assert.equal(drafts.music.input.margin, 20)
  assert.deepEqual(drafts.music.raw, {})
  assert.equal(drafts.design.input.margin, 35)
})
test('chaves de edição por ID sobrevivem à remoção de uma linha anterior', () => {
  const draft = createDraft('music')
  const key = `direct-${draft.input.direct[1].id}-price`
  const changed = editDraft(draft, draft.input, key, '123,40')
  const removed = editDraft(changed, { ...changed.input, direct: changed.input.direct.slice(1) })
  assert.equal(removed.raw[key], '123,40')
  assert.equal(removed.input.direct[0].id, draft.input.direct[1].id)
})
