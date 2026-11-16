import type { PricingInput } from './domain/pricing'
import { createInput } from './domain/templates.ts'
import type { TemplateId } from './domain/templates'

export type Draft = { input: PricingInput; raw: Record<string, string>; zeroConfirmed?: boolean; reviewedSteps?: Partial<Record<'costs' | 'work' | 'rates', string>> }
export function createDraft(id: TemplateId): Draft { return { input: createInput(id), raw: {} } }
export function createDrafts(): Record<TemplateId, Draft> {
  return { music: createDraft('music'), design: createDraft('design'), beauty: createDraft('beauty'), food: createDraft('food'), professional: createDraft('professional'), technical: createDraft('technical'), custom: createDraft('custom') }
}
// Parsing belongs to the form. The financial engine remains unchanged.
export function parseDecimal(raw: string): number {
  return /^\d+(?:[.,]\d+)?$/.test(raw) ? Number(raw.replace(',', '.')) : NaN
}
export function editDraft(draft: Draft, input: PricingInput, key?: string, raw?: string): Draft {
  return { ...draft, input, zeroConfirmed: false, raw: key === undefined ? draft.raw : { ...draft.raw, [key]: raw ?? '' } }
}
export const money = (value: number) => value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
export const decimal = (value: number, maximumFractionDigits = 3) => value.toLocaleString('pt-BR', { maximumFractionDigits })
export const fraction = (percentage: number) => decimal(percentage / 100, 4)

export const feeBases = { sale: 'Preço de venda (receita)', direct: 'Somente custos diretos', labor: 'Somente sua remuneração', subtotal: 'Diretos + indiretos + remuneração' } as const

