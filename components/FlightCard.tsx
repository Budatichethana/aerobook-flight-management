"use client"

import { useRouter } from 'next/navigation'
import { ArrowRightLeft, Clock3, PlaneLanding, PlaneTakeoff } from 'lucide-react'
import { getSupabaseBrowserClient } from '../lib/supabase/client'
import { formatDateTime } from '../lib/formatDateTime'
import { useStore, type Flight } from '../store/useStore'

type Props = {
  flight: Flight
}

export default function FlightCard({ flight }: Props) {
  const router = useRouter()
  const setSelectedFlight = useStore((state) => state.setSelectedFlight)
  const supabase = getSupabaseBrowserClient()
  const departureTime = new Date(flight.departs_at)
  const arrivalTime = new Date(flight.arrives_at)
  const durationMinutes = Number.isNaN(departureTime.getTime()) || Number.isNaN(arrivalTime.getTime())
    ? null
    : Math.max(0, Math.round((arrivalTime.getTime() - departureTime.getTime()) / 60000))
  const durationLabel = durationMinutes === null
    ? 'Duration unavailable'
    : `${Math.floor(durationMinutes / 60)}h ${durationMinutes % 60}m`

  const handleSelectFlight = async () => {
    const nextPath = `/booking/${flight.id}`
    const { data, error } = await supabase.auth.getUser()

    if (error || !data.user) {
      router.push(`/login?next=${encodeURIComponent(nextPath)}`)
      return
    }

    setSelectedFlight(flight)
    router.push(nextPath)
  }

  return (
    <article className="card overflow-hidden">
      <div className="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
        <div className="space-y-4">
          <div className="flex flex-wrap items-center gap-3">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-brand-600">{flight.flight_no}</p>
            <span className="status-badge bg-slate-100 text-slate-700">{flight.status}</span>
          </div>
          <div>
            <h2 className="text-2xl font-semibold text-slate-900 sm:text-[1.75rem]">
              {flight.origin} → {flight.destination}
            </h2>
            <p className="mt-2 max-w-xl text-sm text-slate-500">{flight.aircraft_type} • Base fare ${flight.base_price.toFixed(2)}</p>
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            <div className="rounded-2xl bg-slate-50 px-4 py-3">
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                <PlaneTakeoff className="h-4 w-4 text-brand-500" />
                Departs
              </div>
              <p className="mt-2 text-sm font-medium text-slate-900">{formatDateTime(flight.departs_at)}</p>
            </div>
            <div className="rounded-2xl bg-slate-50 px-4 py-3">
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                <Clock3 className="h-4 w-4 text-brand-500" />
                Duration
              </div>
              <p className="mt-2 text-sm font-medium text-slate-900">{durationLabel}</p>
            </div>
            <div className="rounded-2xl bg-slate-50 px-4 py-3">
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                <PlaneLanding className="h-4 w-4 text-brand-500" />
                Arrives
              </div>
              <p className="mt-2 text-sm font-medium text-slate-900">{formatDateTime(flight.arrives_at)}</p>
            </div>
          </div>
        </div>

        <div className="flex shrink-0 flex-col gap-3 xl:items-end">
          <div className="inline-flex items-center gap-2 rounded-full bg-brand-50 px-4 py-2 text-sm font-semibold text-brand-700 ring-1 ring-brand-100">
            {`$${flight.base_price.toFixed(2)}`}
          </div>
          <div className="inline-flex items-center gap-2 rounded-full bg-slate-50 px-4 py-2 text-sm font-medium text-slate-600 ring-1 ring-slate-100">
            <ArrowRightLeft className="h-4 w-4 text-slate-500" />
            Non-stop
          </div>
          <button
            type="button"
            onClick={() => {
              void handleSelectFlight()
            }}
            className="inline-flex items-center justify-center rounded-full bg-brand-600 px-5 py-3 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:brightness-110"
          >
            Select flight
          </button>
        </div>
      </div>
    </article>
  )
}