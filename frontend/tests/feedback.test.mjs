import test from 'node:test'
import assert from 'node:assert/strict'
import { prepareFeedback, feedbackEmailUrl, FEEDBACK_EMAIL, deliverFeedback } from '../src/feedback.ts'

test('feedback exige opção de clareza, limita comentário e aceita comentário vazio', () => {
  assert.equal(prepareFeedback({ clarity: '', comment: 'Olá' }).ok, false)
  assert.equal(prepareFeedback({ clarity: 'outra', comment: '' }).ok, false)
  assert.equal(prepareFeedback({ clarity: 'easy', comment: 'a'.repeat(1001) }).ok, false)
  assert.equal(prepareFeedback({ clarity: 'easy', comment: 'a'.repeat(1000) }).ok, true)
  assert.ok(prepareFeedback({ clarity: 'regular', comment: ' ' }).text.includes('(sem comentário)'))
})
test('feedback não anexa campos da calculadora nem metadados extras', () => {
  const feedback = prepareFeedback({ clarity: 'easy', comment: '  Gostei da explicação!  ', price: 1234, costs: 'privado', email: 'não anexar' })
  assert.equal(feedback.ok, true)
  assert.ok(feedback.text.includes('\nComentário: Gostei da explicação!\n'))
  assert.ok(!feedback.text.includes('1234')); assert.ok(!feedback.text.includes('privado')); assert.ok(!feedback.text.includes('não anexar'))
})
test('mailto usa somente destinatário autorizado e codifica assunto/corpo', () => {
  const text = 'Preço & dúvida?\nGostei do café #1'
  const url = feedbackEmailUrl(text)
  assert.ok(url.startsWith(`mailto:${FEEDBACK_EMAIL}?subject=`))
  const params = new URLSearchParams(url.split('?')[1])
  assert.equal(FEEDBACK_EMAIL, 'precivacontact@gmail.com')
  assert.equal(params.get('body'), text); assert.equal(params.get('subject'), 'Feedback Preciva')
  assert.equal([...params.keys()].length, 2)
})
for (const [method, expected] of [['email', 'draft_opened'], ['copy', 'copied'], ['download', 'downloaded']]) test(`feedback: ${method} aciona somente o destino escolhido`, async () => {
  const calls = []
  const ports = { email: text => calls.push(['email', text]), copy: async text => { calls.push(['copy', text]) }, download: text => calls.push(['download', text]) }
  assert.equal(await deliverFeedback(method, 'Texto revisado', ports), expected)
  assert.deepEqual(calls, [[method, 'Texto revisado']])
})
test('falha do clipboard ou do aplicativo não afirma envio bem-sucedido', async () => {
  const fail = () => { throw new Error('Indisponível') }
  const ports = { email: fail, copy: async () => fail(), download: fail }
  for (const method of ['email', 'copy', 'download']) assert.equal(await deliverFeedback(method, 'Texto', ports), 'failed')
})
