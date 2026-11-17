import test from 'node:test'
import assert from 'node:assert/strict'
import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { createServer } from 'vite'

test('primitivos preservam semântica nativa, estados e associações de campo', async t => {
  const server = await createServer({ server: { middlewareMode: true, hmr: false }, appType: 'custom' })
  t.after(() => server.close())
  const { Button, Card, FormField, Input, Select } = await server.ssrLoadModule('/src/components/ui/primitives.tsx')
  const render = (component, props, children) => renderToStaticMarkup(createElement(component, props, children))

  const action = render(Button, { variant: 'danger', disabled: true }, 'Reiniciar')
  assert.match(action, /<button type="button"/)
  assert.match(action, /class="button danger-button"/)
  assert.match(action, /disabled=""/)
  assert.match(render(Button, { type: 'submit' }, 'Enviar'), /<button type="submit"/)
  assert.match(render(Card, { as: 'form', noValidate: true }), /^<form\b/)
  assert.match(render(Card, { 'aria-label': 'Custos' }), /^<section\b/)

  const errorField = render(FormField, {
    id: 'direct.0.quantity', label: 'Quantidade', hint: 'Use unidades.', error: 'Revise a quantidade.',
  }, attributes => createElement(Input, { ...attributes, inputMode: 'decimal' }))
  assert.match(errorField, /for="direct\.0\.quantity"/)
  assert.match(errorField, /<input[^>]*aria-invalid="true"/)
  assert.match(errorField, /aria-describedby="direct\.0\.quantity-error direct\.0\.quantity-hint"/)
  assert.match(errorField, /id="direct\.0\.quantity-error">Revise a quantidade\./)
  assert.match(errorField, /id="direct\.0\.quantity-hint">Use unidades\./)

  const choice = render(FormField, { id: 'clarity', label: 'Clareza' }, attributes =>
    createElement(Select, { ...attributes, required: true }, createElement('option', { value: 'easy' }, 'Fácil')))
  assert.match(choice, /<select[^>]*id="clarity"[^>]*required=""/)
  assert.match(choice, /<option value="easy">Fácil<\/option>/)
  assert.match(choice, /<svg[^>]*aria-hidden="true"/)
  assert.doesNotMatch(choice, /aria-invalid|aria-describedby/)
})
