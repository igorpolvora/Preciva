import test from 'node:test'
import assert from 'node:assert/strict'
import { createUsageRecorder } from '../src/usage.ts'

test('eventos ficam desativados por padrão e não recuperam ações anteriores à permissão', () => {
  const recorder = createUsageRecorder()
  recorder.record('calculation_started', 'music')
  assert.deepEqual(recorder.snapshot(), [])
  recorder.setEnabled(true)
  recorder.record('calculation_completed', 'music')
  assert.deepEqual(recorder.snapshot(), [])
})
test('início e conclusão são únicos por modelo e ciclo; reinício permite outro ciclo', () => {
  const recorder = createUsageRecorder(); recorder.setEnabled(true)
  for (let i = 0; i < 3; i++) recorder.record('calculation_started', 'music')
  for (let i = 0; i < 3; i++) recorder.record('calculation_completed', 'music')
  assert.deepEqual(recorder.snapshot().map(event => event.name), ['calculation_started', 'calculation_completed'])
  recorder.record('calculation_started', 'design')
  recorder.record('calculation_reset', 'music')
  recorder.record('calculation_started', 'music')
  recorder.record('calculation_completed', 'music')
  assert.equal(recorder.snapshot().filter(event => event.name === 'calculation_completed').length, 2)
})
test('schema fechado ignora parâmetros financeiros, textos e eventos desconhecidos', () => {
  const recorder = createUsageRecorder(); recorder.setEnabled(true)
  recorder.record('calculation_started', 'food', { price: 999, name: 'segredo', comment: 'privado' })
  recorder.record('unknown', 'food')
  recorder.record('template_selected', 'segredo')
  assert.deepEqual(recorder.snapshot(), [{ schemaVersion: 1, name: 'calculation_started', segment: 'food' }])
})
test('revogar permissão apaga eventos e estado de jornada', () => {
  const recorder = createUsageRecorder(); recorder.setEnabled(true)
  recorder.record('calculation_started', 'custom')
  recorder.setEnabled(false)
  recorder.record('feedback_prepared', 'custom')
  assert.deepEqual(recorder.snapshot(), [])
  recorder.setEnabled(true)
  recorder.record('calculation_completed', 'custom')
  assert.deepEqual(recorder.snapshot(), [])
})
test('buffer limitado a 200 eventos e snapshots não alteram os dados internos', () => {
  const recorder = createUsageRecorder(); recorder.setEnabled(true)
  for (let i = 0; i < 250; i++) recorder.record('template_selected', 'beauty')
  const snapshot = recorder.snapshot()
  assert.equal(snapshot.length, 200)
  snapshot[0].name = 'calculation_completed'; snapshot.pop()
  assert.equal(recorder.snapshot().length, 200)
  assert.equal(recorder.snapshot()[0].name, 'template_selected')
})
