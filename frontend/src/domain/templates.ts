import type { PricingInput } from './pricing'
export const templates = [
  { id: 'music', name: 'Música e eventos', icon: '♫', description: 'Do ensaio ao último bis: considere toda a produção.', costs: ['Transporte', 'Locação de equipamento', 'Equipe de apoio'], indirect: 'Manutenção de equipamentos', allocation: 'Parcela de manutenção atribuída a este evento', mode: 'hour' },
  { id: 'design', name: 'Design e criação', icon: '✎', description: 'Inclua pesquisa, criação, reuniões e revisões.', costs: ['Banco de imagens', 'Impressão e produção'], indirect: 'Software e estrutura', allocation: 'Assinaturas mensais divididas pelos projetos do mês', mode: 'hour' },
  { id: 'beauty', name: 'Beleza e estética', icon: '✧', description: 'Cada atendimento tem tempo, produtos e estrutura.', costs: ['Produtos utilizados', 'Descartáveis'], indirect: 'Espaço e equipamentos', allocation: 'Despesas mensais divididas pelos atendimentos do mês', mode: 'quantity' },
  { id: 'food', name: 'Alimentação', icon: '◒', description: 'Calcule o preço do lote completo de produção.', costs: ['Ingredientes', 'Embalagens', 'Entrega'], indirect: 'Gás, energia e estrutura', allocation: 'Parcela estimada de consumo para este lote', mode: 'hour' },
  { id: 'professional', name: 'Profissionais liberais', icon: '▤', description: 'Valorize preparação, atendimento e acompanhamento.', costs: ['Materiais de atendimento', 'Deslocamento'], indirect: 'Estrutura e administração', allocation: 'Despesas mensais divididas pelos serviços do mês', mode: 'hour' },
  { id: 'technical', name: 'Serviços técnicos', icon: '⚒', description: 'Inclua diagnóstico, execução e materiais da instalação.', costs: ['Peças e materiais', 'Deslocamento'], indirect: 'Ferramentas e estrutura', allocation: 'Parcela de desgaste das ferramentas por serviço', mode: 'fixed' },
  { id: 'custom', name: 'Personalizado', icon: '＋', description: 'Monte um modelo com os custos da sua atividade.', costs: ['Custo personalizado'], indirect: 'Despesa indireta', allocation: 'Parcela atribuída ao trabalho; edite o critério', mode: 'fixed' },
] as const
export type TemplateId = typeof templates[number]['id']
export function createInput(id: TemplateId): PricingInput {
  const template = templates.find(t => t.id === id)!
  return {
    direct: template.costs.map((name, i) => ({ id: `direct-${i}`, name, quantity: 1, unitPrice: 0 })),
    indirect: [{ id: 'indirect-0', name: template.indirect, quantity: 1, unitPrice: 0, allocation: template.allocation }],
    labor: { mode: template.mode, quantity: 1, rate: 0 }, fees: [], margin: 20,
  }
}
