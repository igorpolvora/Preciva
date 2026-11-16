export const clarityOptions = ['easy', 'regular', 'difficult'] as const
export type Clarity = typeof clarityOptions[number]
export type Feedback = { clarity: string; comment: string }
const labels: Record<Clarity, string> = { easy: 'Fácil de entender', regular: 'Entendi com alguma dificuldade', difficult: 'Difícil de entender' }
export function prepareFeedback(input: Feedback): { ok: true; text: string } | { ok: false; message: string } {
  if (!clarityOptions.includes(input.clarity as Clarity)) return { ok: false, message: 'Escolha como foi entender a calculadora.' }
  if (input.comment.trim().length > 1000) return { ok: false, message: 'Use até 1.000 caracteres no comentário.' }
  return { ok: true, text: `Feedback voluntário — Preciva\nClareza: ${labels[input.clarity as Clarity]}\nComentário: ${input.comment.trim() || '(sem comentário)'}\n\nNenhum dado da calculadora foi anexado automaticamente.` }
}
export const FEEDBACK_EMAIL = 'precivacontact@gmail.com'
export const feedbackEmailUrl = (text: string) => "mailto:" + FEEDBACK_EMAIL + '?subject=' + encodeURIComponent('Feedback Preciva') + '&body=' + encodeURIComponent(text)
export type FeedbackMethod = 'email' | 'copy' | 'download'
export type FeedbackPorts = { email: (text: string) => void; copy: (text: string) => Promise<void>; download: (text: string) => void }
export async function deliverFeedback(method: FeedbackMethod, text: string, ports: FeedbackPorts): Promise<'draft_opened' | 'copied' | 'downloaded' | 'failed'> {
  try {
    if (method === 'email') { ports.email(text); return 'draft_opened' }
    if (method === 'copy') { await ports.copy(text); return 'copied' }
    ports.download(text)
    return 'downloaded'
  } catch {
    return 'failed'
  }
}

export function downloadText(text: string) {
  const url = URL.createObjectURL(new Blob([text], { type: 'text/plain;charset=utf-8' }))
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = 'feedback-preciva.txt'
  document.body.append(anchor)
  anchor.click()
  anchor.remove()
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}

