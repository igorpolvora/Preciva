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
  const themePicker = html.match(/<label class="theme-picker">([\s\S]*?)<\/label>/)?.[1] ?? ''
  assert.match(themePicker, /Tema da interface/)
  assert.match(themePicker, /<svg[^>]*theme-icon[^>]*aria-hidden="true"/)
  assert.match(themePicker, /<option value="system" selected="">Sistema<\/option>/)
  assert.match(themePicker, /<option value="light">Claro<\/option>/)
  assert.match(themePicker, /<option value="dark">Escuro<\/option>/)
  const cards = html.match(/<button\b[^>]*\baria-pressed="(?:true|false)"[^>]*>[\s\S]*?<\/button>/g) ?? []
  assert.equal(cards.length, 7)
  assert.equal(cards.filter(card => card.includes('aria-pressed="true"')).length, 1)
  for (const text of ['Personalizado', 'Música e eventos', 'Design e criação', 'Beleza e estética', 'Alimentação', 'Profissionais liberais', 'Serviços técnicos']) {
    const card = cards.find(button => button.includes(text)) ?? ''
    assert.match(card, /<svg\b(?=[^>]*template-icon)(?=[^>]*aria-hidden="true")/, text)
    assert.equal(card.includes('selection-check'), card.includes('aria-pressed="true"'), text)
  }
  for (const id of ['costs', 'work', 'rates', 'result', 'feedback', 'feedback-clarity']) assert.ok(html.includes(`id="${id}"`), id)
  assert.ok(html.includes('href="#costs"')); assert.ok(html.includes('href="#work"')); assert.ok(html.includes('href="#rates"'))
  assert.ok(html.includes('for="labor.rate"')); assert.ok(html.includes('aria-describedby='))
  assert.ok(html.includes('precivacontact@gmail.com')); assert.ok(html.includes('Copiar texto')); assert.ok(html.includes('Baixar feedback'))
  assert.ok(!html.includes('type="checkbox" checked'))
  assert.ok(!html.includes('class="price"'), 'o painel inicial não deve apresentar um preço válido')
  assert.ok(html.includes('Seu preço começa aqui'))
  assert.match(html, /class="mobile-result-value">Aguardando valores</)
  assert.ok(!html.includes('class="composition-bar"'))
  assert.equal((html.match(/aria-current="step"/g) || []).length, 1)
  assert.ok(!html.includes('✓ Etapa concluída'), 'valores padrão não concluem etapas')
  const submitButton = html.match(/<button\b[^>]*type="submit"[^>]*>[\s\S]*?<\/button>/)?.[0] ?? ''
  assert.match(submitButton, /Conferir meu preço/)
  assert.equal((submitButton.match(/Conferir meu preço/g) || []).length, 1)
  assert.match(submitButton, /aria-hidden="true"/)
  const { InteractiveHoverButton } = await server.ssrLoadModule('/src/components/ui/interactive-hover-button.tsx')
  const standaloneButton = renderToStaticMarkup(createElement(InteractiveHoverButton, { text: 'Continuar', disabled: true, className: 'px-6' }))
  assert.match(standaloneButton, /<button[^>]*disabled=""[^>]*type="button"/)
  assert.match(standaloneButton, /\bpx-6\b/)
  assert.doesNotMatch(standaloneButton, /\bpx-4\b/)
  const { ResultPanel } = await server.ssrLoadModule('/src/components/ResultPanel.tsx')
  const input = createInput('custom'); input.direct[0].unitPrice = 100
  const result = renderToStaticMarkup(createElement(ResultPanel, { input, attempted: true })).replaceAll('\u00a0', ' ')
  assert.ok(result.includes('R$ 125,00')); assert.ok(result.includes('R$ 25,00')); assert.ok(result.includes('Sua remuneração')); assert.ok(result.includes('Lucro projetado'))
  assert.match(result, /class="composition-bar" aria-hidden="true"/)
  const zeroInput = createInput('custom')
  const initialZero = renderToStaticMarkup(createElement(ResultPanel, { input: zeroInput, attempted: true }))
  assert.ok(!initialZero.includes('class="price"'), 'conferir sozinho não confirma zero')
  const confirmedZero = renderToStaticMarkup(createElement(ResultPanel, { input: zeroInput, attempted: true, zeroConfirmed: true })).replaceAll('\u00a0', ' ')
  assert.ok(confirmedZero.includes('class="price"'))
  assert.ok(confirmedZero.includes('0,00'))
  assert.ok(!confirmedZero.includes('class="composition-bar"'))
  assert.ok(confirmedZero.includes('Simulação de preço zero confirmada'))
  const { StepNavigation } = await server.ssrLoadModule('/src/components/StepNavigation.tsx')
  const reviewed = confirmStep(createDraft('custom'), 'costs', [])
  const navigation = renderToStaticMarkup(createElement(StepNavigation, { active: 'work', onSelect: () => {}, draft: reviewed, issues: [] }))
  assert.ok(navigation.includes('Concluída'))
  assert.ok(navigation.includes('href="#work" aria-current="step"'))
  assert.equal((navigation.match(/aria-current="step"/g) || []).length, 1)
  const stepLinks = navigation.match(/<li><a\b[\s\S]*?<\/a><\/li>/g) ?? []
  assert.equal(stepLinks.length, 3)
  assert.match(stepLinks[0], /lucide-check/)
  assert.match(stepLinks[0], /Concluída/)
  assert.match(stepLinks[1], /Em edição/)
  assert.match(stepLinks[2], /A revisar/)
  const reviewing = renderToStaticMarkup(createElement(StepNavigation, { active: 'costs', onSelect: () => {}, draft: reviewed, issues: [] }))
  assert.match(reviewing, /href="#costs" aria-current="step"[^<]*>[\s\S]*?Concluída<\/small>/)
  const invalidated = renderToStaticMarkup(createElement(StepNavigation, { active: 'work', onSelect: () => {}, draft: reviewed, issues: [{ path: 'direct.0.name', message: 'Informe a descrição.' }] }))
  assert.ok(!invalidated.includes('Concluída'))
  input.margin = 100
  const invalid = renderToStaticMarkup(createElement(ResultPanel, { input, attempted: true }))
  assert.ok(invalid.includes('Preço indisponível')); assert.ok(invalid.includes('Margem desejada')); assert.ok(!invalid.includes('class="price"'))
})

