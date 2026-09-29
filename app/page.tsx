'use client'

import { useEffect, useState, useCallback } from 'react'
import TicketForm from '@/components/TicketForm'
import TicketCard from '@/components/TicketCard'
import type { Ticket, Priority } from '@/types/ticket'

// ─── Stats bar ────────────────────────────────────────────────────────────────

function StatsBar({ tickets }: { tickets: Ticket[] }) {
  const analyzed = tickets.filter(t => t.priority).length
  const high = tickets.filter(t => t.priority === 'високий').length
  const medium = tickets.filter(t => t.priority === 'середній').length
  const low = tickets.filter(t => t.priority === 'низький').length

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
      {[
        { label: 'Всього звернень', value: tickets.length, color: 'text-slate-800', bg: 'bg-white' },
        { label: 'З аналізом AI', value: analyzed, color: 'text-indigo-700', bg: 'bg-indigo-50' },
        { label: 'Високий пріоритет', value: high, color: 'text-red-700', bg: 'bg-red-50' },
        { label: 'Середній пріоритет', value: medium, color: 'text-amber-700', bg: 'bg-amber-50' },
      ].map(stat => (
        <div
          key={stat.label}
          className={`${stat.bg} border border-slate-200 rounded-2xl px-4 py-3`}
        >
          <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
          <p className="text-xs text-slate-500 mt-0.5 leading-tight">{stat.label}</p>
        </div>
      ))}
    </div>
  )
}

// ─── Empty state ──────────────────────────────────────────────────────────────

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-20 bg-white border border-slate-200 border-dashed rounded-2xl text-center">
      <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center mb-4">
        <svg className="w-6 h-6 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
        </svg>
      </div>
      <p className="text-sm font-medium text-slate-600">Звернень ще немає</p>
      <p className="text-xs text-slate-400 mt-1">Додайте перше звернення за допомогою форми зліва</p>
    </div>
  )
}

// ─── Skeleton loader ──────────────────────────────────────────────────────────

function SkeletonCard() {
  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-5 animate-pulse">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-9 h-9 rounded-xl bg-slate-100" />
        <div className="space-y-1.5 flex-1">
          <div className="h-3.5 bg-slate-100 rounded-lg w-32" />
          <div className="h-3 bg-slate-100 rounded-lg w-24" />
        </div>
      </div>
      <div className="space-y-2">
        <div className="h-3 bg-slate-100 rounded-lg" />
        <div className="h-3 bg-slate-100 rounded-lg w-4/5" />
        <div className="h-3 bg-slate-100 rounded-lg w-3/5" />
      </div>
    </div>
  )
}

// ─── Filter bar ───────────────────────────────────────────────────────────────

type FilterValue = 'all' | Priority

