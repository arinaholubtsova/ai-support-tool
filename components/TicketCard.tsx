'use client'

import { useState } from 'react'
import type { Ticket, Priority, Category } from '@/types/ticket'

interface TicketCardProps {
  ticket: Ticket
  onUpdate: (ticket: Ticket) => void
}

// ─── Badge config ─────────────────────────────────────────────────────────────

const PRIORITY_CONFIG: Record<Priority, { label: string; className: string; dot: string }> = {
  'високий': {
    label: 'Високий',
    className: 'bg-red-50 text-red-700 border-red-200',
    dot: 'bg-red-500',
  },
  'середній': {
    label: 'Середній',
    className: 'bg-amber-50 text-amber-700 border-amber-200',
    dot: 'bg-amber-500',
  },
  'низький': {
    label: 'Низький',
    className: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    dot: 'bg-emerald-500',
  },
}

const CATEGORY_CONFIG: Record<Category, { label: string; className: string }> = {
  'оплата':   { label: '💳 Оплата',    className: 'bg-blue-50 text-blue-700 border-blue-200' },
  'доставка': { label: '📦 Доставка',  className: 'bg-violet-50 text-violet-700 border-violet-200' },
  'скарга':   { label: '⚠️ Скарга',    className: 'bg-orange-50 text-orange-700 border-orange-200' },
  'інше':     { label: '📋 Інше',      className: 'bg-slate-50 text-slate-600 border-slate-200' },
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatDate(dateStr: string): string {
  return new Intl.DateTimeFormat('uk-UA', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(dateStr))
}

function getInitials(name: string): string {
  return name
    .split(' ')
    .slice(0, 2)
    .map(n => n[0]?.toUpperCase() ?? '')
    .join('')
}

// Cycle through avatar background colours by first letter
const AVATAR_COLORS = [
  'bg-indigo-100 text-indigo-700',
  'bg-violet-100 text-violet-700',
  'bg-sky-100 text-sky-700',
  'bg-teal-100 text-teal-700',
  'bg-rose-100 text-rose-700',
]

function avatarColor(name: string): string {
  const idx = (name.charCodeAt(0) || 0) % AVATAR_COLORS.length
  return AVATAR_COLORS[idx]
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function TicketCard({ ticket, onUpdate }: TicketCardProps) {
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [error, setError] = useState('')
  const [copied, setCopied] = useState(false)

  const hasAnalysis = !!(ticket.priority && ticket.category && ticket.summary)
  const priority = ticket.priority as Priority | null
  const category = ticket.category as Category | null

  // ── Analyze ───────────────────────────────────────────────────────────────

  const handleAnalyze = async () => {
    setIsAnalyzing(true)
    setError('')

    try {
      const res = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ticketId: ticket.id }),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Помилка аналізу')
      }

      const updated: Ticket = await res.json()
      onUpdate(updated)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Спробуйте ще раз')
    } finally {
      setIsAnalyzing(false)
    }
  }

  // ── Copy draft ─────────────────────────────────────────────────────────────

  const handleCopy = async () => {
    if (!ticket.draftResponse) return
    try {
      await navigator.clipboard.writeText(ticket.draftResponse)
      setCopied(true)
      setTimeout(() => setCopied(false), 2500)
    } catch {
      // Fallback for browsers without clipboard API
      const el = document.createElement('textarea')
      el.value = ticket.draftResponse
      document.body.appendChild(el)
      el.select()
      document.execCommand('copy')
      document.body.removeChild(el)
      setCopied(true)
      setTimeout(() => setCopied(false), 2500)
    }
  }

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <article className="bg-white border border-slate-200 rounded-2xl overflow-hidden transition-shadow duration-200 hover:shadow-sm">

      {/* ── Card header ── */}
      <div className="px-5 py-4 flex items-start justify-between gap-4 border-b border-slate-100">
        <div className="flex items-center gap-3 min-w-0">
          {/* Avatar */}
          <div
            className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 text-sm font-semibold ${avatarColor(ticket.clientName)}`}
          >
            {getInitials(ticket.clientName)}
          </div>

          {/* Name & timestamp */}
          <div className="min-w-0">
            <p className="text-sm font-semibold text-slate-800 truncate">{ticket.clientName}</p>
            <p className="text-xs text-slate-400 mt-0.5">{formatDate(ticket.createdAt)}</p>
          </div>
        </div>

        {/* Badges (shown once analysis is done) */}
        {hasAnalysis && priority && category && (
          <div className="flex items-center gap-1.5 flex-shrink-0 flex-wrap justify-end">
            {/* Priority */}
            <span
              className={`inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full border ${PRIORITY_CONFIG[priority].className}`}
            >
              <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${PRIORITY_CONFIG[priority].dot}`} />
              {PRIORITY_CONFIG[priority].label}
            </span>

            {/* Category */}
            <span
              className={`inline-flex items-center text-xs font-medium px-2.5 py-1 rounded-full border ${CATEGORY_CONFIG[category].className}`}
            >
              {CATEGORY_CONFIG[category].label}
            </span>
          </div>
        )}
      </div>

      {/* ── Original text ── */}
      <div className="px-5 py-4">
        <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-wrap">{ticket.text}</p>
      </div>

      {/* ── AI Analysis block ── */}
      {hasAnalysis && (
        <div className="px-5 pb-4 space-y-3">
          <div className="h-px bg-slate-100" />

          {/* Summary */}
          {ticket.summary && (
            <div className="rounded-xl bg-indigo-50 border border-indigo-100 px-4 py-3">
              <p className="text-[10px] font-semibold text-indigo-500 uppercase mb-1.5" style={{ letterSpacing: '0.08em' }}>
                AI — Підсумок
              </p>
              <p className="text-sm text-indigo-900 leading-relaxed">{ticket.summary}</p>
            </div>
          )}

          {/* Draft Response */}
          {ticket.draftResponse && (
            <div className="rounded-xl bg-slate-50 border border-slate-200 px-4 py-3">
              <div className="flex items-center justify-between mb-2">
                <p className="text-[10px] font-semibold text-slate-500 uppercase" style={{ letterSpacing: '0.08em' }}>
                  Чернетка відповіді
                </p>
                <button
                  onClick={handleCopy}
                  className="flex items-center gap-1.5 text-xs font-medium text-indigo-600 hover:text-indigo-800 transition-colors duration-150"
                >
                  {copied ? (
                    <>
                      <svg className="w-3.5 h-3.5 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                      </svg>
                      <span className="text-emerald-600">Скопійовано!</span>
                    </>
                  ) : (
                    <>
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                      Копіювати відповідь
                    </>
                  )}
                </button>
              </div>
              <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">
                {ticket.draftResponse}
              </p>
            </div>
          )}
        </div>
      )}

      {/* ── Footer: error + action button ── */}
      <div className="px-5 pb-4 flex items-center justify-between gap-3">
        {/* Error */}
        <div className="flex-1">
          {error && (
            <div className="flex items-center gap-1.5">
              <svg className="w-3.5 h-3.5 text-red-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-xs text-red-600">{error}</p>
            </div>
          )}
        </div>

        {/* Analyze / Re-analyze button */}
        <button
          onClick={handleAnalyze}
          disabled={isAnalyzing}
          className={`flex items-center gap-2 text-sm font-medium px-4 py-2 rounded-xl border transition duration-150 flex-shrink-0
            disabled:opacity-50 disabled:cursor-not-allowed
            ${hasAnalysis
              ? 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50 hover:text-slate-800'
              : 'border-transparent bg-indigo-600 text-white hover:bg-indigo-700 active:bg-indigo-800 shadow-sm shadow-indigo-200'
            }`}
        >
          {isAnalyzing ? (
            <>
              <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              Аналіз...
            </>
          ) : hasAnalysis ? (
            <>
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Переаналізувати
            </>
          ) : (
            <>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
              Аналізувати (AI)
            </>
          )}
        </button>
      </div>
    </article>
  )
}
