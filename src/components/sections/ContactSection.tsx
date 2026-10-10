import { useEffect, useRef, useState, type FormEvent } from 'react'
import { gsap } from '../../hooks/useScrollAnimation'
import { frameUrl, SHOT } from '../../data/frames'
import { product } from '../../data/product'
import { submitEnquiry } from '../../lib/enquiries'

export default function ContactSection({ reduced }: { reduced: boolean }) {
  const ref = useRef<HTMLElement>(null)
  const [submitted, setSubmitted] = useState(false)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (reduced) return
    const ctx = gsap.context(() => {
      gsap.from('.contact-banner img', { scale: 1.08, opacity: .5, duration: 1.2, ease: 'power3.out', scrollTrigger: { trigger: '.contact-banner', start: 'top 80%' } })
      gsap.from('.contact-form > *', { y: 22, opacity: 0, stagger: .08, duration: .8, ease: 'power3.out', scrollTrigger: { trigger: '.contact-form', start: 'top 80%' } })
    }, ref)
    return () => ctx.revert()
  }, [reduced])

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const form = event.currentTarget
    const values = new FormData(form)
    setBusy(true); setError(''); setSubmitted(false)
    try {
      await submitEnquiry({ name: String(values.get('name') || ''), email: String(values.get('email') || ''), subject: String(values.get('subject') || ''), message: String(values.get('message') || '') })
      setSubmitted(true); form.reset()
    } catch (err) { setError(err instanceof Error ? err.message : 'Unable to save your message. Please try again.') }
    finally { setBusy(false) }
  }

  return (
    <section ref={ref} className="section contact" id="contact">
      <div className="container-xl mx-auto">
        <div className="contact-banner">
          <img src={frameUrl('desktop', SHOT.reveal)} alt={product.alt} loading="lazy" />
          <div className="contact-banner-copy">
            <span className="eyebrow">A note to the atelier</span>
            <h2>We’d love to <em>hear from you.</em></h2>
          </div>
        </div>
        <div className="contact-layout">
          <div className="contact-intro">
            <span className="eyebrow">Contact</span>
            <h3>How can we help?</h3>
            <p>Questions about the necklace, its details, or your order? Leave us a message.</p>
          </div>
          <form className="contact-form" onSubmit={submit}>
            <label className="field" htmlFor="contact-name"><span>Name</span><input id="contact-name" name="name" autoComplete="name" required /></label>
            <label className="field" htmlFor="contact-email"><span>Email</span><input id="contact-email" name="email" type="email" autoComplete="email" required /></label>
            <label className="field" htmlFor="contact-subject"><span>Subject</span><input id="contact-subject" name="subject" required /></label>
            <label className="field" htmlFor="contact-message"><span>Message</span><textarea id="contact-message" name="message" rows={5} required /></label>
            {error && <p className="admin-error" role="alert">{error}</p>}
            <button className="cta-btn solid" type="submit" disabled={busy}>{busy ? 'Saving…' : 'Send message'}</button>
            <p className="contact-note" role="status" aria-live="polite">{submitted ? 'Thank you. Your message has been saved and our team can review it.' : 'Your message will be saved securely for our team to review.'}</p>
          </form>
        </div>
      </div>
    </section>
  )
}
