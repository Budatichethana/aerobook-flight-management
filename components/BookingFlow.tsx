"use client"

import React from 'react'
import { useRouter } from 'next/navigation'
import { CreditCard, Info, PlaneTakeoff, Ticket } from 'lucide-react'
import SeatMap, { type Seat } from './SeatMap'
import { formatDateTime } from '../lib/formatDateTime'
import { useStore, type Flight } from '../store/useStore'

type Props = {
  flight: Flight
  seats: Seat[]
}

type PassengerForm = {
  full_name: string
  passport_no: string
  nationality: string
  dob: string
}

export default function BookingFlow({ flight, seats }: Props) {
  const router = useRouter()
  const selectedSeat = useStore((state) => state.selectedSeat)
  const setSelectedFlight = useStore((state) => state.setSelectedFlight)
  const [submitting, setSubmitting] = React.useState(false)
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null)
  const [form, setForm] = React.useState<PassengerForm>({
    full_name: '',
    passport_no: '',
    nationality: '',
    dob: ''
  })

  React.useEffect(() => {
    setSelectedFlight(flight)
  }, [flight, setSelectedFlight])

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target
    setForm((current) => ({ ...current, [name]: value }))
  }

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setSubmitting(true)
    setErrorMessage(null)

    try {
      if (!selectedSeat) {
        throw new Error('Please select a seat before continuing.')
      }

      const response = await fetch('/api/bookings/reserve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          flightId: flight.id,
          seatNumber: selectedSeat.seat_number,
          ...form
        })
      })

      const payload = await response.json()

      if (!response.ok) {
        throw new Error(payload.error ?? 'Unable to reserve seat')
      }

      router.push(`/confirmation/${payload.bookingId}`)
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Unable to reserve seat')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="space-y-6 lg:space-y-8">
      <section className="card relative overflow-hidden">
        <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-brand-400 via-sky-300 to-transparent" />
        <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-brand-600">Flight details</p>
            <h1 className="mt-3 text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl">
              {flight.flight_no}: {flight.origin} → {flight.destination}
            </h1>
            <p className="mt-2 text-sm text-slate-600">{flight.aircraft_type} • Departs {formatDateTime(flight.departs_at)}</p>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 lg:w-auto">
            <div className="rounded-2xl bg-slate-50 px-4 py-3">
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                <PlaneTakeoff className="h-4 w-4 text-brand-500" />
                Departing
              </div>
              <p className="mt-2 text-sm font-medium text-slate-900">{formatDateTime(flight.departs_at)}</p>
            </div>
            <div className="rounded-2xl bg-brand-50 px-4 py-3 ring-1 ring-brand-100">
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-brand-700">
                <CreditCard className="h-4 w-4" />
                Base price
              </div>
              <p className="mt-2 text-2xl font-bold text-slate-900">${flight.base_price.toFixed(2)}</p>
            </div>
          </div>
        </div>
      </section>

      <SeatMap flightId={flight.id} seats={seats} />

      <section className="card">
        <div className="flex flex-col gap-4 border-b border-slate-100 pb-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-brand-600">Passenger details</p>
            <h2 className="mt-2 text-2xl font-semibold text-slate-900 sm:text-[1.75rem]">Complete your booking</h2>
          </div>
          <div className="inline-flex items-center gap-2 rounded-full bg-slate-50 px-4 py-2 text-sm text-slate-600 border border-slate-100">
            <Ticket className="h-4 w-4 text-brand-600" />
            {selectedSeat ? `Selected seat: ${selectedSeat.seat_number}` : 'Select a seat to continue'}
          </div>
        </div>

        <form onSubmit={handleSubmit} className="mt-6 grid gap-5 lg:grid-cols-2">
          <div className="space-y-4">
            <label className="block text-sm font-medium text-slate-700">
              <span className="block mb-2">Full name</span>
              <input
                name="full_name"
                value={form.full_name}
                onChange={handleChange}
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3.5 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-brand-500 focus:bg-white focus:ring-4 focus:ring-brand-100"
                required
              />
            </label>
            <label className="block text-sm font-medium text-slate-700">
              <span className="block mb-2">Passport no</span>
              <input
                name="passport_no"
                value={form.passport_no}
                onChange={handleChange}
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3.5 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-brand-500 focus:bg-white focus:ring-4 focus:ring-brand-100"
                required
              />
            </label>
          </div>

          <div className="space-y-4">
            <label className="block text-sm font-medium text-slate-700">
              <span className="block mb-2">Nationality</span>
              <input
                name="nationality"
                value={form.nationality}
                onChange={handleChange}
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3.5 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-brand-500 focus:bg-white focus:ring-4 focus:ring-brand-100"
                required
              />
            </label>
            <label className="block text-sm font-medium text-slate-700">
              <span className="block mb-2">Date of birth</span>
              <input
                name="dob"
                type="date"
                value={form.dob}
                onChange={handleChange}
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3.5 text-slate-900 outline-none transition focus:border-brand-500 focus:bg-white focus:ring-4 focus:ring-brand-100"
                required
              />
            </label>
          </div>

          <div className="lg:col-span-2">
            {errorMessage ? (
              <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                <Info className="mr-2 inline-block h-4 w-4 align-[-2px]" />
                {errorMessage}
              </div>
            ) : null}

            <div className="mt-4 flex flex-wrap items-center gap-3">
              <button
                type="submit"
                disabled={submitting || !selectedSeat}
                className="inline-flex items-center justify-center rounded-full bg-brand-600 px-6 py-3 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:brightness-110 disabled:cursor-not-allowed disabled:bg-slate-300"
              >
                {submitting ? 'Reserving seat...' : 'Reserve seat'}
              </button>
              <div className="text-sm text-slate-500">Secure checkout is handled through your booking account.</div>
            </div>
          </div>
        </form>
      </section>
    </div>
  )
}