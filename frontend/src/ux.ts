import type { Issue, PricingInput, calculate } from './domain/pricing'
import type { Draft } from './experience'

export const steps = [
  { id: 'costs', label: 'Custos' },
  { id: 'work', label: 'Trabalho' },
  { id: 'rates', label: 'Taxas e margem' },
] as const
export type Step = typeof steps[number]['id']
export function resultPresentation(result: ReturnType<typeof calculate>, zeroConfirmed = false) {
  if (!result.ok) return 'invalid'
  return result.price > 0 || zeroConfirmed ? 'ready' : 'initial'
}
export function stepIsValid(step: Step, issues: Issue[]) {
  const groups = { costs: ['direct', 'indirect'], work: ['labor'], rates: ['fees', 'margin'] }
  return !issues.some(issue => issue.path === 'total' || groups[step].includes(issue.path.split('.')[0]))
}
function signature(input: PricingInput, step: Step) {
  return JSON.stringify(step === 'costs' ? [input.direct, input.indirect] : step === 'work' ? input.labor : [input.fees, input.margin])
}
export function stepIsComplete(draft: Draft, step: Step, issues: Issue[]) {
  return stepIsValid(step, issues) && draft.reviewedSteps?.[step] === signature(draft.input, step)
}
export function confirmStep(draft: Draft, step: Step, issues: Issue[]): Draft {
  if (!stepIsValid(step, issues)) return draft
  return { ...draft, reviewedSteps: { ...draft.reviewedSteps, [step]: signature(draft.input, step) } }
}
export function visibleStep(positions: { id: Step; top: number }[], offset = 140): Step {
  return positions.filter(position => position.top <= offset).at(-1)?.id ?? 'costs'
}
