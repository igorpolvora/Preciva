import type { PricingInput } from './domain/pricing'

export function fieldLabel(input: PricingInput, path: string): string {
  const [group, index, field] = path.split('.')
  const labels: Record<string, string> = {
    name: 'Descrição', quantity: 'Quantidade', unitPrice: 'Valor unitário',
    allocation: 'Critério de rateio', percent: 'Percentual', fixed: 'Valor fixo', base: 'Base de incidência',
  }
  if (group === 'direct' || group === 'indirect' || group === 'fees') {
    const item = input[group][Number(index)]
    const category = { direct: 'Custo direto', indirect: 'Despesa indireta', fees: 'Taxa' }[group]
    return `${category} ${Number(index) + 1}${item?.name.trim() ? ` (${item.name})` : ''} — ${labels[field] || field}`
  }
  const laborLabels: Record<string, string> = { mode: 'Modalidade de remuneração', quantity: 'Quantidade de trabalho', rate: 'Valor da remuneração' }
  const commonLabels: Record<string, string> = { margin: 'Margem desejada', total: 'Resultado do cálculo' }
  return (group === 'labor' ? laborLabels[index] : commonLabels[path]) || path
}
