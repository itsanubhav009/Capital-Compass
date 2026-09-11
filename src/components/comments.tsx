'use client'

import { useState } from 'react'

export type Comment = { id: any; name: string; body: string; createdAt: string }

const when = (iso: string) =>
  iso
    ? new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
    : ''

const initials = (name: string) =>
  name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? '')
    .join('')

type Errors = Partial<Record<'name' | 'email' | 'body', string>>

/**
 * The comment thread at the foot of every article.
 *
 * Approved comments are rendered on the server and passed in; the form posts
 * to /api/comments and the new comment is held for moderation, which the
 * confirmation says plainly rather than pretending the comment is live.
 */
export function Comments({ slug, comments }: { slug: string; comments: Comment[] }) {
  const [form, setForm] = useState({
    name: '',
    email: '',
    body: '',
    website: '', // honeypot — real people leave this blank
  })
  const [errors, setErrors] = useState<Errors>({})
  const [state, setState] = useState<'idle' | 'sending' | 'done' | 'error'>('idle')
  const [notice, setNotice] = useState('')

  const set = (k: keyof typeof form) => (e: any) => {
    setForm((f) => ({ ...f, [k]: e.target.value }))
    if (errors[k as keyof Errors]) setErrors((x) => ({ ...x, [k]: undefined }))
  }

  const validate = () => {
    const next: Errors = {}
    if (!form.name.trim()) next.name = 'Enter your name.'
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(form.email)) next.email = 'Enter a valid email address.'
    if (form.body.trim().length < 10) next.body = 'Write at least ten characters.'
    setErrors(next)
    return Object.keys(next).length === 0
  }

  const submit = async () => {
    if (!validate()) return
    setState('sending')
    try {
      const res = await fetch('/api/comments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, slug }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Could not post the comment')
      setState('done')
      setNotice('Thanks — your comment has been sent for review and will appear once approved.')
      setForm({ name: '', email: '', body: '', website: '' })
    } catch (e: any) {
      setState('error')
      setNotice(e.message || 'That did not post. Try again in a moment.')
    }
  }

  const field =
    'w-full rounded-[6px] border border-rule-strong bg-white px-4 py-3 text-[15px] text-ink outline-none placeholder:text-ink-faint focus:border-accent'
  const label = 'block text-[13px] font-medium text-ink-soft'
  const err = 'mt-1 text-[13px] text-outflow'

  return (
    <section className="border-t border-rule py-12" aria-labelledby="comments">
      <h2 id="comments" className="text-[24px] sm:text-[28px]">
        Comments{comments.length > 0 && <span className="tnum text-ink-faint"> ({comments.length})</span>}
      </h2>

      {/* --------------------------------------------------- the thread --- */}
      {comments.length > 0 ? (
        <ul className="mt-7 space-y-6">
          {comments.map((c) => (
            <li key={c.id} className="flex gap-4 border-b border-rule pb-6 last:border-0 last:pb-0">
              <span
                aria-hidden
                className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-sunken text-[14px] font-semibold text-ink-soft"
              >
                {initials(c.name) || '·'}
              </span>
              <div className="min-w-0">
                <p className="flex flex-wrap items-baseline gap-x-3">
                  <span className="text-[15px] font-semibold text-ink">{c.name}</span>
                  <span className="tnum text-[12px] text-ink-faint">{when(c.createdAt)}</span>
                </p>
                <p className="mt-1.5 whitespace-pre-line text-[15px] leading-relaxed text-ink-soft">
                  {c.body}
                </p>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-4 text-[15px] text-ink-soft">
          No comments on this piece yet. Yours would be the first.
        </p>
      )}

      {/* ----------------------------------------------------- the form --- */}
      <div className="mt-10 rounded-[10px] border border-rule bg-sunken/60 p-6 sm:p-8">
        <h3 className="text-[20px] sm:text-[22px]">Leave a comment</h3>
        <p className="mt-1.5 text-[13.5px] text-ink-faint">
          Comments are read before they appear. Your email address is never published.
        </p>

        {state === 'done' ? (
          <p className="mt-6 text-[15px] font-medium text-inflow" role="status">
            {notice}
          </p>
        ) : (
          <div className="relative mt-6 space-y-5">
            <div className="grid gap-5 sm:grid-cols-2">
              <div>
                <label className={label} htmlFor="cm-name">
                  Your name
                </label>
                <input
                  id="cm-name"
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
                <label className={label} htmlFor="cm-email">
                  Email <span className="text-ink-faint">(not published)</span>
                </label>
                <input
                  id="cm-email"
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
              <label className={label} htmlFor="cm-body">
                Comment
              </label>
              <textarea
                id="cm-body"
                rows={5}
                className={`${field} mt-1.5 resize-y`}
                value={form.body}
                onChange={set('body')}
                aria-invalid={Boolean(errors.body)}
              />
              {errors.body && (
                <p className={err} role="alert">
                  {errors.body}
                </p>
              )}
            </div>

            <div aria-hidden className="absolute left-[-9999px] top-0">
              <label htmlFor="cm-website">Leave this blank</label>
              <input
                id="cm-website"
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
                className="rounded-[6px] bg-accent px-6 py-3 text-[15px] font-semibold text-white transition-colors hover:bg-accent-soft disabled:opacity-60"
              >
                {state === 'sending' ? 'Posting…' : 'Post comment'}
              </button>
              {state === 'error' && (
                <p className="text-[13px] text-outflow" role="alert">
                  {notice}
                </p>
              )}
            </div>

            <p className="text-[12px] leading-relaxed text-ink-faint">
              Please keep it civil and on the subject of the article. We remove anything
              defamatory, and we cannot answer questions about what to buy or sell.
            </p>
          </div>
        )}
      </div>
    </section>
  )
}
