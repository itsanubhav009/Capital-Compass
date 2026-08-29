'use client'

import Link from 'next/link'
import { useState } from 'react'

const SUGGESTIONS = [
  'What did foreign institutions buy last month?',
  'Which sectors are seeing accelerating capital flows?',
  'What is happening with promoter holdings?',
]

type Source = {
  slug: string
  title: string
  section?: string | null
  publishedAt?: string | null
}

/**
 * Phase 2 AI search. Replaces the AiSearchSlot placeholder.
 *
 * The answer is generated only from retrieved article excerpts and always
 * carries citations, because an uncited answer on a financial site is
 * indistinguishable from the publication asserting something it has not
 * reported.
 */
export function AiSearch() {
  const [question, setQuestion] = useState('')
  const [answer, setAnswer] = useState('')
  const [sources, setSources] = useState<Source[]>([])
  const [state, setState] = useState<'idle' | 'searching' | 'done' | 'error'>('idle')
  const [error, setError] = useState('')

  const ask = async (q?: string) => {
    const text = (q ?? question).trim()
    if (text.length < 3) {
      setState('error')
      setError('Ask a longer question.')
      return
    }
    setQuestion(text)
    setState('searching')
    setError('')
    setAnswer('')
    setSources([])

    try {
      const res = await fetch('/api/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: text }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Search failed')
      setAnswer(data.answer)
      setSources(data.sources ?? [])
      setState('done')
    } catch (e: any) {
      setState('error')
      setError(e.message || 'Search is unavailable right now.')
    }
  }

  return (
    <div className="border border-rule bg-surface">
      <div className="flex items-center gap-3 border-b border-rule px-4 py-3 sm:px-5">
        <span aria-hidden className="tnum text-[15px] text-ink-faint">
          ⌕
        </span>
        <label htmlFor="ai-q" className="sr-only">
          Ask a question about the archive
        </label>
        <input
          id="ai-q"
          value={question}
          onChange={(e) => {
            setQuestion(e.target.value)
            if (state === 'error') setState('idle')
          }}
          onKeyDown={(e) => e.key === 'Enter' && ask()}
          placeholder="Ask about any company, sector or flow"
          className="min-w-0 flex-1 bg-transparent text-[15px] text-ink outline-none placeholder:text-ink-faint"
        />
        <button
          type="button"
          onClick={() => ask()}
          disabled={state === 'searching'}
          className="shrink-0 bg-deep px-4 py-1.5 text-[13px] font-medium text-paper transition-colors hover:bg-deep-soft disabled:opacity-60"
        >
          {state === 'searching' ? 'Searching…' : 'Ask'}
        </button>
      </div>

      {state === 'idle' && !answer && (
        <div className="flex flex-wrap gap-2 px-4 py-3 sm:px-5">
          {SUGGESTIONS.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => ask(s)}
              className="border border-rule px-2.5 py-1 text-[12px] text-ink-soft transition-colors hover:border-brass hover:text-deep"
            >
              {s}
            </button>
          ))}
        </div>
      )}

      {state === 'searching' && (
        <p className="px-4 py-5 text-[14px] text-ink-faint sm:px-5" role="status">
          Reading the archive…
        </p>
      )}

      {state === 'error' && (
        <p className="px-4 py-4 text-[14px] text-outflow sm:px-5" role="alert">
          {error}
        </p>
      )}

      {state === 'done' && answer && (
        <div className="px-4 py-5 sm:px-5">
          <div className="prose-cc !text-[15px] max-w-[62ch]">
            {answer.split('\n').filter(Boolean).map((p, i) => (
              <p key={i}>{p}</p>
            ))}
          </div>

          {sources.length > 0 && (
            <div className="mt-5 border-t border-rule pt-4">
              <h3 className="eyebrow">Sources</h3>
              <ul className="mt-2 space-y-1.5">
                {sources.map((s) => (
                  <li key={s.slug}>
                    <Link
                      href={`/insight/${s.slug}`}
                      className="text-[14px] text-deep underline decoration-brass-soft underline-offset-4"
                    >
                      {s.title}
                    </Link>
                    {s.section && (
                      <span className="tnum ml-2 text-[11px] uppercase tracking-wider text-ink-faint">
                        {s.section}
                      </span>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          )}

          <p className="mt-4 border-t border-rule pt-3 text-[12px] leading-relaxed text-ink-faint">
            Answers are generated from published Capital Compass articles and may contain
            errors. This is not investment advice. Check the sources above before relying on
            anything here.
          </p>
        </div>
      )}
    </div>
  )
}
