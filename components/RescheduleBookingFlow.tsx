"use client"

import React from 'react'
import { useRouter } from 'next/navigation'
import { BadgeCheck, Info, Ticket } from 'lucide-react'
import SeatMap, { type Seat } from './SeatMap'
import { formatDateTime } from '../lib/formatDateTime'
import { useStore, type Flight } from '../store/useStore'

type BookingDetails = {
  id: string
  pnr_code: string
  status: string
  booked_at: string
  total_price: number | string
  flight_no: string
  origin: string
  destination: string
  departs_at: string
  arrives_at: string
  aircraft_type: string
  seat_number: string
  passenger_name: string
}

type Props = {
  booking: BookingDetails
  flights: Flight[]
  seatsByFlight: Record<string, Seat[]>
}

export default function RescheduleBookingFlow({ booking, flights, seatsByFlight }: Props) {
  const router = useRouter()
  const selectedSeat = useStore((state) => state.selectedSeat)
  const setSelectedFlight = useStore((state) => state.setSelectedFlight)
  const setSelectedSeat = useStore((state) => state.setSelectedSeat)
  const [selectedFlightId, setSelectedFlightId] = React.useState(flights[0]?.id ?? '')
  const [submitting, setSubmitting] = React.useState(false)
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null)

  const selectedFlight = flights.find((flight) => flight.id === selectedFlightId) ?? null
  const availableSeats = selectedFlight ? seatsByFlight[selectedFlight.id] ?? [] : []

  React.useEffect(() => {
    if (flights[0]) {
      setSelectedFlightId(flights[0].id)
      setSelectedFlight(flights[0])
    } else {
      setSelectedFlight(null)
    }

    setSelectedSeat(null)
  }, [flights, setSelectedFlight, setSelectedSeat])

  React.useEffect(() => {
    setSelectedFlight(selectedFlight)
    setSelectedSeat(null)
  }, [selectedFlight, setSelectedFlight, setSelectedSeat])

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setSubmitting(true)
    setErrorMessage(null)

    try {
      if (!selectedFlight) {
        throw new Error('Please select an alternative flight.')
      }

      if (!selectedSeat) {
        throw new Error('Please select a new seat.')
      }

      const response = await fetch('/api/bookings/reschedule', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bookingId: booking.id,
          newFlightId: selectedFlight.id,
          newSeatNumber: selectedSeat.seat_number
        })
      })

      const payload = await response.json()

      if (!response.ok) {
        throw new Error(payload.error ?? 'Unable to reschedule booking')
      }

      router.push('/bookings')
      router.refresh()
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Unable to reschedule booking')
    } finally {
      setSubmitting(false)
    }
  }

  if (flights.length === 0) {
    return (
      <section className="card">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-sky-700">Reschedule</p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight text-slate-950">No alternative flights available</h1>
        <p className="mt-4 text-slate-600">There are no other flights on this route with available seats.</p>
      </section>
    )
  }

  return (
    <div className="space-y-6 lg:space-y-8">
      <section className="card overflow-hidden">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-brand-600">Current booking</p>
            <h1 className="mt-3 text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl">Reschedule booking {booking.pnr_code}</h1>
            <p className="mt-2 text-sm text-slate-600">Choose a new flight and seat while keeping the same route.</p>
          </div>
          <div className="inline-flex items-center gap-2 rounded-full bg-brand-50 px-4 py-2 text-sm font-semibold text-brand-700 ring-1 ring-brand-100">
            <BadgeCheck className="h-4 w-4" />
            Current booking active
          </div>
        </div>

        <div className="mt-5 grid gap-4 text-sm text-slate-600 sm:grid-cols-2 xl:grid-cols-4">
          <div>
            <span className="font-medium text-slate-500">Route</span>
            <p className="mt-1 text-slate-900">{booking.origin} → {booking.destination}</p>
          </div>
          <div>
            <span className="font-medium text-slate-500">Current flight</span>
            <p className="mt-1 text-slate-900">{booking.flight_no}</p>
          </div>
          <div>
            <span className="font-medium text-slate-500">Current seat</span>
            <p className="mt-1 text-slate-900">{booking.seat_number}</p>
          </div>
          <div>
            <span className="font-medium text-slate-500">Passenger</span>
            <p className="mt-1 text-slate-900">{booking.passenger_name}</p>
          </div>
          <div>
            <span className="font-medium text-slate-500">Booked</span>
            <p className="mt-1 text-slate-900">{formatDateTime(booking.booked_at)}</p>
          </div>
          <div>
            <span className="font-medium text-slate-500">Current total</span>
            <p className="mt-1 text-slate-900">
              {typeof booking.total_price === 'number' ? `$${booking.total_price.toFixed(2)}` : booking.total_price}
            </p>
          </div>
        </div>
      </section>

      <section className="card">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-sky-700">Alternative flights</p>
        <h2 className="mt-3 text-2xl font-semibold text-slate-900 sm:text-[1.75rem]">Select a new flight on the same route</h2>

        <div className="mt-5 grid gap-4 lg:grid-cols-2">
          {flights.map((flight) => {
            const isSelected = selectedFlightId === flight.id
            const seatCount = seatsByFlight[flight.id]?.length ?? 0

            return (
              <button
                key={flight.id}
                type="button"
                onClick={() => {
                  setSelectedFlightId(flight.id)
                }}
                className={[
                  'rounded-3xl border p-5 text-left transition',
                  isSelected
                    ? 'border-brand-600 bg-brand-50 shadow-[0_10px_28px_rgba(47,158,255,0.12)]'
                    : 'border-slate-200 bg-white hover:-translate-y-0.5 hover:border-brand-300 hover:bg-slate-50 hover:shadow-soft-lg'
                ].join(' ')}
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-sm font-semibold uppercase tracking-[0.18em] text-brand-600">{flight.flight_no}</p>
                    <h3 className="mt-2 text-xl font-semibold text-slate-950">
                      {flight.origin} → {flight.destination}
                    </h3>
                  </div>
                  <span className="status-badge bg-slate-50 text-slate-600 ring-1 ring-slate-100">
                    {seatCount} seats
                  </span>
                </div>
                <div className="mt-4 grid gap-3 text-sm text-slate-600 sm:grid-cols-2">
                  <p>Departs: {formatDateTime(flight.departs_at)}</p>
                  <p>Arrives: {formatDateTime(flight.arrives_at)}</p>
                  <p>Aircraft: {flight.aircraft_type}</p>
                  <p>Base price: ${flight.base_price.toFixed(2)}</p>
                </div>
              </button>
            )
          })}
        </div>
      </section>

      {selectedFlight ? <SeatMap flightId={selectedFlight.id} seats={availableSeats} /> : null}

      <section className="card">
        <div className="flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.2em] text-brand-600">
          <Ticket className="h-4 w-4" />
          Confirm reschedule
        </div>
        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div className="rounded-2xl bg-slate-50 px-4 py-3 text-sm text-slate-600 ring-1 ring-slate-100">
            {selectedFlight ? `Selected flight: ${selectedFlight.flight_no}` : 'Select an alternative flight to continue'}
          </div>

          {errorMessage ? (
            <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
              <Info className="mr-2 inline-block h-4 w-4 align-[-2px]" />
              {errorMessage}
            </div>
          ) : null}

          <button
            type="submit"
            disabled={submitting || !selectedFlight || !selectedSeat}
            className="inline-flex items-center justify-center rounded-full bg-brand-600 px-6 py-3 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:brightness-110 disabled:cursor-not-allowed disabled:bg-slate-300"
          >
            {submitting ? 'Rescheduling...' : 'Reschedule booking'}
          </button>
        </form>
      </section>
    </div>
  )
}