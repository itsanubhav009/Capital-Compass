'use client'

import { useState } from 'react'

const TOPICS = [
  { value: 'general', label: 'General enquiry' },
  { value: 'correction', label: 'Correction or factual dispute' },
  { value: 'media', label: 'Media or partnership' },
  { value: 'technical', label: 'Technical problem' },
]

type Errors = Partial<Record<'name' | 'email' | 'subject' | 'message', string>>

export function ContactForm() {
  const [form, setForm] = useState({
    name: '',
    email: '',
    topic: 'general',
    subject: '',
    message: '',
    website: '', // honeypot — real people leave this blank
  })
  const [errors, setErrors] = useState<Errors>({})
  const [state, setState] = useState<'idle' | 'sending' | 'done' | 'error'>('idle')
  const [notice, setNotice] = useState('')

  const set = (k: keyof typeof form) => (e: any) => {
    setForm((f) => ({ ...f, [k]: e.target.value }))
    if (errors[k as keyof Errors]) setErrors((x) => ({ ...x, [k]: undefined }))
  }

  const validate = (): boolean => {
    const next: Errors = {}
    if (!form.name.trim()) next.name = 'Enter your name.'
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(form.email))
      next.email = 'Enter a valid email address.'
    if (!form.subject.trim()) next.subject = 'Add a subject line.'
    if (form.message.trim().length < 20)
      next.message = 'Tell us a little more — at least 20 characters.'
    setErrors(next)
    return Object.keys(next).length === 0
  }

  const submit = async () => {
    if (!validate()) return
    setState('sending')
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Send failed')
      setState('done')
      setNotice('Message sent. We reply to most enquiries within two working days.')
    } catch (e: any) {
      setState('error')
      setNotice(e.message || 'That did not send. Try again in a moment.')
    }
  }

  if (state === 'done') {
    return (
      <div className="border border-rule bg-surface p-8 text-center" role="status">
        <span className="eyebrow !text-inflow">Sent</span>
        <p className="mt-3 text-[17px] text-ink">{notice}</p>
      </div>
    )
  }

  const field =
    'w-full border border-rule-strong bg-surface px-4 py-3 text-[15px] text-ink outline-none placeholder:text-ink-faint focus:border-deep'
  const label = 'block text-[13px] font-medium text-ink-soft'
  const err = 'mt-1 text-[13px] text-outflow'

  return (
    <div className="relative space-y-5">
      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label className={label} htmlFor="cf-name">
            Your name
          </label>
          <input
            id="cf-name"
            className={`${field} mt-1.5`}
            value={form.name}
            onChange={set('name')}
            autoComplete="name"
            aria-invalid={Boolean(errors.name)}
          />
          {errors.name && (
            <p className={err} role="alert">
              {errors.name}
            </p>
          )}
        </div>
        <div>
          <label className={label} htmlFor="cf-email">
            Email
          </label>
          <input
            id="cf-email"
            type="email"
            inputMode="email"
            className={`${field} mt-1.5`}
            value={form.email}
            onChange={set('email')}
            autoComplete="email"
            aria-invalid={Boolean(errors.email)}
          />
          {errors.email && (
            <p className={err} role="alert">
              {errors.email}
            </p>
          )}
        </div>
      </div>

      <div>
        <label className={label} htmlFor="cf-topic">
          What is this about?
        </label>
        <select
          id="cf-topic"
          className={`${field} mt-1.5`}
          value={form.topic}
          onChange={set('topic')}
        >
          {TOPICS.map((t) => (
            <option key={t.value} value={t.value}>
              {t.label}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className={label} htmlFor="cf-subject">
          Subject
        </label>
        <input
          id="cf-subject"
          className={`${field} mt-1.5`}
          value={form.subject}
          onChange={set('subject')}
          aria-invalid={Boolean(errors.subject)}
        />
        {errors.subject && (
          <p className={err} role="alert">
            {errors.subject}
          </p>
        )}
      </div>

      <div>
        <label className={label} htmlFor="cf-message">
          Message
        </label>
        <textarea
          id="cf-message"
          rows={7}
          className={`${field} mt-1.5 resize-y`}
          value={form.message}
          onChange={set('message')}
          aria-invalid={Boolean(errors.message)}
        />
        {errors.message && (
          <p className={err} role="alert">
            {errors.message}
          </p>
        )}
      </div>

      <div aria-hidden className="absolute left-[-9999px] top-0">
        <label htmlFor="cf-website">Leave this blank</label>
        <input
          id="cf-website"
          tabIndex={-1}
          autoComplete="off"
          value={form.website}
          onChange={set('website')}
        />
      </div>

      <div className="flex flex-wrap items-center gap-4">
        <button
          type="button"
          onClick={submit}
          disabled={state === 'sending'}
          className="bg-deep px-6 py-3 text-[15px] font-medium text-paper transition-colors hover:bg-deep-soft disabled:opacity-60"
        >
          {state === 'sending' ? 'Sending…' : 'Send message'}
        </button>
        {state === 'error' && (
          <p className="text-[13px] text-outflow" role="alert">
            {notice}
          </p>
        )}
      </div>

      <p className="text-[12px] leading-relaxed text-ink-faint">
        We use your message only to reply to you. We cannot answer questions about specific
        investments or advise on what to buy or sell.
      </p>
    </div>
  )
}