const FILTER_OPTIONS: { value: FilterValue; label: string }[] = [
  { value: 'all',      label: 'Всі' },
  { value: 'високий',  label: '🔴 Високий' },
  { value: 'середній', label: '🟡 Середній' },
  { value: 'низький',  label: '🟢 Низький' },
]

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function Home() {
  const [tickets, setTickets] = useState<Ticket[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [filter, setFilter] = useState<FilterValue>('all')
  const [fetchError, setFetchError] = useState('')

  const fetchTickets = useCallback(async () => {
    setFetchError('')
    try {
      const res = await fetch('/api/tickets')
      if (!res.ok) throw new Error('Помилка завантаження')
      const data: Ticket[] = await res.json()
      setTickets(data)
    } catch {
      setFetchError('Не вдалося завантажити звернення. Перевірте підключення.')
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchTickets()
  }, [fetchTickets])

  const handleNewTicket = (ticket: Ticket) => {
    setTickets(prev => [ticket, ...prev])
  }

  const handleTicketUpdate = (updated: Ticket) => {
    setTickets(prev => prev.map(t => (t.id === updated.id ? updated : t)))
  }

  // Filtering
  const filteredTickets =
    filter === 'all'
      ? tickets
      : tickets.filter(t => t.priority === filter)

  return (
    <div className="min-h-screen bg-slate-100">

      {/* ── Top header ── */}
      <header className="bg-slate-900 border-b border-slate-800 sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14">
            {/* Logo + name */}
            <div className="flex items-center gap-3">
              <div className="w-7 h-7 rounded-lg bg-indigo-500 flex items-center justify-center flex-shrink-0">
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                </svg>
              </div>
              <span className="text-sm font-semibold text-white">AI-обробка звернень</span>
              <span className="hidden sm:inline text-slate-600 text-sm">·</span>
              <span className="hidden sm:inline text-slate-400 text-xs">Система підтримки клієнтів</span>
            </div>

            {/* Ticket count pill */}
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-400">{tickets.length} звернень</span>
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            </div>
          </div>
        </div>
      </header>

      {/* ── Main content ── */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">

          {/* ── Sidebar: form ── */}
          <aside className="lg:col-span-1">
            <div className="sticky top-20">
              <TicketForm onTicketAdded={handleNewTicket} />

              {/* Quick legend */}
              <div className="mt-4 bg-white border border-slate-200 rounded-2xl p-4">
                <p className="text-[10px] font-semibold text-slate-400 uppercase mb-3" style={{ letterSpacing: '0.08em' }}>
                  Легенда пріоритетів
                </p>
                <div className="space-y-2">
                  {[
                    { color: 'bg-red-500',     label: 'Високий — критична проблема' },
                    { color: 'bg-amber-500',   label: 'Середній — є проблема' },
                    { color: 'bg-emerald-500', label: 'Низький — інформаційне' },
                  ].map(item => (
                    <div key={item.label} className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full flex-shrink-0 ${item.color}`} />
                      <span className="text-xs text-slate-600">{item.label}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </aside>

          {/* ── Main: ticket list ── */}
          <section className="lg:col-span-2">
            {/* Stats */}
            {!isLoading && tickets.length > 0 && <StatsBar tickets={tickets} />}

            {/* Section header + filter */}
            <div className="flex items-center justify-between gap-4 mb-5">
              <h2 className="text-base font-semibold text-slate-800">
                Список звернень
                {filter !== 'all' && (
                  <span className="ml-2 text-sm font-normal text-slate-400">
                    ({filteredTickets.length} з {tickets.length})
                  </span>
                )}
              </h2>

              {/* Priority filter tabs */}
              {!isLoading && tickets.length > 0 && (
                <div className="flex items-center gap-1 bg-white border border-slate-200 rounded-xl p-1">
                  {FILTER_OPTIONS.map(opt => (
                    <button
                      key={opt.value}
                      onClick={() => setFilter(opt.value)}
                      className={`text-xs font-medium px-3 py-1.5 rounded-lg transition duration-150
                        ${filter === opt.value
                          ? 'bg-indigo-600 text-white shadow-sm'
                          : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'
                        }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Fetch error */}
            {fetchError && (
              <div className="flex items-center gap-2 bg-red-50 border border-red-100 rounded-2xl px-4 py-3 mb-4">
                <svg className="w-4 h-4 text-red-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-sm text-red-600">{fetchError}</p>
                <button
                  onClick={fetchTickets}
                  className="ml-auto text-xs font-medium text-red-700 underline hover:no-underline"
                >
                  Спробувати ще
                </button>
              </div>
            )}

            {/* Content */}
            {isLoading ? (
              <div className="space-y-4">
                {Array.from({ length: 3 }).map((_, i) => <SkeletonCard key={i} />)}
              </div>
            ) : tickets.length === 0 ? (
              <EmptyState />
            ) : filteredTickets.length === 0 ? (
              <div className="text-center py-14 bg-white border border-slate-200 border-dashed rounded-2xl">
                <p className="text-sm text-slate-500">Немає звернень із таким пріоритетом</p>
                <button
                  onClick={() => setFilter('all')}
                  className="mt-2 text-xs text-indigo-600 font-medium hover:underline"
                >
                  Показати всі
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredTickets.map(ticket => (
                  <TicketCard
                    key={ticket.id}
                    ticket={ticket}
                    onUpdate={handleTicketUpdate}
                  />
                ))}
              </div>
            )}
          </section>
        </div>
      </main>
    </div>
  )
}
