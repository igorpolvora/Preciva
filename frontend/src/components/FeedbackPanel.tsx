import { useState } from 'react'
import { deliverFeedback, downloadText, FEEDBACK_EMAIL, feedbackEmailUrl, prepareFeedback } from '../feedback'
import type { FeedbackMethod } from '../feedback'
import { ArrowUpRight } from 'lucide-react'
import { Button, Card, FormField, Select } from './ui/primitives'

const messages = {
  draft_opened: 'Solicitamos a abertura do seu aplicativo de e-mail. Revise e envie por lá. Se não abriu, copie ou baixe o texto; nenhum recebimento foi confirmado.',
  copied: 'Feedback copiado. Cole no canal que preferir e envie quando quiser.',
  downloaded: 'Arquivo preparado para download. O feedback ainda não foi enviado.',
  failed: 'Não foi possível concluir esta ação. Tente outra opção; seu texto continua aqui.',
}
export function FeedbackPanel({ onPrepared, onEmail }: { onPrepared: () => void; onEmail: () => void }) {
  const [clarity, setClarity] = useState('')
  const [comment, setComment] = useState('')
  const [status, setStatus] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  async function send(method: FeedbackMethod) {
    setStatus('')
    const feedback = prepareFeedback({ clarity, comment })
    if (!feedback.ok) {
      setError(feedback.message)
      document.getElementById('feedback-clarity')?.focus()
      return
    }
    setError('')
    setBusy(true)
    onPrepared()
    if (method === 'email') onEmail()
    const result = await deliverFeedback(method, feedback.text, {
      email: text => { window.location.href = feedbackEmailUrl(text) },
      copy: text => navigator.clipboard.writeText(text),
      download: downloadText,
    })
    setStatus(messages[result])
    setBusy(false)
  }
  return (
    <section className="feedback-section" id="feedback" aria-labelledby="feedback-title">
      <div className="feedback-intro">
        <h2 id="feedback-title">Como foi calcular seu preço?</h2>
        <p>Conte o que funcionou para você e o que podemos melhorar.</p>
      </div>
      <Card as="form" className="feedback-form" noValidate onSubmit={event => { event.preventDefault(); void send('email') }}>
        <FormField id="feedback-clarity" label="Como foi entender a calculadora?" error={error} announceError>
          {attributes => <Select
            {...attributes}
            value={clarity}
            required
            onChange={event => { setClarity(event.target.value); setError(''); setStatus('') }}
          >
            <option value="">Escolha uma opção</option>
            <option value="easy">Fácil de entender</option>
            <option value="regular">Entendi com alguma dificuldade</option>
            <option value="difficult">Difícil de entender</option>
          </Select>}
        </FormField>
        <FormField
          id="feedback-comment"
          label={<>O que podemos melhorar? <span className="optional">(opcional)</span></>}
          hint={`${comment.length}/1.000 caracteres`}
          describedBy="feedback-privacy"
        >
          {attributes => <textarea
            {...attributes}
            className="control"
            rows={3}
            maxLength={1000}
            value={comment}
            onChange={event => { setComment(event.target.value); setStatus('') }}
            placeholder="Ex.: tive dúvida sobre como incluir as taxas."
          />}
        </FormField>
        <p id="feedback-privacy" className="help-text">O feedback inclui apenas sua resposta e seu comentário. Evite escrever dados pessoais ou financeiros.</p>
        <div className="feedback-actions">
          <Button type="submit" variant="primary" disabled={busy}>Preparar e-mail <ArrowUpRight size={16} aria-hidden="true" /></Button>
          <div className="feedback-alternatives" role="group" aria-label="Alternativas ao e-mail">
            <Button variant="text" disabled={busy} onClick={() => void send('copy')}>Copiar texto</Button>
            <Button variant="text" disabled={busy} onClick={() => void send('download')}>Baixar feedback</Button>
          </div>
        </div>
        <p className="help-text feedback-destination">Revise o e-mail no seu aplicativo antes de enviar para <strong>{FEEDBACK_EMAIL}</strong>.</p>
        <p role="status" className="feedback-status">{status}</p>
      </Card>
    </section>
  )
}
