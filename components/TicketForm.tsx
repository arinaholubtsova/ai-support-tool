'use client'

import { useState } from 'react'
import type { Ticket } from '@/types/ticket'

interface TicketFormProps {
  onTicketAdded: (ticket: Ticket) => void
}

export default function TicketForm({ onTicketAdded }: TicketFormProps) {
  const [clientName, setClientName] = useState('')
  const [text, setText] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [successId, setSuccessId] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccessId(null)

    if (!clientName.trim() || !text.trim()) {
      setError("Будь ласка, заповніть всі поля")
      return
    }

    setIsSubmitting(true)

    try {
      const res = await fetch('/api/tickets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ clientName: clientName.trim(), text: text.trim() }),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Помилка сервера')
      }

      const ticket: Ticket = await res.json()
      onTicketAdded(ticket)
      setSuccessId(ticket.id)
      setClientName('')
      setText('')
      setTimeout(() => setSuccessId(null), 3000)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Помилка при збереженні. Спробуйте ще раз.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
      {/* Header */}
      <div className="px-5 py-4 border-b border-slate-100">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-indigo-600 flex items-center justify-center flex-shrink-0">
            <svg className="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
            </svg>
          </div>
          <h2 className="text-sm font-semibold text-slate-800">Додати звернення</h2>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="p-5 space-y-4">
        {/* Client Name */}
        <div>
          <label
            htmlFor="clientName"
            className="block text-xs font-medium text-slate-500 mb-1.5 uppercase tracking-wide"
            style={{ letterSpacing: '0.04em' }}
          >
            Ім'я клієнта
          </label>
          <input
            id="clientName"
            type="text"
            value={clientName}
            onChange={e => setClientName(e.target.value)}
            placeholder="Олена Коваленко"
            disabled={isSubmitting}
            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-800 placeholder-slate-400
              focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent
              disabled:opacity-60 disabled:cursor-not-allowed
              transition duration-150"
          />
        </div>

        {/* Inquiry Text */}
        <div>
          <label
            htmlFor="text"
            className="block text-xs font-medium text-slate-500 mb-1.5 uppercase tracking-wide"
            style={{ letterSpacing: '0.04em' }}
          >
            Текст звернення
          </label>
          <textarea
            id="text"
            value={text}
            onChange={e => setText(e.target.value)}
            placeholder="Введіть текст звернення клієнта..."
            rows={7}
            disabled={isSubmitting}
            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-800 placeholder-slate-400
              focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent
              disabled:opacity-60 disabled:cursor-not-allowed
              resize-none transition duration-150 leading-relaxed"
          />
          <p className="mt-1.5 text-xs text-slate-400 text-right">{text.length} символів</p>
        </div>

        {/* Error */}
        {error && (
          <div className="flex items-start gap-2 bg-red-50 border border-red-100 rounded-xl px-3.5 py-3">
            <svg className="w-4 h-4 text-red-500 flex-shrink-0 mt-px" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-xs text-red-600">{error}</p>
          </div>
        )}

        {/* Success */}
        {successId && (
          <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-100 rounded-xl px-3.5 py-3">
            <svg className="w-4 h-4 text-emerald-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <p className="text-xs text-emerald-700 font-medium">Звернення успішно збережено</p>
          </div>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isSubmitting || !clientName.trim() || !text.trim()}
          className="w-full flex items-center justify-center gap-2 bg-indigo-600 text-white text-sm font-medium
            py-2.5 px-4 rounded-xl
            hover:bg-indigo-700 active:bg-indigo-800
            focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2
            disabled:opacity-50 disabled:cursor-not-allowed
            transition duration-150"
        >
          {isSubmitting ? (
            <>
              <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              Збереження...
            </>
          ) : (
            <>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
              </svg>
              Зберегти звернення
            </>
          )}
        </button>
      </form>
    </div>
  )
}
