import test from 'node:test'
import assert from 'node:assert/strict'
import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { createServer } from 'vite'
import { createInput } from '../src/domain/templates.ts'
import { createDraft } from '../src/experience.ts'
import { confirmStep } from '../src/ux.ts'

test('renderização dos componentes preserva navegação, campos acessíveis e composição', async t => {
  // Server rendering is a component check, not a browser or visual test.
  const server = await createServer({ server: { middlewareMode: true, hmr: false }, appType: 'custom' })
  t.after(async () => server.close())
  const { default: App } = await server.ssrLoadModule('/src/App.tsx')
  const html = renderToStaticMarkup(createElement(App))
  assert.equal((html.match(/aria-pressed="true"/g) || []).length, 1)
  for (const text of ['Personalizado', 'Música e eventos', 'Design e criação', 'Beleza e estética', 'Alimentação', 'Profissionais liberais', 'Serviços técnicos']) assert.ok(html.includes(text), text)
  for (const id of ['costs', 'work', 'rates', 'result', 'feedback', 'feedback-clarity']) assert.ok(html.includes(`id="${id}"`), id)
  assert.ok(html.includes('href="#costs"')); assert.ok(html.includes('href="#work"')); assert.ok(html.includes('href="#rates"'))
  assert.ok(html.includes('for="labor.rate"')); assert.ok(html.includes('aria-describedby='))
  assert.ok(html.includes('precivacontact@gmail.com')); assert.ok(html.includes('Copiar texto')); assert.ok(html.includes('Baixar feedback'))
  assert.ok(!html.includes('type="checkbox" checked'))
  assert.ok(!html.includes('class="price"'), 'o painel inicial não deve apresentar um preço válido')
  assert.ok(html.includes('Seu preço começa aqui'))
  assert.equal((html.match(/aria-current="step"/g) || []).length, 1)
  assert.ok(!html.includes('✓ Etapa concluída'), 'valores padrão não concluem etapas')
  const { ResultPanel } = await server.ssrLoadModule('/src/components/ResultPanel.tsx')
  const input = createInput('custom'); input.direct[0].unitPrice = 100
  const result = renderToStaticMarkup(createElement(ResultPanel, { input, attempted: true })).replaceAll('\u00a0', ' ')
  assert.ok(result.includes('R$ 125,00')); assert.ok(result.includes('R$ 25,00')); assert.ok(result.includes('Sua remuneração')); assert.ok(result.includes('Lucro projetado'))
  const zeroInput = createInput('custom')
  const initialZero = renderToStaticMarkup(createElement(ResultPanel, { input: zeroInput, attempted: true }))
  assert.ok(!initialZero.includes('class="price"'), 'conferir sozinho não confirma zero')
  const confirmedZero = renderToStaticMarkup(createElement(ResultPanel, { input: zeroInput, attempted: true, zeroConfirmed: true })).replaceAll('\u00a0', ' ')
  assert.ok(confirmedZero.includes('class="price"'))
  assert.ok(confirmedZero.includes('0,00'))
  assert.ok(confirmedZero.includes('Simulação de preço zero confirmada'))
  const { StepNavigation } = await server.ssrLoadModule('/src/components/StepNavigation.tsx')
  const reviewed = confirmStep(createDraft('custom'), 'costs', [])
  const navigation = renderToStaticMarkup(createElement(StepNavigation, { active: 'work', onSelect: () => {}, draft: reviewed, issues: [] }))
  assert.ok(navigation.includes('Concluída'))
  assert.ok(navigation.includes('href="#work" aria-current="step"'))
  assert.equal((navigation.match(/aria-current="step"/g) || []).length, 1)
  input.margin = 100
  const invalid = renderToStaticMarkup(createElement(ResultPanel, { input, attempted: true }))
  assert.ok(invalid.includes('Preço indisponível')); assert.ok(invalid.includes('Margem desejada')); assert.ok(!invalid.includes('class="price"'))
})

