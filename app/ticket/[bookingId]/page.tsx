import Link from 'next/link'
import { notFound } from 'next/navigation'
import { BadgeCheck, CalendarDays, FileText, Plane, Ticket, UserCircle2 } from 'lucide-react'
import { supabaseAdmin } from '../../../lib/supabase/server'
import { formatDateTime } from '../../../lib/formatDateTime'

type BookingRow = {
  id: string
  status: string
  total_price: number | string
  pnr_code: string
  flights:
    | Array<{
        flight_no: string | null
        origin: string | null
        destination: string | null
        departs_at: string | null
        arrives_at: string | null
        aircraft_type: string | null
      }>
    | {
        flight_no: string | null
        origin: string | null
        destination: string | null
        departs_at: string | null
        arrives_at: string | null
        aircraft_type: string | null
      }
    | null
  seats:
    | Array<{
        seat_number: string | null
        class: string | null
      }>
    | {
        seat_number: string | null
        class: string | null
      }
    | null
  passengers:
    | Array<{
        full_name: string | null
      }>
    | {
        full_name: string | null
      }
    | null
}

export default async function TicketPage({ params }: { params: { bookingId: string } }) {
  const { data: booking, error } = await supabaseAdmin
    .from('bookings')
    .select(
      'id, status, total_price, pnr_code, flights(flight_no, origin, destination, departs_at, arrives_at, aircraft_type), seats(seat_number, class), passengers(full_name)'
    )
    .eq('id', params.bookingId)
    .single()

  if (error || !booking) {
    notFound()
  }

  const bookingRow = booking as unknown as BookingRow
  const flight = Array.isArray(bookingRow.flights) ? bookingRow.flights[0] : bookingRow.flights
  const seat = Array.isArray(bookingRow.seats) ? bookingRow.seats[0] : bookingRow.seats
  const passenger = Array.isArray(bookingRow.passengers) ? bookingRow.passengers[0] : bookingRow.passengers

  const isCancelled = bookingRow.status === 'cancelled'
  const isRescheduled = bookingRow.status === 'rescheduled'

  const statusClasses = isCancelled
    ? 'bg-rose-50 text-rose-700 ring-1 ring-rose-100'
    : isRescheduled
      ? 'bg-amber-50 text-amber-700 ring-1 ring-amber-100'
      : 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100'

  return (
    <section className="card overflow-hidden">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="max-w-2xl">
          <p className={['inline-flex items-center gap-2 rounded-full px-3 py-1 text-sm font-semibold', statusClasses].join(' ')}>
            <BadgeCheck className="h-4 w-4" /> {bookingRow.status}
          </p>
          <h1 className="mt-4 text-4xl font-semibold tracking-tight text-slate-950 sm:text-5xl">
            {isCancelled ? 'Ticket cancelled' : isRescheduled ? 'Ticket updated' : 'Ticket status'}
          </h1>
          <p className="mt-3 text-slate-600">
            {isCancelled
              ? 'This ticket is cancelled and should not be used for travel.'
              : 'Scan status details below for the latest public ticket information.'}
          </p>
        </div>

        <div className="rounded-3xl bg-brand-50 px-5 py-4 ring-1 ring-brand-100">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-700">PNR</p>
          <p className="mt-2 text-3xl font-extrabold tracking-[0.18em] text-slate-900">{bookingRow.pnr_code}</p>
        </div>
      </div>

      <div className="mt-8 grid gap-4 lg:grid-cols-[1.05fr_0.95fr]">
        <div className="rounded-[1.75rem] border border-slate-200 bg-slate-950 p-5 text-white shadow-soft-lg">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-sm text-slate-300">Public ticket</p>
              <h2 className="mt-2 text-2xl font-semibold">Status overview</h2>
            </div>
            <div className="rounded-full bg-white/10 px-3 py-1 text-sm font-medium text-white/90 capitalize">
              {bookingRow.status}
            </div>
          </div>

          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            <div className="rounded-2xl bg-white/10 p-4 ring-1 ring-white/10">
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-slate-300"><Plane className="h-4 w-4" /> Flight number</div>
              <p className="mt-2 text-sm font-medium text-white">{flight?.flight_no ?? '-'}</p>
            </div>
            <div className="rounded-2xl bg-white/10 p-4 ring-1 ring-white/10">
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-slate-300"><Ticket className="h-4 w-4" /> Seat number</div>
              <p className="mt-2 text-sm font-medium text-white">{seat?.seat_number ?? '-'}</p>
            </div>
            <div className="rounded-2xl bg-white/10 p-4 ring-1 ring-white/10">
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-slate-300"><CalendarDays className="h-4 w-4" /> Departure</div>
              <p className="mt-2 text-sm font-medium text-white">{flight?.departs_at ? formatDateTime(flight.departs_at) : '-'}</p>
            </div>
            <div className="rounded-2xl bg-white/10 p-4 ring-1 ring-white/10">
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-slate-300"><CalendarDays className="h-4 w-4" /> Arrival</div>
              <p className="mt-2 text-sm font-medium text-white">{flight?.arrives_at ? formatDateTime(flight.arrives_at) : '-'}</p>
            </div>
            <div className="rounded-2xl bg-white/10 p-4 ring-1 ring-white/10">
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-slate-300"><FileText className="h-4 w-4" /> Route</div>
              <p className="mt-2 text-sm font-medium text-white">{flight?.origin ?? '-'} → {flight?.destination ?? '-'}</p>
            </div>
            <div className="rounded-2xl bg-white/10 p-4 ring-1 ring-white/10">
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-slate-300"><Ticket className="h-4 w-4" /> Total price</div>
              <p className="mt-2 text-sm font-medium text-white">{typeof bookingRow.total_price === 'number' ? `$${bookingRow.total_price.toFixed(2)}` : bookingRow.total_price}</p>
            </div>
          </div>

          {isCancelled ? (
            <div className="mt-5 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-rose-700">
              <p className="text-sm font-semibold uppercase tracking-[0.18em]">Cancelled ticket</p>
              <p className="mt-2 text-sm">This booking is cancelled and no longer valid for travel.</p>
            </div>
          ) : null}

          {isRescheduled ? (
            <div className="mt-5 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-amber-800">
              <p className="text-sm font-semibold uppercase tracking-[0.18em]">Rescheduled ticket</p>
              <p className="mt-2 text-sm">The itinerary below reflects the latest updated flight and seat.</p>
            </div>
          ) : null}
        </div>

        <div className="space-y-4">
          <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-brand-600">Passenger</p>
            <div className="mt-4 space-y-2 text-sm text-slate-600">
              <p className="flex items-center gap-2 font-medium text-slate-900">
                <UserCircle2 className="h-4 w-4 text-brand-600" />
                {passenger?.full_name ?? '-'}
              </p>
            </div>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-brand-600">Latest itinerary</p>
            <div className="mt-4 space-y-2 text-sm text-slate-600">
              <p>Flight: {flight?.flight_no ?? '-'}</p>
              <p>Route: {flight?.origin ?? '-'} → {flight?.destination ?? '-'}</p>
              <p>Departure: {flight?.departs_at ? formatDateTime(flight.departs_at) : '-'}</p>
              <p>Arrival: {flight?.arrives_at ? formatDateTime(flight.arrives_at) : '-'}</p>
              <p>Seat: {seat?.seat_number ?? '-'}</p>
            </div>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-brand-600">Actions</p>
            <div className="mt-4 flex flex-col gap-3 sm:flex-row">
              <Link href="/search" className="inline-flex items-center justify-center rounded-full bg-brand-600 px-5 py-3 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:brightness-110">
                Search flights
              </Link>
              <Link href="/bookings" className="inline-flex items-center justify-center rounded-full border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:-translate-y-0.5 hover:border-brand-300 hover:text-brand-700">
                My bookings
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}