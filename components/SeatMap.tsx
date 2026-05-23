"use client"

import { useEffect, useMemo, useState } from 'react'
import { CheckCircle2, CircleDashed, DoorOpen, Plane, ShieldCheck } from 'lucide-react'
import type { RealtimePostgresChangesPayload } from '@supabase/supabase-js'
import { getSupabaseBrowserClient } from '../lib/supabase/client'
import { useStore, type SelectedSeat } from '../store/useStore'

export type Seat = {
  seat_number: string
  class: string
  is_available: boolean
  extra_fee: number | string | null
}

type Props = {
  flightId: string
  seats: Seat[]
}

const CLASS_ORDER = ['first', 'business', 'economy']

export default function SeatMap({ flightId, seats }: Props) {
  const selectedSeat = useStore((state) => state.selectedSeat)
  const setSelectedSeat = useStore((state) => state.setSelectedSeat)
  const [currentSeats, setCurrentSeats] = useState<Seat[]>(seats)

  useEffect(() => {
    setCurrentSeats(seats)
  }, [seats])

  useEffect(() => {
    if (!flightId) {
      return
    }

    const supabase = getSupabaseBrowserClient()
    const channel = supabase
      .channel(`seat-map-${flightId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'seats',
          filter: `flight_id=eq.${flightId}`
        },
        (payload: RealtimePostgresChangesPayload<Seat>) => {
          const updatedSeat = payload.new as Seat & { seat_number: string }

          setCurrentSeats((current) =>
            current.map((seat) =>
              seat.seat_number === updatedSeat.seat_number ? { ...seat, ...updatedSeat } : seat
            )
          )
        }
      )
      .subscribe()

    return () => {
      void supabase.removeChannel(channel)
    }
  }, [flightId])

  const groupedSeats = useMemo(() => {
    const groups: Record<string, Seat[]> = { first: [], business: [], economy: [] }

    for (const seat of currentSeats) {
      const normalizedClass = seat.class.toLowerCase()
      const groupKey = CLASS_ORDER.includes(normalizedClass) ? normalizedClass : 'economy'
      groups[groupKey].push(seat)
    }

    return groups
  }, [currentSeats])

  return (
    <div className="space-y-4">
      <div className="card flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-brand-600">Cabin layout</p>
          <h3 className="mt-2 text-2xl font-semibold text-slate-900">Choose your seat</h3>
        </div>
        <div className="flex flex-wrap gap-2 text-sm">
          <span className="status-badge bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100"><CheckCircle2 className="h-4 w-4" /> Available</span>
          <span className="status-badge bg-brand-50 text-brand-700 ring-1 ring-brand-100"><CircleDashed className="h-4 w-4" /> Selected</span>
          <span className="status-badge bg-slate-100 text-slate-600 ring-1 ring-slate-200"><ShieldCheck className="h-4 w-4" /> Occupied</span>
        </div>
      </div>

      {CLASS_ORDER.map((seatClass) => {
        const classSeats = groupedSeats[seatClass] ?? []

        return (
          <section key={seatClass} className="card">
            <div className="flex items-center justify-between gap-3 border-b border-slate-100 pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <DoorOpen className="h-4 w-4 text-brand-600" />
                  <h3 className="text-xl font-semibold capitalize text-slate-900">{seatClass} class</h3>
                </div>
                <p className="mt-1 text-sm text-slate-500">
                  {classSeats.length > 0 ? `${classSeats.length} seats available in this cabin.` : 'No seats listed in this cabin.'}
                </p>
              </div>
              <span className="status-badge bg-slate-50 text-slate-700 ring-1 ring-slate-100">{seatClass}</span>
            </div>

            <div className="mt-5 grid grid-cols-4 gap-3 sm:grid-cols-6 lg:grid-cols-8 xl:grid-cols-10">
              {classSeats.map((seat) => {
                const isOccupied = !seat.is_available
                const isSelected = selectedSeat?.seat_number === seat.seat_number
                const seatState: 'available' | 'selected' | 'occupied' = isOccupied
                  ? 'occupied'
                  : isSelected
                    ? 'selected'
                    : 'available'

                return (
                  <button
                    key={seat.seat_number}
                    type="button"
                    disabled={isOccupied}
                    onClick={() => {
                      setSelectedSeat(seat as SelectedSeat)
                    }}
                    className={[
                      'flex min-h-14 flex-col items-center justify-center rounded-2xl border px-3 py-2 text-center transition sm:min-h-16',
                      seatState === 'available' && 'border-slate-200 bg-white hover:-translate-y-0.5 hover:border-brand-300 hover:shadow-soft-lg',
                      seatState === 'selected' && 'border-brand-600 bg-brand-50 text-brand-700 shadow-[0_6px_18px_rgba(47,158,255,0.12)]',
                      seatState === 'occupied' && 'cursor-not-allowed border-slate-200 bg-slate-100 text-slate-400 opacity-80'
                    ].filter(Boolean).join(' ')}
                  >
                    <Plane className="mb-1 h-3.5 w-3.5 opacity-50" />
                    <span className="text-sm font-semibold">{seat.seat_number}</span>
                    <span className="mt-1 text-[10px] uppercase tracking-[0.18em] text-slate-400">{seatState}</span>
                  </button>
                )
              })}
            </div>
          </section>
        )
      })}
    </div>
  )
}