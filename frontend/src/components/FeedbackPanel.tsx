import { useState } from 'react'
import { deliverFeedback, downloadText, FEEDBACK_EMAIL, feedbackEmailUrl, prepareFeedback } from '../feedback'
import type { FeedbackMethod } from '../feedback'

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
  return <section className="feedback-section" id="feedback" aria-labelledby="feedback-title">
    <div className="feedback-intro"><span className="eyebrow">CONSTRUÍDO COM QUEM TRABALHA</span><h2 id="feedback-title">Fez sentido para você?</h2><p>Seu olhar ajuda a melhorar o Preciva. Leva um minuto, é voluntário e não precisa de cadastro.</p><p className="help-text">Destino: <strong>{FEEDBACK_EMAIL}</strong>. Você revisa e confirma o envio no seu aplicativo de e-mail.</p></div>
    <form className="feedback-form" noValidate onSubmit={event => { event.preventDefault(); void send('email') }}>
      <div className="field"><label htmlFor="feedback-clarity">Como foi entender a calculadora?</label><select id="feedback-clarity" value={clarity} aria-invalid={!!error} aria-describedby={error ? 'feedback-error' : 'feedback-privacy'} onChange={event => { setClarity(event.target.value); setError(''); setStatus('') }}><option value="">Escolha uma opção</option><option value="easy">Fácil de entender</option><option value="regular">Entendi com alguma dificuldade</option><option value="difficult">Difícil de entender</option></select></div>
      <div className="field"><label htmlFor="feedback-comment">O que podemos melhorar? <span className="optional">(opcional)</span></label><textarea id="feedback-comment" rows={4} maxLength={1000} value={comment} aria-describedby="feedback-privacy feedback-count" onChange={event => { setComment(event.target.value); setStatus('') }} placeholder="Conte qual parte ficou clara ou onde você teve dificuldade." /><small id="feedback-count">{comment.length}/1.000 caracteres</small></div>
      <p id="feedback-privacy" className="help-text">O feedback contém apenas a opção de clareza e o texto que você escrever. Nenhum valor ou descrição da calculadora é anexado. Evite incluir dados pessoais ou financeiros no comentário.</p>
      {error && <p className="field-error" id="feedback-error" role="alert">{error}</p>}
      <div className="feedback-actions"><button type="submit" className="primary-button" disabled={busy}>Preparar e-mail ↗</button><button type="button" className="secondary-button" disabled={busy} onClick={() => void send('copy')}>Copiar texto</button><button type="button" className="text-button" disabled={busy} onClick={() => void send('download')}>Baixar feedback</button></div>
      <p role="status" aria-live="polite" className="feedback-status">{status}</p>
    </form>
  </section>
}

